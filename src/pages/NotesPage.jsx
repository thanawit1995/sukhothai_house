import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Tag, 
  Trash2, 
  Edit3, 
  Calendar, 
  Image as ImageIcon, 
  X, 
  Search, 
  SlidersHorizontal, 
  Check,
  Pencil,
  RotateCcw
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ImageViewerModal from '../components/ImageViewerModal';
import { StorageService } from '../lib/storage';

const DEFAULT_TAGS = ['ไอเดีย', 'ด่วน', 'ราคา', 'สเปก', 'งานช่าง'];

export default function NotesPage({ notes, onAddNote, onUpdateNote, onDeleteNote, currentUser, targetNoteId }) {
  const isJob = currentUser === 'JOB';

  // Filters (Req 1: Only "JOB" & "Pealpeal" chips; all other filters consolidated into 1 button)
  const [selectedUser, setSelectedUser] = useState(null); // null (All) | 'JOB' | 'Pealpeal'
  const [selectedTag, setSelectedTag] = useState('ทั้งหมด');
  
  // Date Range Filter (Req 2: ช่วงวันที่ - startDate to endDate)
  const [startDate, setStartDate] = useState(''); // 'YYYY-MM-DD'
  const [endDate, setEndDate] = useState('');     // 'YYYY-MM-DD'
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Dynamic Custom Tags (Req 2: เพิ่ม tag ได้)
  const [customTags, setCustomTags] = useState(() => StorageService.getCustomTags());
  const [modalNewTagInput, setModalNewTagInput] = useState('');
  const [formNewTagInput, setFormNewTagInput] = useState('');
  const [isAddingTagInForm, setIsAddingTagInForm] = useState(false);
  const [isAddingTagInEdit, setIsAddingTagInEdit] = useState(false);
  const [editNewTagInput, setEditNewTagInput] = useState('');

  // Combined tags list (Default + Custom + Any used in notes)
  const allAvailableTags = Array.from(new Set([
    ...DEFAULT_TAGS,
    ...customTags,
    ...notes.map(n => n.tag).filter(Boolean)
  ]));

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

  // Delete Confirmation Modal State
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Fullscreen Image Lightbox & Editor State (Req 3: Crop, Draw, Eraser, Undo, Save)
  // Structure: { src, alt, noteId?, attachmentIndex?, draftType?: 'new' | 'edit' }
  const [viewingImage, setViewingImage] = useState(null);

  // Helper: Format date to Thai compact representation
  const formatDateThai = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Helper: Date range quick presets
  const applyDatePreset = (preset) => {
    const today = new Date();
    const format = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const tStr = format(today);
      setStartDate(tStr);
      setEndDate(tStr);
    } else if (preset === '7days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 6);
      setStartDate(format(past));
      setEndDate(format(today));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(format(firstDay));
      setEndDate(format(today));
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Tag Management
  const handleAddCustomTag = (tagText) => {
    if (!tagText || !tagText.trim()) return;
    const clean = tagText.trim().replace(/^#/, '');
    const updated = StorageService.addCustomTag(clean);
    setCustomTags(updated);
    return clean;
  };

  const handleDeleteCustomTag = (tagToDelete) => {
    const updated = StorageService.deleteCustomTag(tagToDelete);
    setCustomTags(updated);
    if (selectedTag === tagToDelete) {
      setSelectedTag('ทั้งหมด');
    }
  };

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

  // Image Editor Save Callback (Req 3: Update image attachment or draft preview)
  const handleSaveEditedImage = (newImageUrl) => {
    if (!viewingImage) return;

    if (viewingImage.draftType === 'new') {
      setImagePreview(newImageUrl);
    } else if (viewingImage.draftType === 'edit') {
      setEditImagePreview(newImageUrl);
    } else if (viewingImage.noteId && viewingImage.attachmentIndex !== undefined && onUpdateNote) {
      const targetNote = notes.find(n => n.id === viewingImage.noteId);
      if (targetNote && targetNote.attachments) {
        const updatedAttachments = targetNote.attachments.map((att, idx) => {
          if (idx === viewingImage.attachmentIndex) {
            return { ...att, url: newImageUrl };
          }
          return att;
        });
        onUpdateNote(viewingImage.noteId, { attachments: updatedAttachments });
      }
    }
  };

  const hasDateFilter = Boolean(startDate || endDate);
  const activeFilterCount = (selectedTag !== 'ทั้งหมด' ? 1 : 0) + (hasDateFilter ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  // Filter notes (Req 1 & 2: User chips + Date Range + Custom Tag + Search)
  const filteredNotes = notes.filter(n => {
    // 1. User filter (Strictly "JOB" & "Pealpeal" chips)
    if (selectedUser && n.createdBy !== selectedUser) return false;
    
    // 2. Tag filter
    if (selectedTag !== 'ทั้งหมด' && n.tag !== selectedTag) return false;
    
    // 3. Date range filter
    const noteDate = n.date || n.createdAt?.split('T')[0] || '';
    if (startDate && noteDate && noteDate < startDate) return false;
    if (endDate && noteDate && noteDate > endDate) return false;
    
    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchContent = (n.content || '').toLowerCase().includes(q);
      const matchTag = (n.tag || '').toLowerCase().includes(q);
      return matchTitle || matchContent || matchTag;
    }
    return true;
  });

  return (
    <div className="space-y-3.5 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Top Filter Chips & Action Bar (Req 1: Only "JOB" & "Pealpeal", other filters in 1 button) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1.5 pt-1">
          
          {/* Left: User Chips: Strictly "JOB" & "Pealpeal" */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* JOB Chip */}
            <button
              onClick={() => setSelectedUser(prev => prev === 'JOB' ? null : 'JOB')}
              className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs border ${
                selectedUser === 'JOB'
                  ? 'bg-sky-600 border-sky-600 text-white shadow-sky-200 dark:shadow-none'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
              title="กรองดูเฉพาะโน้ตของ JOB (แตะซ้ำเพื่อดูทั้งหมด)"
            >
              <span>👔</span>
              <span>JOB</span>
              {selectedUser === 'JOB' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            {/* Pealpeal Chip */}
            <button
              onClick={() => setSelectedUser(prev => prev === 'Pealpeal' ? null : 'Pealpeal')}
              className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs border ${
                selectedUser === 'Pealpeal'
                  ? 'bg-rose-500 border-rose-500 text-white shadow-rose-200 dark:shadow-none'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
              title="กรองดูเฉพาะโน้ตของ Pealpeal (แตะซ้ำเพื่อดูทั้งหมด)"
            >
              <span>🌸</span>
              <span>Pealpeal</span>
              {selectedUser === 'Pealpeal' && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>

          {/* Right: Consolidated Filter Button ("ปุ่มเดียว") + New Note Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Consolidated Filter Button ("ปุ่มเดียว") */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs border ${
                activeFilterCount > 0
                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-amber-200 dark:shadow-none'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
              title="ค้นหา, ช่วงวันที่ หรือเลือกแท็ก"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรอง</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-black flex items-center justify-center -mr-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add Note Button */}
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className={`h-8 px-3 rounded-full text-xs font-bold text-white shadow-xs flex items-center gap-1 active:scale-95 transition-all ${
                isJob ? 'bg-sky-600 hover:bg-sky-700' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">เขียนโน้ต</span>
            </button>
          </div>
        </div>

        {/* Active Filter Indicators (Compact dismissible bar) */}
        {(selectedUser || activeFilterCount > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
            {selectedUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium">
                ผู้เขียน: {selectedUser === 'JOB' ? '👔 JOB' : '🌸 Pealpeal'}
                <button onClick={() => setSelectedUser(null)} className="hover:text-rose-500 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900">
                🔍 "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTag !== 'ทั้งหมด' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900">
                🏷️ {selectedTag}
                <button onClick={() => setSelectedTag('ทั้งหมด')} className="hover:text-rose-500 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {hasDateFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900">
                📅 {startDate ? formatDateThai(startDate) : 'เริ่มต้น'} - {endDate ? formatDateThai(endDate) : 'ปัจจุบัน'}
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }} 
                  className="hover:text-rose-500 ml-0.5"
                  title="ล้างช่วงวันที่"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button 
              onClick={() => {
                setSelectedUser(null);
                setSelectedTag('ทั้งหมด');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 underline font-medium ml-1"
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Create New Note Drawer Form */}
      {isAddingNote && (
        <form onSubmit={handleCreateNote} className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <span>✍️</span> เขียนโน้ตในชื่อ {currentUser}
            </span>
          </div>

          {/* Tag Selector with "+ เพิ่มแท็กใหม่" (Req 2) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-500" />
                <span>เลือกหมวดหมู่ / แท็ก</span>
              </label>
              {!isAddingTagInForm && (
                <button
                  type="button"
                  onClick={() => setIsAddingTagInForm(true)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>เพิ่มแท็กใหม่</span>
                </button>
              )}
            </div>

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap gap-1.5">
              {allAvailableTags.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-all font-medium border ${
                    tag === t
                      ? 'bg-amber-400 border-amber-400 text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Inline Add Custom Tag Form */}
            {isAddingTagInForm && (
              <div className="flex items-center gap-1.5 pt-1 animate-fade-in">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อแท็กใหม่..."
                  value={formNewTagInput}
                  onChange={(e) => setFormNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formNewTagInput.trim()) {
                        const newTag = handleAddCustomTag(formNewTagInput);
                        if (newTag) setTag(newTag);
                        setFormNewTagInput('');
                        setIsAddingTagInForm(false);
                      }
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formNewTagInput.trim()) {
                      const newTag = handleAddCustomTag(formNewTagInput);
                      if (newTag) setTag(newTag);
                      setFormNewTagInput('');
                    }
                    setIsAddingTagInForm(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs"
                >
                  เพิ่ม
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormNewTagInput('');
                    setIsAddingTagInForm(false);
                  }}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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

          {/* Device Photo Upload & Live Editor Trigger (Req 3) */}
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
              <div className="relative w-full max-h-40 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 group">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setViewingImage({
                    src: imagePreview,
                    alt: 'รูปโน้ตใหม่',
                    draftType: 'new'
                  })}
                />
                
                {/* Click to Edit Hint Badge */}
                <div 
                  onClick={() => setViewingImage({
                    src: imagePreview,
                    alt: 'รูปโน้ตใหม่',
                    draftType: 'new'
                  })}
                  className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:bg-black/90 active:scale-95 transition-all shadow-md"
                >
                  <Pencil className="w-2.5 h-2.5 text-amber-400" />
                  <span>แตะเพื่อครอป / วาดเขียน</span>
                </div>

                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black active:scale-95"
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      noteIsJob 
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {noteIsJob ? '👔 JOB' : '🌸 Pealpeal'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                      🏷️ {note.tag || 'ทั่วไป'}
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

                {/* Image Attachments (Click to view fullscreen & edit - Req 3) */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {note.attachments.map((att, i) => (
                      <div 
                        key={i} 
                        onClick={() => setViewingImage({ 
                          src: att.url, 
                          alt: att.label || note.title,
                          noteId: note.id,
                          attachmentIndex: i
                        })}
                        className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 max-h-36 cursor-pointer shadow-xs active:scale-98 transition-transform group relative"
                        title="แตะเพื่อดูรูปขนาดเต็ม / ครอป / วาด / บันทึก"
                      >
                        <img src={att.url} alt={att.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                          <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Pencil className="w-2.5 h-2.5 text-amber-400" />
                            <span>ดู / แก้ไขรูป</span>
                          </span>
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

            {/* Edit Tag Selector with "+ แท็กใหม่" */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">หมวดหมู่ / แท็ก</label>
                {!isAddingTagInEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTagInEdit(true)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มแท็กใหม่</span>
                  </button>
                )}
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {allAvailableTags.map(t => (
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

              {/* Inline Add Tag in Edit Mode */}
              {isAddingTagInEdit && (
                <div className="flex items-center gap-1.5 pt-2 animate-fade-in">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อแท็กใหม่..."
                    value={editNewTagInput}
                    onChange={(e) => setEditNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editNewTagInput.trim()) {
                          const newTag = handleAddCustomTag(editNewTagInput);
                          if (newTag) setEditTag(newTag);
                          setEditNewTagInput('');
                          setIsAddingTagInEdit(false);
                        }
                      }
                    }}
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editNewTagInput.trim()) {
                        const newTag = handleAddCustomTag(editNewTagInput);
                        if (newTag) setEditTag(newTag);
                        setEditNewTagInput('');
                      }
                      setIsAddingTagInEdit(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs"
                  >
                    เพิ่ม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditNewTagInput('');
                      setIsAddingTagInEdit(false);
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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

            {/* Photo Attachment & Live Editor Trigger (Req 3) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">รูปภาพประกอบ</label>
              {editImagePreview ? (
                <div className="relative w-full max-h-36 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 group">
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setViewingImage({
                      src: editImagePreview,
                      alt: 'รูปโน้ตที่กำลังแก้ไข',
                      draftType: 'edit'
                    })}
                  />
                  
                  {/* Click to Edit Hint Badge */}
                  <div 
                    onClick={() => setViewingImage({
                      src: editImagePreview,
                      alt: 'รูปโน้ตที่กำลังแก้ไข',
                      draftType: 'edit'
                    })}
                    className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:bg-black/90 active:scale-95 transition-all shadow-md"
                  >
                    <Pencil className="w-2.5 h-2.5 text-amber-400" />
                    <span>แตะเพื่อครอป / วาดเขียน</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black active:scale-95"
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

      {/* Consolidated Filter Modal / Drawer ("ปุ่มเดียว" - Req 1 & Req 2) */}
      {isFilterModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99998] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm max-h-[85vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  ตัวกรองโน้ต
                </h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Search Query */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>ค้นหาข้อความ</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="พิมพ์คำค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-3 pr-8 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Tag Filters with Add Custom Tag (Req 2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>หมวดหมู่ / แท็ก</span>
                </label>
                {selectedTag !== 'ทั้งหมด' && (
                  <button
                    onClick={() => setSelectedTag('ทั้งหมด')}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                  >
                    ดูทั้งหมด
                  </button>
                )}
              </div>

              {/* Tag Selection Pills */}
              <div className="flex flex-wrap gap-1.5">
                {/* 'ทั้งหมด' Option */}
                <button
                  type="button"
                  onClick={() => setSelectedTag('ทั้งหมด')}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium border ${
                    selectedTag === 'ทั้งหมด'
                      ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  ทั้งหมด
                </button>

                {allAvailableTags.map(t => {
                  const isCustom = customTags.includes(t);
                  return (
                    <div key={t} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedTag(t)}
                        className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium border ${
                          selectedTag === t
                            ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {t}
                      </button>
                      {/* Optional subtle delete for custom tag if desired */}
                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomTag(t);
                          }}
                          className="ml-0.5 p-1 text-stone-300 hover:text-rose-500 text-[10px]"
                          title={`ลบแท็ก "${t}"`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Tag Input in Filter Modal (Req 2) */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="+ เพิ่มแท็กใหม่ (เช่น วัสดุ, สวน)..."
                  value={modalNewTagInput}
                  onChange={(e) => setModalNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (modalNewTagInput.trim()) {
                        const newTag = handleAddCustomTag(modalNewTagInput);
                        if (newTag) setSelectedTag(newTag);
                        setModalNewTagInput('');
                      }
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (modalNewTagInput.trim()) {
                      const newTag = handleAddCustomTag(modalNewTagInput);
                      if (newTag) setSelectedTag(newTag);
                      setModalNewTagInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
                >
                  เพิ่ม
                </button>
              </div>
            </div>

            {/* 3. Date Range Filter with Quick Presets (Req 2: เลือกวันที่เป็นช่วงได้) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>กรองตามช่วงวันที่</span>
                </label>
                {hasDateFilter && (
                  <button
                    onClick={() => applyDatePreset('all')}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                  >
                    ล้างวันที่
                  </button>
                )}
              </div>

              {/* Quick Presets: วันนี้ / 7 วันล่าสุด / เดือนนี้ / ทั้งหมด */}
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => applyDatePreset('today')}
                  className="py-1 px-1.5 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-center transition-colors"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('7days')}
                  className="py-1 px-1.5 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-center transition-colors"
                >
                  7 วันล่าสุด
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('thisMonth')}
                  className="py-1 px-1.5 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-center transition-colors"
                >
                  เดือนนี้
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('all')}
                  className="py-1 px-1.5 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 text-center transition-colors"
                >
                  ทั้งหมด
                </button>
              </div>

              {/* Start Date & End Date Pickers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 block">
                    จากวันที่
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 block">
                    ถึงวันที่
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedTag('ทั้งหมด');
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold active:scale-95 transition-all shadow-md text-center"
              >
                ดูโน้ต ({filteredNotes.length} รายการ)
              </button>
            </div>
          </div>
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

      {/* Fullscreen Image Lightbox & Editor Modal (Req 3: Pinch Zoom, Crop, Draw, Eraser, Undo, Save) */}
      <ImageViewerModal
        isOpen={!!viewingImage}
        src={viewingImage?.src}
        alt={viewingImage?.alt}
        onClose={() => setViewingImage(null)}
        onSave={handleSaveEditedImage}
      />

    </div>
  );
}
