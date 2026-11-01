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
  Redo2,
  Trash2, 
  Check, 
  Save,
  Shapes,
  Square,
  Circle as CircleIcon,
  Minus,
  ArrowRight,
  Target
} from 'lucide-react';

const COLORS = [
  { id: 'red', hex: '#ef4444', label: 'แดง' },
  { id: 'yellow', hex: '#facc15', label: 'เหลือง' },
  { id: 'blue', hex: '#38bdf8', label: 'ฟ้า' },
  { id: 'green', hex: '#22c55e', label: 'เขียว' },
  { id: 'white', hex: '#ffffff', label: 'ขาว' },
  { id: 'black', hex: '#18181b', label: 'ดำ' }
];

const PEN_PRESETS = [
  { label: 'บาง', px: 3 },
  { label: 'กลาง', px: 6 },
  { label: 'หนา', px: 12 },
  { label: 'ใหญ่', px: 22 }
];

const ERASER_PRESETS = [
  { label: 'เล็ก', px: 10 },
  { label: 'กลาง', px: 24 },
  { label: 'ใหญ่', px: 45 },
  { label: 'จัมโบ้', px: 70 }
];

const SHAPE_PRESETS = [
  { label: 'บาง', px: 3 },
  { label: 'กลาง', px: 6 },
  { label: 'หนา', px: 10 },
  { label: 'เด่น', px: 16 }
];

// Helper: Distance squared from point to line segment
function distToSegmentSquared(p, v, w) {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return (p.x - v.x) * (p.x - v.x) + (p.y - v.y) * (p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p.x - (v.x + t * (w.x - v.x))) * (p.x - (v.x + t * (w.x - v.x))) +
         (p.y - (v.y + t * (w.y - v.y))) * (p.y - (v.y + t * (w.y - v.y)));
}

function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

