import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Pencil, 
  Eraser, 
  Crop, 
  Undo2, 
  Trash2, 
  Check, 
  Save,
  Palette
} from 'lucide-react';

const COLORS = [
  { id: 'red', hex: '#ef4444', label: 'แดง' },
  { id: 'yellow', hex: '#facc15', label: 'เหลือง' },
  { id: 'blue', hex: '#38bdf8', label: 'ฟ้า' },
  { id: 'green', hex: '#22c55e', label: 'เขียว' },
  { id: 'white', hex: '#ffffff', label: 'ขาว' },
  { id: 'black', hex: '#18181b', label: 'ดำ' }
];

const BRUSH_SIZES = [
  { id: 'thin', px: 3, label: 'บาง' },
  { id: 'medium', px: 7, label: 'กลาง' },
  { id: 'thick', px: 14, label: 'หนา' }
];

export default function ImageViewerModal({ isOpen, src, alt = 'รูปภาพ', onClose, onSave }) {
  if (!isOpen || !src || typeof document === 'undefined') return null;

  // Active working image src (changes if cropped)
  const [currentSrc, setCurrentSrc] = useState(src);

  // Mode: 'view' | 'edit'
  const [isEditing, setIsEditing] = useState(false);

  // View mode zoom & pan states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Edit mode tool states: 'draw' | 'eraser' | 'crop'
  const [activeTool, setActiveTool] = useState('draw');
  const [brushColor, setBrushColor] = useState('#ef4444'); // Default red for marking blueprints
  const [brushSize, setBrushSize] = useState(7);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Drawing strokes history stack for infinite undo
  // Stroke: { tool: 'draw' | 'eraser', color, size, points: [{x, y}] }
  const [strokes, setStrokes] = useState([]);
  const isDrawing = useRef(false);
  const currentStroke = useRef(null);

  // Crop overlay state (normalized 0 to 1)
  const [cropRect, setCropRect] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const cropDragState = useRef({ isDragging: false, handle: null, startX: 0, startY: 0, startRect: null });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Touch tracking refs for View Mode (Pinch to zoom)
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    startPanX: 0,
    startPanY: 0,
    isPinching: false,
    isPanning: false,
    lastTapTime: 0
  });

  const mouseState = useRef({
    isMouseDown: false,
    startX: 0,
    startY: 0,
    origPosX: 0,
    origPosY: 0
  });

  // Sync currentSrc when src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsEditing(false);
    setStrokes([]);
  }, [src, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Redraw canvas whenever strokes change or image loads
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (!stroke.points || stroke.points.length === 0) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes]);

  useEffect(() => {
    if (isEditing) {
      redrawCanvas();
    }
  }, [isEditing, redrawCanvas]);

  // View bounds clamp
  const clampPosition = useCallback((newX, newY, currentScale) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    if (!containerRef.current) return { x: newX, y: newY };
    const rect = containerRef.current.getBoundingClientRect();
    const maxPanX = (rect.width * (currentScale - 1)) / 2;
    const maxPanY = (rect.height * (currentScale - 1)) / 2;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    };
  }, []);

  // Download image file
  const handleDownload = (dataUrlToSave) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrlToSave || currentSrc;
      link.download = `our_home_image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(dataUrlToSave || currentSrc, '_blank');
    }
  };

  // ZOOM CONTROLS
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.6, 6));
  const handleZoomOut = () => setScale(prev => {
    const next = Math.max(prev - 0.6, 1);
    if (next === 1) setPosition({ x: 0, y: 0 });
    return next;
  });
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // TOUCH GESTURES (View Mode - Pinch to Zoom & Pan)
  const handleTouchStartView = (e) => {
    const now = Date.now();
    const ts = touchState.current;

    if (e.touches.length === 1) {
      if (now - ts.lastTapTime < 300) {
        if (scale > 1.2) {
          handleResetZoom();
        } else {
          setScale(2.5);
          setPosition({ x: 0, y: 0 });
        }
        ts.lastTapTime = 0;
        return;
      }
      ts.lastTapTime = now;

      if (scale > 1) {
        setIsInteracting(true);
        ts.isPanning = true;
        ts.startPanX = e.touches[0].clientX - position.x;
        ts.startPanY = e.touches[0].clientY - position.y;
      }
    } else if (e.touches.length === 2) {
      setIsInteracting(true);
      ts.isPinching = true;
      ts.isPanning = false;
      ts.initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      ts.initialScale = scale;
    }
  };

  const handleTouchMoveView = (e) => {
    const ts = touchState.current;
    if (e.touches.length === 2 && ts.isPinching) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (ts.initialDistance > 0) {
        const factor = currentDist / ts.initialDistance;
        const newScale = Math.min(Math.max(ts.initialScale * factor, 1), 6);
        setScale(newScale);
        if (newScale <= 1) setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && ts.isPanning && scale > 1) {
      e.preventDefault();
      const rawX = e.touches[0].clientX - ts.startPanX;
      const rawY = e.touches[0].clientY - ts.startPanY;
      setPosition(clampPosition(rawX, rawY, scale));
    }
  };

  const handleTouchEndView = (e) => {
    const ts = touchState.current;
    if (e.touches.length === 0) {
      setIsInteracting(false);
      ts.isPinching = false;
      ts.isPanning = false;
      if (scale <= 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      ts.isPinching = false;
      ts.isPanning = true;
      ts.startPanX = e.touches[0].clientX - position.x;
      ts.startPanY = e.touches[0].clientY - position.y;
    }
  };

  // MOUSE DRAG & WHEEL (View Mode)
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 0.833;
    setScale(prev => {
      const next = Math.min(Math.max(prev * factor, 1), 6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDownView = (e) => {
    if (e.button !== 0 || scale <= 1) return;
    setIsInteracting(true);
    mouseState.current = {
      isMouseDown: true,
      startX: e.clientX,
      startY: e.clientY,
      origPosX: position.x,
      origPosY: position.y
    };
  };

  const handleMouseMoveView = (e) => {
    const ms = mouseState.current;
    if (!ms.isMouseDown || scale <= 1) return;
    const deltaX = e.clientX - ms.startX;
    const deltaY = e.clientY - ms.startY;
    setPosition(clampPosition(ms.origPosX + deltaX, ms.origPosY + deltaY, scale));
  };

  const handleMouseUpView = () => {
    mouseState.current.isMouseDown = false;
    setIsInteracting(false);
  };

  // ================= EDIT MODE: DRAW & ERASER LOGIC =================
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDownDraw = (e) => {
    if (activeTool === 'crop') return;
    e.preventDefault();
    isDrawing.current = true;
    const pt = getCanvasCoords(e);
    currentStroke.current = {
      tool: activeTool,
      color: brushColor,
      size: brushSize,
      points: [pt]
    };

    // Draw initial dot
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      }
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerMoveDraw = (e) => {
    if (!isDrawing.current || !currentStroke.current || activeTool === 'crop') return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    currentStroke.current.points.push(pt);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const pts = currentStroke.current.points;
      if (pts.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        if (activeTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = brushColor;
        }
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handlePointerUpDraw = () => {
    if (isDrawing.current && currentStroke.current) {
      setStrokes(prev => [...prev, currentStroke.current]);
      currentStroke.current = null;
    }
    isDrawing.current = false;
  };

  // UNDO & CLEAR
  const handleUndo = () => {
    setStrokes(prev => {
      const updated = prev.slice(0, -1);
      return updated;
    });
  };

  const handleClearStrokes = () => {
    setStrokes([]);
  };

  // ================= EDIT MODE: CROP LOGIC =================
  const handleCropPreset = (aspect) => {
    if (aspect === 'free') {
      setCropRect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
    } else if (aspect === '1:1') {
      setCropRect({ x: 0.2, y: 0.2, w: 0.6, h: 0.6 });
    } else if (aspect === '16:9') {
      setCropRect({ x: 0.1, y: 0.25, w: 0.8, h: 0.45 });
    } else if (aspect === '4:3') {
      setCropRect({ x: 0.1, y: 0.2, w: 0.8, h: 0.6 });
    }
  };

  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const sx = Math.max(0, Math.floor(cropRect.x * naturalW));
    const sy = Math.max(0, Math.floor(cropRect.y * naturalH));
    const sw = Math.min(naturalW - sx, Math.floor(cropRect.w * naturalW));
    const sh = Math.min(naturalH - sy, Math.floor(cropRect.h * naturalH));

    if (sw <= 10 || sh <= 10) return;

    // Create offscreen canvas to bake image + crop
    const offCanvas = document.createElement('canvas');
    offCanvas.width = sw;
    offCanvas.height = sh;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // 1. Draw base cropped image
    offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    // 2. Draw existing strokes that fall into this crop area
    const canvas = canvasRef.current;
    if (canvas && strokes.length > 0) {
      const scaleCanvasX = naturalW / canvas.width;
      const scaleCanvasY = naturalH / canvas.height;
      offCtx.save();
      offCtx.translate(-sx, -sy);
      offCtx.scale(scaleCanvasX, scaleCanvasY);
      for (const stroke of strokes) {
        if (!stroke.points || stroke.points.length === 0) continue;
        offCtx.save();
        offCtx.lineCap = 'round';
        offCtx.lineJoin = 'round';
        offCtx.lineWidth = stroke.size;
        if (stroke.tool === 'eraser') {
          offCtx.globalCompositeOperation = 'destination-out';
        } else {
          offCtx.globalCompositeOperation = 'source-over';
          offCtx.strokeStyle = stroke.color;
        }
        offCtx.beginPath();
        offCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          offCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        offCtx.stroke();
        offCtx.restore();
      }
      offCtx.restore();
    }

    const croppedDataUrl = offCanvas.toDataURL('image/jpeg', 0.94);
    setCurrentSrc(croppedDataUrl);
    setStrokes([]);
    setActiveTool('draw');
  };

  // ================= SAVE & EXPORT MERGED IMAGE =================
  const handleSaveMergedImage = () => {
    const img = imageRef.current;
    if (!img) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = naturalW;
    offCanvas.height = naturalH;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Draw base image
    offCtx.drawImage(img, 0, 0, naturalW, naturalH);

    // Draw overlay strokes scaled to natural image resolution
    const canvas = canvasRef.current;
    if (canvas && strokes.length > 0) {
      const scaleCanvasX = naturalW / canvas.width;
      const scaleCanvasY = naturalH / canvas.height;
      offCtx.save();
      offCtx.scale(scaleCanvasX, scaleCanvasY);
      for (const stroke of strokes) {
        if (!stroke.points || stroke.points.length === 0) continue;
        offCtx.save();
        offCtx.lineCap = 'round';
        offCtx.lineJoin = 'round';
        offCtx.lineWidth = stroke.size;
        if (stroke.tool === 'eraser') {
          offCtx.globalCompositeOperation = 'destination-out';
        } else {
          offCtx.globalCompositeOperation = 'source-over';
          offCtx.strokeStyle = stroke.color;
        }
        offCtx.beginPath();
        offCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          offCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        offCtx.stroke();
        offCtx.restore();
      }
      offCtx.restore();
    }

    const exportedDataUrl = offCanvas.toDataURL('image/jpeg', 0.94);

    // 1. Download to user's device
    handleDownload(exportedDataUrl);

    // 2. If parent provided onSave callback (e.g. Note attachment update), pass it!
    if (onSave) {
      onSave(exportedDataUrl);
    }

    // Update view with the merged result
    setCurrentSrc(exportedDataUrl);
    setStrokes([]);
    setIsEditing(false);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-stone-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in touch-none"
      onMouseMove={!isEditing ? handleMouseMoveView : undefined}
      onMouseUp={!isEditing ? handleMouseUpView : undefined}
    >
      {/* ================= TOP CONTROLS BAR ================= */}
      <div 
        className="flex items-center justify-between z-30 pt-[max(env(safe-area-inset-top),12px)] px-3 sm:px-5 pb-2 bg-gradient-to-b from-stone-950/90 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm text-white/90 font-medium truncate max-w-[160px] sm:max-w-xs px-2.5 py-1 bg-white/10 rounded-xl backdrop-blur-md">
            {isEditing ? '✏️ กำลังแก้ไขรูป' : alt}
          </span>
          {!isEditing && scale > 1 && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded-lg">
              {Math.round(scale * 100)}%
            </span>
          )}
          {isSavedFeedback && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600 px-2 py-0.5 rounded-lg animate-bounce">
              ✓ บันทึกสำเร็จแล้ว
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* View Mode Actions */}
          {!isEditing ? (
            <>
              {/* Enter Edit Mode Button (Req 3) */}
              <button
                onClick={() => {
                  handleResetZoom();
                  setIsEditing(true);
                  setActiveTool('draw');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold backdrop-blur-md active:scale-95 transition-all shadow-md"
                title="วาด, ลบ, หรือครอบตัดรูปนี้"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>แก้ไขรูป</span>
              </button>

              {/* Download / Save Button */}
              <button
                onClick={() => handleDownload()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md active:scale-95 transition-all shadow-md"
                title="บันทึกรูปภาพลงเครื่อง"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">บันทึก</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all"
                aria-label="ปิดรูปภาพ"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Edit Mode Actions */
            <>
              {/* Undo Button */}
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30 text-white flex items-center justify-center active:scale-95 transition-all"
                title="ย้อนกลับ (Undo)"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* Clear All Drawings */}
              {strokes.length > 0 && (
                <button
                  onClick={handleClearStrokes}
                  className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 flex items-center justify-center active:scale-95 transition-all"
                  title="ล้างที่วาดทั้งหมด"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Save Edits Button */}
              <button
                onClick={handleSaveMergedImage}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
                title="บันทึกการแก้ไขลงรูปภาพ"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึก</span>
              </button>

              {/* Exit Edit Mode Button */}
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStrokes([]);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-all"
                title="ยกเลิกการแก้ไข"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= MAIN INTERACTIVE VIEWPORT ================= */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-2 overflow-hidden w-full h-full"
        onTouchStart={!isEditing ? handleTouchStartView : undefined}
        onTouchMove={!isEditing ? handleTouchMoveView : undefined}
        onTouchEnd={!isEditing ? handleTouchEndView : undefined}
        onTouchCancel={!isEditing ? handleTouchEndView : undefined}
        onWheel={!isEditing ? handleWheel : undefined}
        onMouseDown={!isEditing ? handleMouseDownView : undefined}
      >
        <div className="relative inline-block max-w-[96vw] max-h-[76vh]">
          {/* Base Image */}
          <img
            ref={imageRef}
            src={currentSrc}
            alt={alt}
            draggable={false}
            onLoad={() => {
              if (canvasRef.current && imageRef.current) {
                canvasRef.current.width = imageRef.current.clientWidth;
                canvasRef.current.height = imageRef.current.clientHeight;
                redrawCanvas();
              }
            }}
            style={{
              transform: !isEditing ? `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` : 'none',
              transition: isInteracting ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)',
              transformOrigin: 'center center',
              maxWidth: '96vw',
              maxHeight: isEditing ? '70vh' : '76vh',
              objectFit: 'contain',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              display: 'block'
            }}
            className="rounded-2xl shadow-2xl"
          />

          {/* Interactive Annotation Canvas Overlay (Edit Mode) */}
          {isEditing && (
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full rounded-2xl z-20 ${
                activeTool === 'crop' ? 'pointer-events-none' : 'cursor-crosshair'
              }`}
              onPointerDown={handlePointerDownDraw}
              onPointerMove={handlePointerMoveDraw}
              onPointerUp={handlePointerUpDraw}
              onPointerCancel={handlePointerUpDraw}
            />
          )}

          {/* Interactive Crop Box Overlay (Crop Mode) */}
          {isEditing && activeTool === 'crop' && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              {/* Dark Mask Outside Crop Box */}
              <div 
                className="absolute inset-0 bg-black/60"
                style={{
                  clipPath: `polygon(
                    0% 0%, 100% 0%, 100% 100%, 0% 100%,
                    0% ${cropRect.y * 100}%,
                    ${cropRect.x * 100}% ${cropRect.y * 100}%,
                    ${cropRect.x * 100}% ${(cropRect.y + cropRect.h) * 100}%,
                    ${(cropRect.x + cropRect.w) * 100}% ${(cropRect.y + cropRect.h) * 100}%,
                    ${(cropRect.x + cropRect.w) * 100}% ${cropRect.y * 100}%,
                    0% ${cropRect.y * 100}%
                  )`
                }}
              />

              {/* Crop Bounding Box with Handles */}
              <div
                className="absolute border-2 border-dashed border-amber-400 pointer-events-auto shadow-2xl shadow-black/80"
                style={{
                  left: `${cropRect.x * 100}%`,
                  top: `${cropRect.y * 100}%`,
                  width: `${cropRect.w * 100}%`,
                  height: `${cropRect.h * 100}%`
                }}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-amber-200" />
                  <div className="border-r border-b border-amber-200" />
                  <div className="border-b border-amber-200" />
                  <div className="border-r border-b border-amber-200" />
                  <div className="border-r border-b border-amber-200" />
                  <div className="border-b border-amber-200" />
                  <div className="border-r border-amber-200" />
                  <div className="border-r border-amber-200" />
                  <div />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= FLOATING BOTTOM CONTROLS ================= */}
      <div className="z-30 pb-[max(env(safe-area-inset-bottom),14px)] px-3 flex flex-col items-center gap-2 bg-gradient-to-t from-stone-950/90 to-transparent">
        
        {/* VIEW MODE TOOLBAR */}
        {!isEditing ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 dark:bg-stone-900/80 backdrop-blur-md border border-white/10 shadow-lg">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
                title="ย่อขนาด (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-amber-300 hover:text-amber-200 active:scale-95 transition-all"
                title="รีเซ็ตขนาดปกติ (1x)"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 6}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
                title="ขยายขนาด (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {scale > 1 && (
                <button
                  onClick={handleResetZoom}
                  className="ml-1 p-1 rounded-full text-stone-300 hover:text-white"
                  title="รีเซ็ตกลับ 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-center text-[10px] sm:text-[11px] text-white/60 pointer-events-none">
              {scale > 1 ? (
                <span>👆 ลากนิ้วเพื่อเลื่อนดูส่วนต่างๆ • แตะ 2 ครั้งเพื่อรีเซ็ต</span>
              ) : (
                <span>💡 ใช้ 2 นิ้วถ่าง (Pinch) เพื่อซูม • หรือกดปุ่ม "แก้ไขรูป" เพื่อวาด/ครอบตัด</span>
              )}
            </div>
          </>
        ) : (
          /* EDIT MODE TOOLBAR (Req 3: Crop, Draw, Eraser, Undo) */
          <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-md rounded-2xl border border-white/15 p-2.5 space-y-2 shadow-2xl animate-slide-up">
            
            {/* Tool Selector Buttons */}
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => setActiveTool('draw')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'draw'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>วาด</span>
              </button>

              <button
                onClick={() => setActiveTool('eraser')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>ยางลบ</span>
              </button>

              <button
                onClick={() => setActiveTool('crop')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'crop'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>ครอบตัด</span>
              </button>
            </div>

            {/* Sub-bar for DRAW tool (Color & Brush Size) */}
            {activeTool === 'draw' && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                {/* Color Palette */}
                <div className="flex items-center gap-1.5">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setBrushColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        brushColor === c.hex ? 'scale-125 border-white shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>

                {/* Brush Size Picker */}
                <div className="flex items-center gap-1">
                  {BRUSH_SIZES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setBrushSize(s.px)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                        brushSize === s.px ? 'bg-white text-stone-950 shadow-xs' : 'bg-white/10 text-white'
                      }`}
                    >
                      {s.label[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-bar for CROP tool (Presets & Apply) */}
            {activeTool === 'crop' && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCropPreset('free')}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px]"
                  >
                    อิสระ
                  </button>
                  <button
                    onClick={() => handleCropPreset('1:1')}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px]"
                  >
                    1:1
                  </button>
                  <button
                    onClick={() => handleCropPreset('16:9')}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px]"
                  >
                    16:9
                  </button>
                </div>

                <button
                  onClick={handleApplyCrop}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ครอบตัดทันที</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
