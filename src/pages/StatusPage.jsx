import React, { useState } from 'react';
import { CheckCircle2, Clock, Circle, Plus, Edit3, Image as ImageIcon, Trash2, X, GripVertical } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ImageViewerModal from '../components/ImageViewerModal';

export default function StatusPage({ stages, onUpdateStages, currentUser }) {
  const isJob = currentUser === 'JOB';

  const [editingStage, setEditingStage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);

  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Drag and Drop State (Req 4)
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Delete Confirmation State (Req 1)
  const [stageToDelete, setStageToDelete] = useState(null);

  // Fullscreen Photo Lightbox State (Req 2)
  const [viewingPhoto, setViewingPhoto] = useState(null);

  // Calculate last active index for progressive timeline highlighting (Req 3)
  let lastActiveIndex = -1;
  stages.forEach((s, idx) => {
    if (s.status === 'done' || s.status === 'in_progress') {
      lastActiveIndex = idx;
    }
  });

  // Toggle stage status
  const handleToggleStatus = (id) => {
    const nextStatus = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    const updated = stages.map(s => s.id === id ? { ...s, status: nextStatus[s.status] || 'todo' } : s);
    onUpdateStages(updated);
  };

  // Drag and Drop Handlers (Req 4)
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedIdx !== null ? draggedIdx : Number(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex || sourceIndex === null || isNaN(sourceIndex)) return;

    const reordered = [...stages];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateStages(reordered);
    setDraggedIdx(null);
  };

  // Add new stage
  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newStage = {
      id: 'stg_' + Date.now(),
      title: newTitle.trim(),
      status: 'todo',
      photo: null,
      notes: ''
    };
    onUpdateStages([...stages, newStage]);
    setNewTitle('');
    setIsAddingStage(false);
  };

  // Open edit modal
  const handleOpenEdit = (stage) => {
    setEditingStage(stage);
    setEditTitle(stage.title);
    setEditNotes(stage.notes || '');
    setEditPhoto(stage.photo || null);
  };

  // Save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStage) return;
    const updated = stages.map(s => s.id === editingStage.id ? {
      ...s,
      title: editTitle.trim(),
      notes: editNotes.trim(),
      photo: editPhoto
    } : s);
    onUpdateStages(updated);
    setEditingStage(null);
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-800">🏗️ สถานะความคืบหน้าโครงการ</h3>
          <p className="text-[11px] text-stone-400">กดค้างที่ไอคอน ⠿ เพื่อลากสลับลำดับขั้นตอน</p>
        </div>

        <button
          onClick={() => setIsAddingStage(!isAddingStage)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs active:scale-95 transition-all ${
            isJob ? 'bg-sky-600' : 'bg-rose-500'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มขั้นตอน</span>
        </button>
      </div>

      {/* Add Stage Form */}
      {isAddingStage && (
        <form onSubmit={handleAddStage} className="p-3.5 bg-white rounded-3xl border border-stone-200 shadow-md space-y-2.5 animate-slide-up">
          <span className="text-xs font-bold text-stone-800">เพิ่มขั้นตอนการก่อสร้างใหม่</span>
          <input
            type="text"
            placeholder="ชื่อขั้นตอน (เช่น เทพื้นลานซักล้าง, สั่งของตกแต่ง)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAddingStage(false)}
              className="flex-1 py-1.5 text-xs rounded-xl bg-stone-100 text-stone-600 font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex-1 py-1.5 text-xs font-bold text-white rounded-xl ${isJob ? 'bg-sky-600' : 'bg-rose-500'}`}
            >
              บันทึก
            </button>
          </div>
        </form>
      )}

      {/* Vertical Connected Progressive Timeline (Req 3 & Req 4) */}
      <div className="relative pl-7 space-y-3.5">
        
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'done';
          const isInProgress = stage.status === 'in_progress';
          const isPastActive = idx < lastActiveIndex;
          const isCurrentActive = idx === lastActiveIndex;

          return (
            <div 
              key={stage.id} 
              className={`relative flex items-start gap-3 transition-transform ${
                draggedIdx === idx ? 'opacity-40 scale-98' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              
              {/* Dynamic Connected Line Segment down to next item (Req 3) */}
              {idx < stages.length - 1 && (
                <div 
                  className={`absolute -left-[14px] top-7 bottom-[-16px] -translate-x-1/2 transition-all rounded-full ${
                    isPastActive 
                      ? 'w-[3px] bg-emerald-500 shadow-xs' 
                      : (isCurrentActive && isInProgress)
                        ? 'w-[3px] bg-gradient-to-b from-amber-400 to-stone-200' 
                        : 'w-[2px] bg-stone-200'
                  }`}
                />
              )}

              {/* Timeline Node Icon (Connected on line) */}
              <div 
                onClick={() => handleToggleStatus(stage.id)}
                className={`absolute -left-7 top-2.5 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-xs z-10 ${
                  isDone 
                    ? 'bg-emerald-500 border-white text-white scale-95 shadow-emerald-200' 
                    : isInProgress 
                      ? 'bg-amber-400 border-white text-stone-900 animate-pulse ring-2 ring-amber-200' 
                      : 'bg-white border-stone-300 text-stone-300'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isInProgress && <Clock className="w-3.5 h-3.5 font-bold" />}
                {!isDone && !isInProgress && <Circle className="w-3.5 h-3.5" />}
              </div>

              {/* Status Card (Req 3, 4, 5) */}
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                className={`flex-1 p-3.5 rounded-3xl border transition-all ${
                  isDone 
                    ? 'bg-emerald-50/50 border-emerald-200/80 opacity-80' 
                    : isInProgress 
                      ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-200' 
                      : 'bg-white border-stone-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0" onClick={() => handleToggleStatus(stage.id)}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-stone-400 font-bold">
                        #{idx + 1}
                      </span>
                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                        isDone ? 'bg-emerald-100 text-emerald-800' :
                        isInProgress ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {isDone ? 'เสร็จแล้ว' : isInProgress ? 'กำลังทำ' : 'รอเริ่ม'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-800 leading-snug">
                      {stage.title}
                    </h4>

                    {stage.notes && (
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        {stage.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions: Drag Handle & Edit (Req 4: Removed arrow buttons!) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(stage)}
                      className="p-1.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-90"
                      title="แก้ไข / ใส่รูป"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Drag Handle Grip (Req 4) */}
                    <div 
                      className="p-1.5 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
                      title="กดค้างเพื่อลากสลับลำดับ"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Attached Work Progress Photo (Click to open fullscreen & download - Req 2) */}
                {stage.photo && (
                  <div 
                    onClick={() => setViewingPhoto({ src: stage.photo, alt: stage.title })}
                    className="mt-2.5 rounded-2xl overflow-hidden border border-stone-200 max-h-36 bg-stone-100 cursor-pointer shadow-xs active:scale-98 transition-transform relative group"
                    title="แตะเพื่อดูภาพขนาดเต็ม / บันทึกลงเครื่อง"
                  >
                    <img src={stage.photo} alt={stage.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">ดูภาพเต็ม</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Stage Modal */}
      {editingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleSaveEdit} className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-sm font-bold text-stone-800">แก้ไขขั้นตอน</span>
              <button type="button" onClick={() => setEditingStage(null)} className="p-1 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">ชื่อขั้นตอน</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">บันทึกเพิ่มเติม</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="รายละเอียดความคืบหน้า..."
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none"
              />
            </div>

            {/* Photo Upload for Status */}
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">รูปหน้างานจริง</label>
              <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-stone-600 text-xs cursor-pointer hover:bg-stone-100">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>📷 ถ่ายรูป / เลือกรูปจากเครื่อง</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {editPhoto && (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-stone-200 max-h-32 bg-stone-100">
                  <img src={editPhoto} alt="Stage preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setEditPhoto(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStageToDelete(editingStage)}
                className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
                title="ลบขั้นตอนนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditingStage(null)}
                className="flex-1 py-2.5 rounded-2xl text-xs bg-stone-100 text-stone-600 font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md ${isJob ? 'bg-sky-600' : 'bg-rose-500'}`}
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal (Req 1) */}
      <ConfirmModal
        isOpen={!!stageToDelete}
        title="ยืนยันการลบขั้นตอน"
        message={`คุณต้องการลบขั้นตอน "${stageToDelete?.title}" หรือไม่? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้`}
        onConfirm={() => {
          if (stageToDelete) {
            onUpdateStages(stages.filter(s => s.id !== stageToDelete.id));
            setStageToDelete(null);
            setEditingStage(null);
          }
        }}
        onCancel={() => setStageToDelete(null)}
      />

      {/* Fullscreen Photo Lightbox Modal with Download (Req 2) */}
      <ImageViewerModal
        isOpen={!!viewingPhoto}
        src={viewingPhoto?.src}
        alt={viewingPhoto?.alt}
        onClose={() => setViewingPhoto(null)}
      />

    </div>
  );
}
