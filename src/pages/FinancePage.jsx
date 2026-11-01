import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, DollarSign, Receipt, Trash2, Edit3, Image as ImageIcon, X, Calendar, User, Download, Check, Filter } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ImageViewerModal from '../components/ImageViewerModal';

export default function FinancePage({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense, currentUser }) {
  const isJob = currentUser === 'JOB';

  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filter state for dashboard chips (Req 5)
  // 'ALL' | 'JOB' | 'Pealpeal'
  const [filterPayer, setFilterPayer] = useState('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('ทั่วไป');
  const [slipImage, setSlipImage] = useState(null);

  // Delete Confirmation State (Req 1)
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Fullscreen slip modal with download (Req 2 & 3)
  const [viewingSlip, setViewingSlip] = useState(null);

  // Totals calculation
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const jobTotal = expenses.filter(e => e.paidBy === 'JOB').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pealTotal = expenses.filter(e => e.paidBy === 'Pealpeal').reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Filtered expense list (Req 5)
  const displayedExpenses = expenses.filter(exp => {
    if (filterPayer === 'JOB') return exp.paidBy === 'JOB';
    if (filterPayer === 'Pealpeal') return exp.paidBy === 'Pealpeal';
    return true;
  });

  // Handle slip upload from device (Req 3: preserve full ratio, no crop)
  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setAmount('');
    setPaidBy(currentUser);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('ทั่วไป');
    setSlipImage(null);
    setEditingExpense(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(exp.amount);
    setPaidBy(exp.paidBy);
    setDate(exp.date || new Date().toISOString().split('T')[0]);
    setCategory(exp.category || 'ทั่วไป');
    setSlipImage(exp.slipImage || null);
    setIsAdding(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, {
        title: title.trim(),
        amount: Number(amount),
        paidBy,
        date,
        category,
        slipImage
      }, currentUser);
    } else {
      onAddExpense({
        title: title.trim(),
        amount: Number(amount),
        paidBy,
        date,
        category,
        slipImage
      });
    }

    setIsAdding(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Top Interactive Filterable Dashboard (Req 5) */}
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-4 text-stone-950 shadow-md space-y-3">
        
        {/* Total Card (Click to reset filter to ALL) */}
        <div 
          onClick={() => setFilterPayer('ALL')}
          className="p-2.5 rounded-2xl cursor-pointer transition-all active:scale-98"
          title="แตะเพื่อดูค่าใช้จ่ายทั้งหมด"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
              รวมค่าใช้จ่ายสร้างบ้านทั้งหมด
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">
            ฿{totalSpent.toLocaleString()}
          </h2>
        </div>

        {/* 2-Column Split: JOB vs Pealpeal (Click to filter) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-950/15">
          {/* JOB Filter Card */}
          <div 
            onClick={() => setFilterPayer(prev => prev === 'JOB' ? 'ALL' : 'JOB')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all active:scale-95 ${
              filterPayer === 'JOB'
                ? 'bg-white shadow-md ring-3 ring-sky-500 text-stone-900'
                : 'bg-white/30 backdrop-blur-xs hover:bg-white/40'
            }`}
            title="แตะเพื่อดูเฉพาะรายการที่ JOB จ่าย"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold block opacity-90 flex items-center gap-1">
                <span>👔</span> JOB จ่ายแล้ว
              </span>
            </div>
            <span className="text-base font-black text-sky-950">
              ฿{jobTotal.toLocaleString()}
            </span>
          </div>

          {/* Pealpeal Filter Card */}
          <div 
            onClick={() => setFilterPayer(prev => prev === 'Pealpeal' ? 'ALL' : 'Pealpeal')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all active:scale-95 ${
              filterPayer === 'Pealpeal'
                ? 'bg-white shadow-md ring-3 ring-rose-500 text-stone-900'
                : 'bg-white/30 backdrop-blur-xs hover:bg-white/40'
            }`}
            title="แตะเพื่อดูเฉพาะรายการที่ Pealpeal จ่าย"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold block opacity-90 flex items-center gap-1">
                <span>🌸</span> Pealpeal จ่ายแล้ว
              </span>
            </div>
            <span className="text-base font-black text-rose-950">
              ฿{pealTotal.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Filter Active Hint Banner (Req 5) */}
      {filterPayer !== 'ALL' && (
        <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-2xl bg-amber-100/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-stone-800 dark:text-amber-200 font-bold animate-slide-up">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            กำลังแสดงเฉพาะที่: {filterPayer === 'JOB' ? '👔 JOB จ่าย' : '🌸 Pealpeal จ่าย'}
          </span>
          <button 
            onClick={() => setFilterPayer('ALL')}
            className="text-amber-900 dark:text-amber-300 underline text-[11px] hover:text-black dark:hover:text-white font-extrabold"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
          📋 รายการค่าใช้จ่าย ({displayedExpenses.length} รายการ)
        </h4>

        <button
          onClick={handleOpenAdd}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs active:scale-95 transition-all ${
            isJob ? 'bg-sky-600' : 'bg-rose-500'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>บันทึกรายจ่าย</span>
        </button>
      </div>

      {/* Add / Edit Transaction Drawer Modal */}
      {isAdding && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {editingExpense ? '✏️ แก้ไขรายการจ่าย' : '💸 บันทึกรายการจ่ายใหม่'}
              </span>
              <button type="button" onClick={() => setIsAdding(false)} className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">ชื่อรายการ</label>
              <input
                type="text"
                placeholder="เช่น ค่ามัดจำเสาเข็ม, ประตูรั้ว, กระเบื้อง"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">วันที่จ่าย</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Paid By Selector (JOB vs Pealpeal) */}
            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">ใครเป็นคนจ่าย?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaidBy('JOB')}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                    paidBy === 'JOB' ? 'bg-sky-600 text-white shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  👔 JOB จ่าย
                </button>
                <button
                  type="button"
                  onClick={() => setPaidBy('Pealpeal')}
                  className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                    paidBy === 'Pealpeal' ? 'bg-rose-500 text-white shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  🌸 Pealpeal จ่าย
                </button>
              </div>
            </div>

            {/* Slip Upload from Device (Req 3: preserve proportion, no crop) */}
            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">แนบรูปสลิป / ใบเสร็จ</label>
              <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-dashed border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>📷 ถ่ายสลิป / อัพโหลดรูปจากเครื่อง</span>
                <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" />
              </label>

              {slipImage && (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-44 bg-stone-100 dark:bg-stone-950 p-1">
                  <img src={slipImage} alt="Slip" className="w-full h-full max-h-40 object-contain mx-auto" />
                  <button
                    type="button"
                    onClick={() => setSlipImage(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs bg-stone-100 dark:bg-stone-800 rounded-2xl text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex-1 py-2 text-xs font-bold text-white rounded-2xl shadow-md ${
                  isJob ? 'bg-sky-600' : 'bg-rose-500'
                }`}
              >
                {editingExpense ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Expenses List */}
      <div className="space-y-2.5">
        {displayedExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-xs space-y-1">
            <p>ไม่พบรายการรายจ่ายตามเงื่อนไขที่เลือก</p>
            {filterPayer !== 'ALL' && (
              <button 
                onClick={() => setFilterPayer('ALL')}
                className="text-amber-700 dark:text-amber-400 underline text-xs font-bold block mx-auto mt-1"
              >
                กดเพื่อดูรายการทั้งหมด
              </button>
            )}
          </div>
        ) : (
          displayedExpenses.map((exp) => {
            const expIsJob = exp.paidBy === 'JOB';

            return (
              <div 
                key={exp.id}
                className="p-3.5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Slip Thumbnail - strictly object-contain with no cropping! (Req 3) */}
                  {exp.slipImage ? (
                    <div 
                      onClick={() => setViewingSlip({ src: exp.slipImage, alt: `สลิป - ${exp.title}` })}
                      className="w-13 h-13 rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-700/60 bg-stone-100 dark:bg-stone-950 shrink-0 cursor-pointer shadow-xs active:scale-95 p-0.5 flex items-center justify-center relative group"
                      title="แตะเพื่อดูสลิปเต็ม & บันทึกลงเครื่อง"
                    >
                      <img src={exp.slipImage} alt="Slip" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 font-bold">
                      ฿
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                      {exp.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                        expIsJob ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {expIsJob ? '👔 JOB จ่าย' : '🌸 Pealpeal จ่าย'}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                        {exp.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-stone-900 dark:text-stone-100 block">
                    ฿{Number(exp.amount).toLocaleString()}
                  </span>

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 active:scale-90"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Delete button (Req 1: opens ConfirmModal) */}
                    <button
                      onClick={() => setExpenseToDelete(exp)}
                      className="p-1 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 active:scale-90"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal (Req 1) */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title="ยืนยันการลบรายจ่าย"
        message={`คุณต้องการลบรายการ "${expenseToDelete?.title}" จำนวน ฿${Number(expenseToDelete?.amount || 0).toLocaleString()} หรือไม่?`}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id, currentUser);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />

      {/* Fullscreen Slip Viewer Modal with Download (Req 2 & 3) */}
      <ImageViewerModal
        isOpen={!!viewingSlip}
        src={viewingSlip?.src}
        alt={viewingSlip?.alt}
        onClose={() => setViewingSlip(null)}
      />

    </div>
  );
}
