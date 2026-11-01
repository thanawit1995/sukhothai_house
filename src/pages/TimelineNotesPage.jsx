import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, Clock, Circle, DollarSign, Tag, 
  Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, 
  ChevronRight, Sparkles, Filter, AlertCircle 
} from 'lucide-react';

export default function TimelineNotesPage({ 
  stages, onUpdateStages, 
  budget, onUpdateBudget, 
  notes, onAddNote, onDeleteNote, 
  activityLogs, currentUser 
}) {
  const isJob = currentUser === 'JOB';
  const [activeSection, setActiveSection] = useState('notes'); // 'notes' | 'status' | 'budget'

  // Notes state
  const [selectedTag, setSelectedTag] = useState('ทั้งหมด');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('ไอเดีย');
  const [noteImageUrl, setNoteImageUrl] = useState('');

  // Status state
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState('');

  // Budget state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(budget.categories[0]?.id || '');

  // Calculate project progress
  const doneStagesCount = stages.filter(s => s.status === 'done').length;
  const progressPercent = Math.round((doneStagesCount / (stages.length || 1)) * 100);

  // Calculate budget totals
  const totalSpent = budget.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) +
    budget.categories.reduce((sum, c) => sum + Number(c.spent || 0), 0);
  const budgetSpentPercent = Math.min(100, Math.round((totalSpent / (budget.target || 1)) * 100));
  const remainingBudget = Math.max(0, budget.target - totalSpent);

  // Filter notes
  const filteredNotes = selectedTag === 'ทั้งหมด' 
    ? notes 
    : notes.filter(n => n.tag === selectedTag);

  // Status handlers
  const handleToggleStageStatus = (stageId) => {
    const nextStatus = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    const updated = stages.map(s => s.id === stageId ? { ...s, status: nextStatus[s.status] || 'todo' } : s);
    onUpdateStages(updated);
  };

  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;
    const newStage = {
      id: 'stg_' + Date.now(),
      title: newStageTitle.trim(),
      status: 'todo',
      updatedAt: new Date().toISOString()
    };
    onUpdateStages([...stages, newStage]);
    setNewStageTitle('');
    setIsAddingStage(false);
  };

  const handleDeleteStage = (id) => {
    onUpdateStages(stages.filter(s => s.id !== id));
  };

  // Budget handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseAmount || !expenseTitle.trim()) return;
    const newExpense = {
      id: 'exp_' + Date.now(),
      title: expenseTitle.trim(),
      amount: Number(expenseAmount),
      categoryId: expenseCategory,
      paidBy: currentUser,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...budget,
      expenses: [newExpense, ...budget.expenses]
    };
    onUpdateBudget(updated);
    setExpenseTitle('');
    setExpenseAmount('');
    setIsAddingExpense(false);
  };

  // Note handler
  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const attachments = [];
    if (noteImageUrl.trim()) {
      attachments.push({ type: 'image', url: noteImageUrl.trim(), label: 'รูปแนบ' });
    }
    onAddNote({
      pageId: 'page1',
      zoneId: 'general',
      title: noteTitle.trim() || 'บันทึกใหม่',
      content: noteContent.trim(),
      tag: noteTag,
      attachments,
      createdBy: currentUser
    });
    setNoteTitle('');
    setNoteContent('');
    setNoteImageUrl('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Top Segmented Control (Switch between Notes, Status, Budget) */}
      <div className="flex p-1 bg-stone-200/80 dark:bg-stone-800 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSection === 'notes' 
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' 
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          📝 โน้ตร่วมกัน ({notes.length})
        </button>
        <button
          onClick={() => setActiveSection('status')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSection === 'status' 
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' 
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          🏗️ สถานะ ({progressPercent}%)
        </button>
        <button
          onClick={() => setActiveSection('budget')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeSection === 'budget' 
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' 
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          💰 คุมงบ ({budgetSpentPercent}%)
        </button>
      </div>

      {/* ================= SECTION: LIVE NOTES ================= */}
      {activeSection === 'notes' && (
        <div className="space-y-3.5">
          
          {/* Quick Stats & Add Note Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {['ทั้งหมด', 'ด่วน', 'ไอเดีย', 'ราคา', 'สเปก'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                    selectedTag === tag
                      ? isJob ? 'bg-sky-600 text-white font-bold' : 'bg-rose-600 text-white font-bold'
                      : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm active:scale-95 transition-all ${
                isJob ? 'bg-sky-600 hover:bg-sky-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เขียนโน้ต</span>
            </button>
          </div>

          {/* New Note Form */}
          {isAddingNote && (
            <form onSubmit={handleCreateNote} className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
                  <span>✍️</span> เขียนโน้ตในชื่อ {currentUser}
                </span>
                <select 
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="text-[11px] bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border-none text-stone-700 dark:text-stone-200 font-medium"
                >
                  <option value="ไอเดีย">🟢 ไอเดีย</option>
                  <option value="ด่วน">🔴 ด่วนต้องสรุป</option>
                  <option value="ราคา">🟡 เช็คราคา</option>
                  <option value="สเปก">🔵 สเปกช่าง</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="หัวข้อเรื่อง (เช่น เลือกลายไม้รั้ว, ชนิดซิ้งก์ล้างจาน)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <textarea
                placeholder="เนื้อหา รายละเอียด หรือลิงก์ที่อยากจดไว้..."
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="text"
                placeholder="URL รูปภาพที่ต้องการแนบ (ไม่บังคับ)"
                value={noteImageUrl}
                onChange={(e) => setNoteImageUrl(e.target.value)}
                className="w-full text-[11px] px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="flex-1 py-2 rounded-xl text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                    isJob ? 'bg-sky-600' : 'bg-rose-600'
                  }`}
                >
                  บันทึกโน้ต
                </button>
              </div>
            </form>
          )}

          {/* Notes Feed */}
          <div className="space-y-3">
            {filteredNotes.map((note) => {
              const noteIsJob = note.createdBy === 'JOB';
              return (
                <div 
                  key={note.id}
                  className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        noteIsJob 
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' 
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}>
                        {noteIsJob ? '👔 JOB' : '🌸 Pealpeal'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                        {note.tag || 'ทั่วไป'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <button 
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-stone-400 hover:text-rose-500"
                        title="ลบโน้ตนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
                      {note.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  {/* Image Attachments */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {note.attachments.map((att, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-950 max-h-32">
                          <img src={att.url} alt={att.label} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Activity Logs Footer Snippet */}
          <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3 border border-stone-200/60 dark:border-stone-800 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
              <span>⚡</span> การเคลื่อนไหวล่าสุด (Real-time Feed)
            </span>
            <div className="space-y-1.5">
              {activityLogs.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                  <span>
                    <strong className="text-stone-800 dark:text-stone-200">{log.user}</strong>: {log.action} "{log.targetName}"
                  </span>
                  <span className="text-[10px] text-stone-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= SECTION: STATUS TRACKER ================= */}
      {activeSection === 'status' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 p-4 rounded-3xl shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">ความคืบหน้าโครงการ</span>
                <h3 className="text-xl font-black">{progressPercent}% เสร็จสิ้น</h3>
              </div>
              <span className="text-xs bg-stone-950/20 px-2.5 py-1 rounded-full font-bold">
                {doneStagesCount} จาก {stages.length} ขั้นตอน
              </span>
            </div>
            
            <div className="w-full bg-stone-950/20 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-stone-950 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] opacity-90">
              แตะที่แต่ละขั้นตอนเพื่อเปลี่ยนสถานะ: ยังไม่เริ่ม ➡️ กำลังทำ ➡️ เสร็จแล้ว
            </p>
          </div>

          {/* Add Stage Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingStage(!isAddingStage)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-900 text-white dark:bg-white dark:text-stone-950 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มขั้นตอนใหม่</span>
            </button>
          </div>

          {/* New Stage Form */}
          {isAddingStage && (
            <form onSubmit={handleAddStage} className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <input
                type="text"
                placeholder="ชื่อขั้นตอน (เช่น เทพื้นปูนโรงรถ, ติดตั้งปั๊มน้ำ)"
                value={newStageTitle}
                onChange={(e) => setNewStageTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStage(false)}
                  className="flex-1 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-bold bg-amber-500 text-stone-950 rounded-lg"
                >
                  เพิ่มขั้นตอน
                </button>
              </div>
            </form>
          )}

          {/* Stages List */}
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const isDone = stage.status === 'done';
              const isInProgress = stage.status === 'in_progress';

              return (
                <div 
                  key={stage.id}
                  onClick={() => handleToggleStageStatus(stage.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 ${
                    isDone 
                      ? 'bg-emerald-500/5 border-emerald-500/30' 
                      : isInProgress 
                        ? 'bg-amber-500/5 border-amber-500/40 shadow-xs' 
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {isInProgress && <Clock className="w-5 h-5 text-amber-500 animate-pulse" />}
                      {!isDone && !isInProgress && <Circle className="w-5 h-5 text-stone-300 dark:text-stone-700" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 block">ขั้นที่ {idx + 1}</span>
                      <h4 className={`text-xs font-bold ${isDone ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                        {stage.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isDone ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                      isInProgress ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                      'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}>
                      {isDone ? 'เสร็จแล้ว' : isInProgress ? 'กำลังทำ' : 'รอเริ่ม'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStage(stage.id);
                      }}
                      className="p-1 text-stone-300 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= SECTION: BUDGET TRACKER ================= */}
      {activeSection === 'budget' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* Budget Master Card */}
          <div className="bg-stone-900 text-white p-4 rounded-3xl border border-stone-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400">งบประมาณรวมเป้าหมาย</span>
                <h3 className="text-xl font-black text-amber-400">
                  ฿{budget.target.toLocaleString()}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-400">คงเหลือ</span>
                <h3 className="text-sm font-bold text-emerald-400">
                  ฿{remainingBudget.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Visual Budget Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>ใช้ไปแล้ว ฿{totalSpent.toLocaleString()} ({budgetSpentPercent}%)</span>
                <span>เป้า 100%</span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetSpentPercent > 90 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${budgetSpentPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Add Expense Action */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              📊 รายการจัดสรรงบ ({budget.categories.length} หมวด)
            </span>
            <button
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm active:scale-95 transition-all ${
                isJob ? 'bg-sky-600' : 'bg-rose-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกจ่ายจริง</span>
            </button>
          </div>

          {/* New Expense Form */}
          {isAddingExpense && (
            <form onSubmit={handleAddExpense} className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
                <span>💸</span> บันทึกค่าใช้จ่ายจริงโดย {currentUser}
              </h4>
              <input
                type="text"
                placeholder="รายการค่าใช้จ่าย (เช่น มัดจำเสาเข็ม, ประตูรั้ว)"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="จำนวนเงิน (บาท)"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  {budget.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="flex-1 py-2 text-xs bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-xs font-bold text-white rounded-xl ${isJob ? 'bg-sky-600' : 'bg-rose-600'}`}
                >
                  บันทึกยอดเงิน
                </button>
              </div>
            </form>
          )}

          {/* Budget Categories List */}
          <div className="space-y-2">
            {budget.categories.map((cat) => {
              const catSpent = (cat.spent || 0) + 
                budget.expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
              const catPercent = Math.min(100, Math.round((catSpent / (cat.budgeted || 1)) * 100));

              return (
                <div key={cat.id} className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-stone-200">{cat.name}</span>
                    <span className="font-mono text-stone-500">
                      ฿{catSpent.toLocaleString()} / ฿{cat.budgeted.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${catPercent >= 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
