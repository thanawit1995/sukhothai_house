import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title = 'ยืนยันการลบ', message = 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 animate-scale-up">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">{title}</h4>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{message}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 transition-all"
          >
            ยกเลิก
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ยืนยันลบ</span>
          </button>
        </div>

      </div>
    </div>
  );
}
