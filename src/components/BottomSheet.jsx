import React, { useEffect } from 'react';
import { X, Send, Paperclip, CheckCircle2, Circle, Edit3, Trash2, ZoomIn } from 'lucide-react';

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  badge, 
  image, 
  specs = [], 
  notes = [], 
  onAddNote, 
  currentUser,
  onImageClick,
  onEditHotspot,
  onDeleteHotspot
}) {
  const [newNoteText, setNewNoteText] = React.useState('');
  const isJob = currentUser === 'JOB';

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote({
      content: newNoteText.trim(),
      createdBy: currentUser,
      title: title || 'โน้ตจุดสำคัญ',
      createdAt: new Date().toISOString()
    });
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Sheet Modal Container */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-stone-200 max-h-[85vh] flex flex-col animate-slide-up">
        
        {/* Swipe Handle Indicator */}
        <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-stone-100 flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {badge}
                </span>
              )}
              <span className="text-xs text-stone-400 font-mono truncate">{subtitle}</span>
            </div>
            <h3 className="text-base font-bold text-stone-800 leading-tight">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {onEditHotspot && (
              <button
                onClick={onEditHotspot}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center active:scale-90"
                title="แก้ไขจุดนี้"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDeleteHotspot && (
              <button
                onClick={onDeleteHotspot}
                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center active:scale-90"
                title="ลบจุดนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 active:scale-90"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Optional Illustration / Blueprint snippet (Clickable for full image & download - Req 2) */}
          {image && (
            <div 
              onClick={() => onImageClick && onImageClick(image, title)}
              className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm max-h-48 bg-stone-100 relative group cursor-pointer"
              title="แตะเพื่อดูภาพขนาดเต็ม & บันทึกลงเครื่อง"
            >
              <img src={image} alt={title} className="w-full h-full object-contain mx-auto" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-black/60 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> ดูรูปเต็ม & เซฟ
                </span>
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {specs.length > 0 && (
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <span>📐</span> สเปกตามแบบก่อสร้าง
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {specs.map((s, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-400 text-[10px] block">{s.label}</span>
                    <span className="font-semibold text-stone-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Notes Thread */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>💬 บันทึกและไอเดียสำหรับจุดนี้</span>
              <span className="text-[10px] font-normal text-stone-400">{notes.length} รายการ</span>
            </h4>

            {notes.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                ยังไม่มีโน้ตในจุดนี้ พิมพ์เพิ่มด้านล่างได้เลยครับ
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div 
                    key={note.id || Math.random()} 
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold px-2 py-0.2 rounded-full ${
                        note.createdBy === 'JOB' 
                          ? 'bg-sky-100 text-sky-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {note.createdBy === 'JOB' ? '👔 JOB' : '🌸 Pealpeal'}
                      </span>
                      <span className="text-stone-400">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-stone-700 text-xs leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Input Field for Adding Quick Note */}
        <div className="p-3 border-t border-stone-100 bg-stone-50 pb-[max(env(safe-area-inset-bottom),14px)]">
          <form onSubmit={handleSubmitNote} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`เขียนโน้ตในชื่อ ${currentUser}...`}
                className="w-full bg-white border border-stone-200 rounded-full px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 ${
                isJob ? 'bg-sky-600 hover:bg-sky-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
