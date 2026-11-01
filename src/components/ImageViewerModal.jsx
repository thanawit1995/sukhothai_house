import React from 'react';
import { X, Download, Share2, ZoomIn } from 'lucide-react';

export default function ImageViewerModal({ isOpen, src, alt = 'รูปภาพ', onClose }) {
  if (!isOpen || !src) return null;

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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div 
        className="flex items-center justify-between z-10 pt-[max(env(safe-area-inset-top),10px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-white/80 font-medium truncate max-w-[200px] px-2">
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

      {/* Main Image Container (Strictly object-contain to NEVER crop any content!) */}
      <div 
        className="flex-1 flex items-center justify-center p-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl transition-transform"
        />
      </div>

      {/* Bottom Hint */}
      <div 
        className="pb-[max(env(safe-area-inset-bottom),10px)] text-center text-[10px] text-white/50 pointer-events-none"
      >
        แตะที่ว่างเพื่อปิด หรือกดปุ่ม "บันทึกลงเครื่อง" ด้านบน
      </div>
    </div>
  );
}
