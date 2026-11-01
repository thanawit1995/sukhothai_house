import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Tag, Trash2, Edit3, Calendar, Image as ImageIcon, X, Paperclip, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ImageViewerModal from '../components/ImageViewerModal';

export default function NotesPage({ notes, onAddNote, onUpdateNote, onDeleteNote, currentUser, targetNoteId }) {
  const isJob = currentUser === 'JOB';

  // Filters
  const [selectedTag, setSelectedTag] = useState('ทั้งหมด');
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYY-MM-DD'
  const [searchQuery, setSearchQuery] = useState('');

  // Add Note Form
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('ไอเดีย');
  const [imagePreview, setImagePreview] = useState(null); // Base64 data URL

  // Edit Note State
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('ไอเดีย');
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Delete Confirmation Modal State (Req 1)
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Fullscreen Image Lightbox State (Req 2)
  const [viewingImage, setViewingImage] = useState(null);

  // Handle device photo upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditTag(note.tag || 'ไอเดีย');
    const existingImg = note.attachments?.find(a => a.type === 'image')?.url || null;
    setEditImagePreview(existingImg);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    const attachments = [];
    if (editImagePreview) {
      attachments.push({ type: 'image', url: editImagePreview, label: 'รูปถ่าย' });
    }

    if (onUpdateNote) {
      onUpdateNote(editingNote.id, {
        title: editTitle.trim() || 'บันทึก',
        content: editContent.trim(),
        tag: editTag,
        attachments
      });
    }

    setEditingNote(null);
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const attachments = [];
    if (imagePreview) {
      attachments.push({ type: 'image', url: imagePreview, label: 'รูปถ่าย' });
    }

    onAddNote({
      pageId: 'notes',
      zoneId: 'general',
      title: title.trim() || 'บันทึกใหม่',
      content: content.trim(),
      tag,
      date: new Date().toISOString().split('T')[0],
      attachments,
      createdBy: currentUser
    });

    setTitle('');
    setContent('');
    setImagePreview(null);
    setIsAddingNote(false);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    // Tag filter
    if (selectedTag !== 'ทั้งหมด' && n.tag !== selectedTag) return false;
    // Date filter (Req 2)
    if (selectedDate && n.date !== selectedDate && n.createdAt?.split('T')[0] !== selectedDate) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-3.5 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Top Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาโน้ต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
            />
          </div>

          {/* Date Filter Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 font-medium shadow-xs focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="ml-1 p-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700"
                title="ล้างตัวกรองวันที่"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filters & Add Button */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['ทั้งหมด', 'ด่วน', 'ไอเดีย', 'ราคา', 'สเปก'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedTag === t
                    ? isJob ? 'bg-sky-600 text-white font-bold shadow-xs' : 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 shadow-xs'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm active:scale-95 transition-all ${
              isJob ? 'bg-sky-600 hover:bg-sky-700' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เขียนโน้ต</span>
          </button>
        </div>
      </div>

      {/* Date Filter Active Hint */}
      {selectedDate && (
        <div className="flex items-center justify-between text-[11px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-2xl font-medium">
          <span>📅 กรองดูวันที่: {new Date(selectedDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
          <button onClick={() => setSelectedDate('')} className="text-amber-900 dark:text-amber-300 underline font-bold">
            ดูทั้งหมด
          </button>
        </div>
      )}

      {/* Create New Note Drawer Form */}
      {isAddingNote && (
        <form onSubmit={handleCreateNote} className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <span>✍️</span> เขียนโน้ตในชื่อ {currentUser}
            </span>
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="text-[11px] bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-stone-700 font-medium"
            >
              <option value="ไอเดีย">🟢 ไอเดีย</option>
              <option value="ด่วน">🔴 ด่วนต้องสรุป</option>
              <option value="ราคา">🟡 เช็คราคา</option>
              <option value="สเปก">🔵 สเปกช่าง</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="หัวข้อเรื่อง (เช่น ลายกระเบื้องห้องน้ำ, สีกำแพง)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <textarea
            placeholder="เนื้อหา รายละเอียด หรือลิงก์ที่อยากจดไว้..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {/* Device Photo Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>📷 อัพโหลดรูปถ่ายจากเครื่อง</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative w-full max-h-40 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="flex-1 py-2 rounded-2xl text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 rounded-2xl text-xs font-bold text-white shadow-md ${
                isJob ? 'bg-sky-600' : 'bg-rose-500'
              }`}
            >
              บันทึกโน้ต
            </button>
          </div>
        </form>
      )}

      {/* Notes Feed */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900/60 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-xs space-y-1">
            <p>ไม่พบรายการโน้ตตามเงื่อนไขที่เลือก</p>
            <p className="text-[10px]">กดปุ่ม "เขียนโน้ต" ด้านบนเพื่อเพิ่มรายการใหม่</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const noteIsJob = note.createdBy === 'JOB';
            const isHighlight = targetNoteId === note.id;

            return (
              <div 
                key={note.id}
                id={`note-${note.id}`}
                className={`p-4 rounded-3xl border transition-all space-y-2.5 ${
                  isHighlight 
                    ? 'ring-2 ring-amber-400 bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' 
                    : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800/90 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      noteIsJob 
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {noteIsJob ? '👔 JOB' : '🌸 Pealpeal'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                      {note.tag || 'ทั่วไป'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                      {note.date || note.createdAt?.split('T')[0]}
                    </span>
                    
                    {/* Edit Button */}
                    <button 
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 active:scale-90"
                      title="แก้ไขโน้ตนี้"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Trigger Button (Opens ConfirmModal) */}
                    <button 
                      onClick={() => setNoteToDelete(note)}
                      className="p-1 text-stone-400 dark:text-stone-500 hover:text-rose-500 active:scale-90"
                      title="ลบโน้ตนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {note.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {/* Image Attachments (Click to view fullscreen & save - Req 2) */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {note.attachments.map((att, i) => (
                      <div 
                        key={i} 
                        onClick={() => setViewingImage({ src: att.url, alt: att.label || note.title })}
                        className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 max-h-36 cursor-pointer shadow-xs active:scale-98 transition-transform group relative"
                        title="แตะเพื่อดูรูปขนาดเต็ม / บันทึกลงเครื่อง"
                      >
                        <img src={att.url} alt={att.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">ดูภาพเต็ม</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleSaveEdit} className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">แก้ไขบันทึก / ไอเดีย</span>
              <button type="button" onClick={() => setEditingNote(null)} className="p-1 text-stone-400 dark:text-stone-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">หมวดหมู่</label>
              <div className="flex gap-1.5 flex-wrap">
                {['ไอเดีย', 'สเปก', 'งานช่าง', 'คำถาม', 'ทั่วไป'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditTag(t)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      editTag === t 
                        ? 'bg-amber-400 text-stone-900 font-bold shadow-xs' 
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">หัวข้อ</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="ระบุหัวข้อโน้ต"
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">รายละเอียด</label>
              <textarea
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="พิมพ์รายละเอียดที่ต้องการแก้ไข..."
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
                required
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">รูปภาพประกอบ</label>
              {editImagePreview ? (
                <div className="relative w-full max-h-36 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900">
                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setEditImagePreview(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>เลือกรูปจากเครื่อง</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="flex-1 py-2.5 rounded-2xl text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md ${
                  isJob ? 'bg-sky-600' : 'bg-rose-500'
                }`}
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (Req 1) */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        title="ยืนยันการลบโน้ต"
        message={`คุณต้องการลบโน้ต "${noteToDelete?.title}" หรือไม่? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้`}
        onConfirm={() => {
          if (noteToDelete) {
            onDeleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
      />

      {/* Fullscreen Image Lightbox Modal with Download (Req 2) */}
      <ImageViewerModal
        isOpen={!!viewingImage}
        src={viewingImage?.src}
        alt={viewingImage?.alt}
        onClose={() => setViewingImage(null)}
      />

    </div>
  );
}
