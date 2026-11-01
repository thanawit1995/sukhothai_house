import React, { useState } from 'react';
import { X, Database, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

export default function SettingsModal({ isOpen, onClose }) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const isConnected = !!(currentConfig.url && currentConfig.key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">เชื่อมต่อ Supabase Realtime</h3>
              <p className="text-[10px] text-stone-400">ซิงก์ข้อมูลระหว่าง JOB & Pealpeal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs ${
          isConnected 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        }`}>
          {isConnected ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <div>
            <span className="font-bold block">
              {isConnected ? 'สถานะ: เชื่อมต่อ Supabase แล้ว' : 'สถานะ: ทำงานในโหมด Local-First'}
            </span>
            <span className="text-[10px] opacity-80">
              {isConnected ? 'ข้อมูลจะซิงก์ข้ามเครื่องทันทีเมื่อบันทึก' : 'ข้อมูลบันทึกลงเครื่องทันที และจะซิงก์เมื่อใส่ Supabase Key'}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-500 mb-1 font-medium">Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-500 mb-1 font-medium">Anon Public Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