// Hit-testing function for Object Eraser
function isHitItem(pt, item) {
  if (!item) return false;
  const hitDist = Math.max(18, (item.size || 6) * 1.5);

  if (item.type === 'pen' || item.type === 'eraser') {
    if (!item.points || item.points.length === 0) return false;
    if (item.points.length === 1) {
      return Math.hypot(pt.x - item.points[0].x, pt.y - item.points[0].y) <= hitDist;
    }
    for (let i = 0; i < item.points.length - 1; i++) {
      if (distToSegment(pt, item.points[i], item.points[i + 1]) <= hitDist) {
        return true;
      }
    }
    return false;
  }

  if (item.type === 'shape') {
    const { shapeType, start, end } = item;
    if (!start || !end) return false;

    if (shapeType === 'line' || shapeType === 'arrow') {
      return distToSegment(pt, start, end) <= hitDist;
    }

    if (shapeType === 'rect') {
      const x1 = Math.min(start.x, end.x);
      const y1 = Math.min(start.y, end.y);
      const x2 = Math.max(start.x, end.x);
      const y2 = Math.max(start.y, end.y);
      // Border lines
      const d1 = distToSegment(pt, { x: x1, y: y1 }, { x: x2, y: y1 });
      const d2 = distToSegment(pt, { x: x1, y: y2 }, { x: x2, y: y2 });
      const d3 = distToSegment(pt, { x: x1, y: y1 }, { x: x1, y: y2 });
      const d4 = distToSegment(pt, { x: x2, y: y1 }, { x: x2, y: y2 });
      if (Math.min(d1, d2, d3, d4) <= hitDist) return true;
      // Inside rect
      if (pt.x >= x1 && pt.x <= x2 && pt.y >= y1 && pt.y <= y2) return true;
      return false;
    }

    if (shapeType === 'circle') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      if (rx < 1 || ry < 1) return false;
      const normDist = Math.hypot((pt.x - cx) / rx, (pt.y - cy) / ry);
      return normDist <= 1.25;
    }
  }

  return false;
}

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

  // Edit mode active tool: 'pen' | 'shape' | 'eraser' | 'crop'
  const [activeTool, setActiveTool] = useState('pen');

  // Pen settings (Req 1: scaling uniform width throughout drawing, no fountain pen simulation)
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(6);

  // Eraser settings (Req 2: adjustable size + object eraser mode)
  const [eraserMode, setEraserMode] = useState('pixel'); // 'pixel' | 'object'
  const [eraserSize, setEraserSize] = useState(24);

  // Shape settings (Req 3: rect, circle, line, arrow)
  const [shapeType, setShapeType] = useState('rect'); // 'rect' | 'circle' | 'line' | 'arrow'
  const [shapeColor, setShapeColor] = useState('#ef4444');
  const [shapeSize, setShapeSize] = useState(6);

  // UI state for Save button feedback
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // History stack for full Undo / Redo support (including Object Erasures and Shapes)
  const [strokes, setStrokes] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Crop overlay state (normalized 0 to 1)
  const [cropRect, setCropRect] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const cropDragState = useRef({ isDragging: false, handle: null, startX: 0, startY: 0, startRect: null });

  // Refs for drawing interactions
  const isPointerDown = useRef(false);
  const currentPenStroke = useRef(null);
  const shapeStartPt = useRef(null);
  const shapeCurrentPt = useRef(null);
  const isDeletingObject = useRef(false);

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
    setHistory([[]]);
    setHistoryIndex(0);
  }, [src, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // History management helper
  const pushHistoryState = useCallback((newStrokes) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, newStrokes];
    });
    setHistoryIndex(prev => prev + 1);
    setStrokes(newStrokes);
  }, [historyIndex]);

  // Universal renderer for a stroke or shape object
  const renderItem = (ctx, item) => {
    if (!item) return;

    if (item.type === 'eraser') {
      // Freehand pixel eraser
      if (!item.points || item.points.length === 0) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = item.size;
      ctx.globalCompositeOperation = 'destination-out';
      if (item.points.length === 1) {
        ctx.beginPath();
        ctx.arc(item.points[0].x, item.points[0].y, item.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (item.type === 'pen') {
      // Freehand pen: Uniform stroke width throughout, round caps (Req 1)
      if (!item.points || item.points.length === 0) {
        ctx.restore();
        return;
      }
      if (item.points.length === 1) {
        ctx.beginPath();
        ctx.arc(item.points[0].x, item.points[0].y, item.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    } else if (item.type === 'shape') {
      // Shapes: Rectangle, Circle, Line, Arrow (Req 3)
      const { shapeType: sType, start, end } = item;
      if (!start || !end) {
        ctx.restore();
        return;
      }

      if (sType === 'rect') {
        const rx = Math.min(start.x, end.x);
        const ry = Math.min(start.y, end.y);
        const rw = Math.abs(end.x - start.x);
        const rh = Math.abs(end.y - start.y);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (sType === 'circle') {
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (sType === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (sType === 'arrow') {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.hypot(dx, dy);

        // Draw line stem
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw triangular arrowhead at destination
        if (length > 2) {
          const headLen = Math.max(12, Math.min(32, item.size * 3));
          ctx.save();
          ctx.translate(end.x, end.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-headLen, -headLen * 0.45);
          ctx.lineTo(-headLen * 0.7, 0);
          ctx.lineTo(-headLen, headLen * 0.45);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  };

  // Redraw canvas with all committed strokes + optional live preview shape
  const redrawCanvas = useCallback((previewItem = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const item of strokes) {
      renderItem(ctx, item);
    }

    if (previewItem) {
      renderItem(ctx, previewItem);
    }
  }, [strokes]);

  // Sync canvas size with image size when entering Edit mode
  useEffect(() => {
    if (isEditing) {
      if (canvasRef.current && imageRef.current) {
        canvasRef.current.width = imageRef.current.clientWidth;
        canvasRef.current.height = imageRef.current.clientHeight;
      }
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
      x: Math.min(Math.max(newX, -maxPanX), maxPanX),
      y: Math.min(Math.max(newY, -maxPanY), maxPanY)
    };
  }, []);

  // Zoom helpers
  const handleZoomIn = () => {
    setScale(prev => {
      const next = Math.min(prev + 0.5, 6);
      setPosition(clampPosition(position.x, position.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      else setPosition(clampPosition(position.x, position.y, next));
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // TOUCH PINCH & PAN (View Mode)
  const getTouchDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStartView = (e) => {
    const ts = touchState.current;
    if (e.touches.length === 2) {
      e.preventDefault();
      ts.isPinching = true;
      ts.isPanning = false;
      ts.initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
      ts.initialScale = scale;
      setIsInteracting(true);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - ts.lastTapTime < 300) {
        e.preventDefault();
        if (scale > 1) {
          handleResetZoom();
        } else {
          setScale(2.5);
        }
        ts.lastTapTime = 0;
        return;
      }
      ts.lastTapTime = now;

      if (scale > 1) {
        ts.isPanning = true;
        ts.startPanX = e.touches[0].clientX - position.x;
        ts.startPanY = e.touches[0].clientY - position.y;
        setIsInteracting(true);
      }
    }
  };

  const handleTouchMoveView = (e) => {
    const ts = touchState.current;
    if (e.touches.length === 2 && ts.isPinching) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
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

  // ================= EDIT MODE: DRAW, SHAPES, & ERASER =================
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
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
    e.stopPropagation();
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {}

    const pt = getCanvasCoords(e);
    isPointerDown.current = true;

    // 1. OBJECT ERASER MODE (Req 2)
    if (activeTool === 'eraser' && eraserMode === 'object') {
      isDeletingObject.current = true;
      const hitIndex = strokes.findIndex(item => isHitItem(pt, item));
      if (hitIndex !== -1) {
        const nextStrokes = strokes.filter((_, idx) => idx !== hitIndex);
        pushHistoryState(nextStrokes);
      }
      return;
    }

    // 2. SHAPE DRAWING MODE (Req 3)
    if (activeTool === 'shape') {
      shapeStartPt.current = pt;
      shapeCurrentPt.current = pt;
      redrawCanvas({
        type: 'shape',
        shapeType,
        color: shapeColor,
        size: shapeSize,
        start: pt,
        end: pt
      });
      return;
    }

    // 3. FREEHAND PEN MODE (Req 1)
    if (activeTool === 'pen') {
      currentPenStroke.current = {
        id: 'stroke_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'pen',
        color: penColor,
        size: penSize,
        points: [pt]
      };

      // Draw initial uniform circle dot
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = penColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, penSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    // 4. PIXEL ERASER MODE (Req 2)
    if (activeTool === 'eraser' && eraserMode === 'pixel') {
      currentPenStroke.current = {
        id: 'erase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'eraser',
        size: eraserSize,
        points: [pt]
      };

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, eraserSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const handlePointerMoveDraw = (e) => {
    if (!isPointerDown.current || activeTool === 'crop') return;
    e.preventDefault();
    e.stopPropagation();
    const pt = getCanvasCoords(e);

    // 1. OBJECT ERASER DRAG (Req 2)
    if (activeTool === 'eraser' && eraserMode === 'object') {
      if (isDeletingObject.current) {
        const hitIndex = strokes.findIndex(item => isHitItem(pt, item));
        if (hitIndex !== -1) {
          const nextStrokes = strokes.filter((_, idx) => idx !== hitIndex);
          pushHistoryState(nextStrokes);
        }
      }
      return;
    }

    // 2. SHAPE LIVE PREVIEW (Req 3)
    if (activeTool === 'shape' && shapeStartPt.current) {
      shapeCurrentPt.current = pt;
      redrawCanvas({
        type: 'shape',
        shapeType,
        color: shapeColor,
        size: shapeSize,
        start: shapeStartPt.current,
        end: pt
      });
      return;
    }

    // 3. FREEHAND PEN / PIXEL ERASER DRAG
    if (currentPenStroke.current) {
      const stroke = currentPenStroke.current;
      stroke.points.push(pt);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && stroke.points.length >= 2) {
        const pts = stroke.points;
        const prevPt = pts[pts.length - 2];
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.size;

        if (stroke.type === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = stroke.color;
        }

        ctx.beginPath();
        ctx.moveTo(prevPt.x, prevPt.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handlePointerUpDraw = (e) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    isDeletingObject.current = false;

    // 1. Commit Shape
    if (activeTool === 'shape' && shapeStartPt.current && shapeCurrentPt.current) {
      const start = shapeStartPt.current;
      const end = shapeCurrentPt.current;
      const dist = Math.hypot(end.x - start.x, end.y - start.y);

      if (dist >= 4) {
        const newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          type: 'shape',
          shapeType,
          color: shapeColor,
          size: shapeSize,
          start,
          end
        };
        pushHistoryState([...strokes, newShape]);
      } else {
        redrawCanvas();
      }
      shapeStartPt.current = null;
      shapeCurrentPt.current = null;
      return;
    }

    // 2. Commit Freehand Stroke (Pen or Pixel Eraser)
    if (currentPenStroke.current) {
      pushHistoryState([...strokes, currentPenStroke.current]);
      currentPenStroke.current = null;
    }
  };

  // FULL UNDO / REDO / CLEAR (Works for Pen, Shapes, Object Eraser & Pixel Eraser)
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setStrokes(history[targetIndex] || []);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setStrokes(history[targetIndex] || []);
    }
  };

  const handleClearStrokes = () => {
    if (strokes.length > 0) {
      pushHistoryState([]);
    }
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
      for (const item of strokes) {
        renderItem(offCtx, item);
      }
      offCtx.restore();
    }

    const croppedDataUrl = offCanvas.toDataURL('image/jpeg', 0.94);
    setCurrentSrc(croppedDataUrl);
    setStrokes([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setActiveTool('pen');
  };

  // ================= SAVE & EXPORT MERGED IMAGE =================
  const handleDownload = (dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `home_note_image_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    // Draw overlay annotations scaled to natural image resolution
    const canvas = canvasRef.current;
    if (canvas && strokes.length > 0) {
      const scaleCanvasX = naturalW / canvas.width;
      const scaleCanvasY = naturalH / canvas.height;
      offCtx.save();
      offCtx.scale(scaleCanvasX, scaleCanvasY);
      for (const item of strokes) {
        renderItem(offCtx, item);
      }
      offCtx.restore();
    }

    const exportedDataUrl = offCanvas.toDataURL('image/jpeg', 0.94);

    // 1. Download to user's device
    handleDownload(exportedDataUrl);

    // 2. Update note attachment if callback provided
    if (onSave) {
      onSave(exportedDataUrl);
    }

    // 3. Visual feedback
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      setIsEditing(false);
    }, 1200);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
      onClick={(e) => {
        if (e.target === containerRef.current && !isEditing) {
          onClose();
        }
      }}
    >
      {/* ================= TOP FLOATING BAR ================= */}
      <div className="z-30 pt-[max(env(safe-area-inset-top),10px)] px-3 py-2 flex items-center justify-between gap-2 bg-gradient-to-b from-stone-950/90 to-transparent">
        {/* Left: Close Button / Cancel Edit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setStrokes([]);
                setHistory([[]]);
                setHistoryIndex(0);
              } else {
                onClose();
              }
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
            title={isEditing ? 'ยกเลิกการแก้ไข' : 'ปิด (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-white/90 drop-shadow-sm px-1 hidden sm:inline">
            {isEditing ? 'โหมดแก้ไขรูปภาพ' : alt}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isEditing ? (
            /* VIEW MODE ACTIONS */
            <>
              {/* Edit Mode Trigger Button */}
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                  setIsEditing(true);
                }}
                className="h-8 px-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                title="เปิดเครื่องมือแก้ไขรูป (วาด / รูปทรง / ยางลบ / ครอป)"
              >
                <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>แก้ไขรูป</span>
              </button>

              {/* Direct Download Button */}
              <button
                onClick={() => handleDownload(currentSrc)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
                title="บันทึกรูปลงเครื่อง"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* EDIT MODE ACTIONS (Undo, Redo, Clear, Save) */
            <>
              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
                title="เลิกทำ (Undo)"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              {/* Redo */}
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
                title="ทำซ้ำ (Redo)"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              {/* Clear Strokes */}
              <button
                onClick={handleClearStrokes}
                disabled={strokes.length === 0}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/30 disabled:opacity-30 text-rose-300 flex items-center justify-center active:scale-95 transition-all"
                title="ล้างทั้งหมด"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Save / Apply Merged Image */}
              <button
                onClick={handleSaveMergedImage}
                disabled={isSavedFeedback}
                className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md ${
                  isSavedFeedback 
                    ? 'bg-emerald-500 text-stone-950' 
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                }`}
                title="บันทึกและอัปเดตไฟล์แนบ"
              >
                {isSavedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>บันทึกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึก</span>
                  </>
                )}
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
              maxHeight: isEditing ? '68vh' : '76vh',
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
              style={{ touchAction: 'none' }}
              className={`absolute inset-0 w-full h-full rounded-2xl z-20 ${
                activeTool === 'crop' 
                  ? 'pointer-events-none' 
                  : activeTool === 'eraser' && eraserMode === 'object'
                    ? 'cursor-pointer'
                    : 'cursor-crosshair'
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

              {/* Crop Bounding Box */}
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
          /* EDIT MODE TOOLBAR (Req 1: Pen scaling, Req 2: Eraser + Object mode, Req 3: Shapes) */
          <div className="w-full max-w-md bg-stone-900/95 backdrop-blur-md rounded-2xl border border-white/15 p-2.5 space-y-2.5 shadow-2xl animate-slide-up">
            
            {/* Top Row: 4 Main Tool Tabs */}
            <div className="flex items-center justify-between gap-1">
              {/* 1. Pen */}
              <button
                onClick={() => setActiveTool('pen')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'pen'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>ปากกา</span>
              </button>

              {/* 2. Shapes */}
              <button
                onClick={() => setActiveTool('shape')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'shape'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Shapes className="w-3.5 h-3.5" />
                <span>รูปทรง</span>
              </button>

              {/* 3. Eraser */}
              <button
                onClick={() => setActiveTool('eraser')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'eraser'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>ยางลบ</span>
              </button>

              {/* 4. Crop */}
              <button
                onClick={() => setActiveTool('crop')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'crop'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>ครอบตัด</span>
              </button>
            </div>

            {/* ================= SUB-PANEL: PEN (Req 1) ================= */}
            {activeTool === 'pen' && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                {/* Color Palette */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setPenColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          penColor === c.hex ? 'scale-125 border-white shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>

                  {/* Size preview indicator dot */}
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-mono">
                    <div 
                      className="rounded-full shrink-0"
                      style={{ 
                        width: Math.max(4, Math.min(22, penSize)), 
                        height: Math.max(4, Math.min(22, penSize)),
                        backgroundColor: penColor 
                      }} 
                    />
                    <span>{penSize}px</span>
                  </div>
                </div>

                {/* Scaling Pen Size Slider & Quick Presets (Req 1: Uniform line width scaling) */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="36"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {PEN_PRESETS.map(p => (
                      <button
                        key={p.label}
                        onClick={() => setPenSize(p.px)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          penSize === p.px ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= SUB-PANEL: SHAPES (Req 3) ================= */}
            {activeTool === 'shape' && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                {/* Shape Type Selector Pills: Rect, Circle, Line, Arrow */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setShapeType('rect')}
                    className={`py-1 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      shapeType === 'rect' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>สี่เหลี่ยม</span>
                  </button>

                  <button
                    onClick={() => setShapeType('circle')}
                    className={`py-1 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      shapeType === 'circle' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <CircleIcon className="w-3.5 h-3.5" />
                    <span>วงกลม</span>
                  </button>

                  <button
                    onClick={() => setShapeType('line')}
                    className={`py-1 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      shapeType === 'line' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>เส้นตรง</span>
                  </button>

                  <button
                    onClick={() => setShapeType('arrow')}
                    className={`py-1 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      shapeType === 'arrow' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>ลูกศร</span>
                  </button>
                </div>

                {/* Color Palette & Shape Stroke Size */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setShapeColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          shapeColor === c.hex ? 'scale-125 border-white shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {SHAPE_PRESETS.map(s => (
                      <button
                        key={s.label}
                        onClick={() => setShapeSize(s.px)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          shapeSize === s.px ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= SUB-PANEL: ERASER (Req 2) ================= */}
            {activeTool === 'eraser' && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                {/* Mode Selector: Pixel Eraser vs Object Eraser */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEraserMode('pixel')}
                    className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      eraserMode === 'pixel' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>ลบตามรอย (พิกเซล)</span>
                  </button>

                  <button
                    onClick={() => setEraserMode('object')}
                    className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      eraserMode === 'object' ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>ลบทั้งชิ้น (Object)</span>
                  </button>
                </div>

                {/* Sub-controls based on eraserMode */}
                {eraserMode === 'pixel' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/70 shrink-0 font-mono">
                      ขนาด {eraserSize}px
                    </span>
                    <input
                      type="range"
                      min="4"
                      max="80"
                      value={eraserSize}
                      onChange={(e) => setEraserSize(Number(e.target.value))}
                      className="flex-1 accent-amber-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {ERASER_PRESETS.map(ep => (
                        <button
                          key={ep.label}
                          onClick={() => setEraserSize(ep.px)}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            eraserSize === ep.px ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {ep.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-1 px-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-medium text-center flex items-center justify-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>แตะหรือปาดผ่านเส้น / รูปทรง เพื่อลบทั้งชิ้นทันที</span>
                  </div>
                )}
              </div>
            )}

            {/* ================= SUB-PANEL: CROP ================= */}
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
                  <button
                    onClick={() => handleCropPreset('4:3')}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px]"
                  >
                    4:3
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
