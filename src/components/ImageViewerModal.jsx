import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function ImageViewerModal({ isOpen, src, alt = 'รูปภาพ', onClose }) {
  if (!isOpen || !src || typeof document === 'undefined') return null;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Touch tracking refs
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    startPanX: 0,
    startPanY: 0,
    isPinching: false,
    isPanning: false,
    lastTapTime: 0
  });

  // Mouse tracking refs
  const mouseState = useRef({
    isMouseDown: false,
    startX: 0,
    startY: 0,
    origPosX: 0,
    origPosY: 0
  });

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Keyboard shortcut (Escape to close, +/- to zoom)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale]);

  // Clamping helper for pan bounds
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

  // Handle direct download / save to phone
  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = src;
      link.download = `home_image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(src, '_blank');
    }
  };

  const handleZoomIn = () => {
    setScale(prev => {
      const next = Math.min(prev + 0.6, 6);
      return next;
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.6, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // TOUCH EVENT HANDLERS (Pinch-to-zoom & Pan)
  const handleTouchStart = (e) => {
    const now = Date.now();
    const ts = touchState.current;

    // Double-tap to toggle zoom (Req 3)
    if (e.touches.length === 1) {
      if (now - ts.lastTapTime < 300) {
        // Double tap triggered
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

      // Single touch pan when zoomed
      if (scale > 1) {
        setIsInteracting(true);
        ts.isPanning = true;
        ts.startPanX = e.touches[0].clientX - position.x;
        ts.startPanY = e.touches[0].clientY - position.y;
      }
    } else if (e.touches.length === 2) {
      // Two finger pinch start
      setIsInteracting(true);
      ts.isPinching = true;
      ts.isPanning = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      ts.initialDistance = dist;
      ts.initialScale = scale;
    }
  };

  const handleTouchMove = (e) => {
    const ts = touchState.current;

    if (e.touches.length === 2 && ts.isPinching) {
      e.preventDefault(); // Stop native page scroll/pinch
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (ts.initialDistance > 0) {
        const factor = currentDist / ts.initialDistance;
        const newScale = Math.min(Math.max(ts.initialScale * factor, 1), 6);
        setScale(newScale);
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && ts.isPanning && scale > 1) {
      e.preventDefault();
      const rawX = e.touches[0].clientX - ts.startPanX;
      const rawY = e.touches[0].clientY - ts.startPanY;
      const clamped = clampPosition(rawX, rawY, scale);
      setPosition(clamped);
    }
  };

  const handleTouchEnd = (e) => {
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
      // Switched from pinch to pan
      ts.isPinching = false;
      ts.isPanning = true;
      ts.startPanX = e.touches[0].clientX - position.x;
      ts.startPanY = e.touches[0].clientY - position.y;
    }
  };

  // MOUSE WHEEL & DRAG HANDLERS (Desktop)
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.833;
    setScale(prev => {
      const next = Math.min(Math.max(prev * zoomFactor, 1), 6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e) => {
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

  const handleMouseMove = (e) => {
    const ms = mouseState.current;
    if (!ms.isMouseDown || scale <= 1) return;
    const deltaX = e.clientX - ms.startX;
    const deltaY = e.clientY - ms.startY;
    const clamped = clampPosition(ms.origPosX + deltaX, ms.origPosY + deltaY, scale);
    setPosition(clamped);
  };

  const handleMouseUp = () => {
    mouseState.current.isMouseDown = false;
    setIsInteracting(false);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-stone-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in touch-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls Bar */}
      <div 
        className="flex items-center justify-between z-20 pt-[max(env(safe-area-inset-top),12px)] px-3 sm:px-5 pb-2 bg-gradient-to-b from-stone-950/90 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm text-white/90 font-medium truncate max-w-[200px] sm:max-w-sm px-2.5 py-1 bg-white/10 rounded-xl backdrop-blur-md">
            {alt}
          </span>
          {scale > 1 && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded-lg">
              {Math.round(scale * 100)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Download / Save Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md active:scale-95 transition-all shadow-md"
            title="บันทึกรูปภาพลงเครื่อง"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">บันทึกลงเครื่อง</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all"
            aria-label="ปิดรูปภาพ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Zoomable & Pannable Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-2 overflow-hidden w-full h-full cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isInteracting ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)',
            transformOrigin: 'center center',
            maxWidth: '96vw',
            maxHeight: '84vh',
            objectFit: 'contain',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'auto'
          }}
          className="rounded-2xl shadow-2xl"
        />
      </div>

      {/* Floating Bottom Toolbar (Zoom Controls + Reset + Hint) */}
      <div className="z-20 pb-[max(env(safe-area-inset-bottom),14px)] px-4 flex flex-col items-center gap-2 bg-gradient-to-t from-stone-950/90 to-transparent">
        {/* Zoom Controls Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 dark:bg-stone-900/80 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
            title="ย่อขนาด (-)"
            aria-label="ย่อภาพ"
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
            aria-label="ขยายภาพ"
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

        {/* Guidance Hint */}
        <div className="text-center text-[10px] sm:text-[11px] text-white/60 pointer-events-none">
          {scale > 1 ? (
            <span>👆 ลากนิ้วเพื่อเลื่อนดูส่วนต่างๆ • แตะ 2 ครั้งเพื่อรีเซ็ต</span>
          ) : (
            <span>💡 ใช้ 2 นิ้วถ่าง (Pinch) เพื่อซูม • หรือแตะ 2 ครั้งเร็วๆ</span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
