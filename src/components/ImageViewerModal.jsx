import React from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, ZoomIn } from 'lucide-react';

export default function ImageViewerModal({ isOpen, src, alt = 'รูปภาพ', onClose }) {
  if (!isOpen || !src || typeof document === 'undefined') return null;

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
      // Fallback for mobile browser: open in new tab for long-press save
      window.open(src, '_blank');
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div 
        className="flex items-center justify-between z-10 pt-[max(env(safe-area-inset-top),12px)] px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs sm:text-sm text-white/90 font-medium truncate max-w-[240px] px-2 bg-black/40 py-1 rounded-lg">
          {alt}
        </span>

        <div className="flex items-center gap-2">
          {/* Download / Save Button (Req 2 & 3) */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md active:scale-95 transition-all shadow-md"
            title="บันทึกรูปภาพลงเครื่อง"
          >
            <Download className="w-3.5 h-3.5" />
            <span>บันทึกลงเครื่อง</span>
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

      {/* Main Image Container (Truly fullscreen, never confined to column!) */}
      <div 
        className="flex-1 flex items-center justify-center p-2 overflow-hidden w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl transition-transform"
        />
      </div>

      {/* Bottom Hint */}
      <div 
        className="pb-[max(env(safe-area-inset-bottom),12px)] text-center text-[10px] sm:text-xs text-white/60 pointer-events-none"
      >
        แตะที่ว่างเพื่อปิด หรือกดปุ่ม "บันทึกลงเครื่อง" ด้านบน
      </div>
    </div>,
    document.body
  );
}
