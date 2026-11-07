import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Database, 
  Share2, 
  Download, 
  Upload, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, sanitizeSupabaseUrl } from '../lib/supabase';
import { StorageService } from '../lib/storage';
import OneDriveButton from './OneDriveButton';
import CanvaButton from './CanvaButton';

export default function SyncModal({ isOpen, onClose, onSyncComplete }) {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  
  const [syncStatus, setSyncStatus] = useState(() => StorageService.getSyncStatus());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setConfig(cfg);
      setUrl(cfg.url);
      setKey(cfg.key);
      setSyncStatus(StorageService.getSyncStatus());
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // SQL Script for Supabase setup (Idempotent - safe to run multiple times)
  const SUPABASE_SQL = `-- 1. สร้างตารางสำหรับเก็บข้อมูลซิงค์ของบ้านเรา
CREATE TABLE IF NOT EXISTS public.home_app_sync (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 2. เปิดใช้งาน Row Level Security (RLS) และอนุญาตให้อ่านเขียนได้
ALTER TABLE public.home_app_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow couples all operations" ON public.home_app_sync;
DROP POLICY IF EXISTS "Allow couples all" ON public.home_app_sync;
CREATE POLICY "Allow couples all"
ON public.home_app_sync
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. เปิดระบบ Realtime (เช็คก่อนเพิ่ม ป้องกัน Error 42710)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'home_app_sync'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.home_app_sync;
  END IF;
END $$;`;

  // Format date nicely
  const formatTime = (isoString) => {
    if (!isoString) return 'ยังไม่เคยซิงค์';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' น.';
    } catch {
      return isoString;
    }
  };

  // Handle Save
  const handleSave = (e) => {
    e.preventDefault();
    if (!url || !key) {
      setFeedback({ type: 'error', message: 'กรุณากรอกทั้ง Project URL และ Anon Key' });
      return;
    }
    const cleanUrl = sanitizeSupabaseUrl(url);
    saveSupabaseConfig(cleanUrl, key);
  };

  // Handle Test Connection & Sync Now
  const handleTestAndSync = async () => {
    setIsTesting(true);
    setFeedback(null);
    const result = await StorageService.testConnection();
    setIsTesting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: '✅ เชื่อมต่อและซิงค์ข้อมูลกับคลาวด์สำเร็จเรียบร้อย!' });
      setSyncStatus(StorageService.getSyncStatus());
      if (onSyncComplete) onSyncComplete();
    } else {
      setFeedback({ type: 'error', message: result.error });
      setSyncStatus(StorageService.getSyncStatus());
    }
  };

  // Immediate Sync button
  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setFeedback(null);
    const serverData = await StorageService.pullServerSync();
    const pushRes = await StorageService.triggerAutoSync();
    setIsSyncing(false);

    setSyncStatus(StorageService.getSyncStatus());

    if (pushRes.error) {
      setFeedback({ type: 'error', message: `ซิงค์ไม่สำเร็จ: ${pushRes.error}` });
    } else {
      setFeedback({ type: 'success', message: '✅ อัปเดตและดึงข้อมูลล่าสุดจากคลาวด์เรียบร้อยแล้ว' });
      if (onSyncComplete && (serverData || pushRes.payload)) {
        onSyncComplete(serverData || pushRes.payload);
      }
    }
  };

  // Copy partner quick setup link
  const handleCopyPartnerLink = () => {
    if (!config.url || !config.key) return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const syncParam = encodeURIComponent(`${config.url}|${config.key}`);
    const shareableUrl = `${origin}${pathname}#sync=${syncParam}`;

    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Copy SQL snippet
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const success = StorageService.exportBackup();
    if (success) {
      setFeedback({ type: 'success', message: '💾 ดาวน์โหลดไฟล์สำรองข้อมูล (JSON) สำเร็จ' });
    }
  };

  // Import JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = StorageService.importBackup(content);
      if (res.success) {
        setFeedback({ type: 'success', message: '📥 นำเข้าข้อมูลสำรองสำเร็จ ข้อมูลได้รับการอัปเดตแล้ว' });
        if (onSyncComplete) onSyncComplete(res.data);
      } else {
        setFeedback({ type: 'error', message: `นำเข้าไม่สำเร็จ: ${res.error}` });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const isConnected = syncStatus.isConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs ${
              isConnected
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              {isConnected ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-white">
                ระบบคลาวด์ซิงก์ (Cloud Sync)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 dark:text-stone-500">
                เชื่อมต่อข้อมูลระหว่าง JOB 👔 & Pealpeal 🌸 แบบ Realtime 24 ชม.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white flex items-center justify-center transition-all"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          isConnected
            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
            : syncStatus.hasError
            ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
            : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : syncStatus.hasError ? (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CloudOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isConnected 
                    ? '🟢 เชื่อมต่อคลาวด์ Supabase แล้ว' 
                    : syncStatus.hasError
                    ? '🔴 พบข้อผิดพลาดในการซิงค์'
                    : '🟡 โหมดในเครื่อง (ยังไม่ได้เชื่อมต่อคลาวด์)'}
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                  {isConnected 
                    ? 'ข้อมูลของคุณและคุณพีรยาจะซิงก์เข้าหากันทันทีทั้งบนคอมและมือถือ' 
                    : syncStatus.hasError
                    ? syncStatus.lastError
                    : 'ปัจจุบันข้อมูลบันทึกอยู่เฉพาะในเครื่องนี้ หากต้องการให้มือถือและคอมอัปเดตตรงกัน กรุณาใส่ Supabase Key ด้านล่าง'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                  <span>⏱️ ซิงค์ล่าสุด: {formatTime(syncStatus.lastSyncTime)}</span>
                </div>
              </div>
            </div>

            {/* Quick Sync Button */}
            {isConnected && (
              <button
                onClick={handleManualSyncNow}
                disabled={isSyncing}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                title="กดเพื่อส่งข้อมูลปัจจุบันและดึงข้อมูลใหม่ทันที"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ทันที'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-100/90 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1 font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Quick Share Link for Pealpeal */}
        {isConnected && (
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  🔗 ลิงก์ตั้งค่าอัตโนมัติสำหรับคุณพีรยา (Pealpeal)
                </span>
              </div>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
                สะดวกมาก
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
              กดคัดลอกลิงก์แล้วส่งให้คุณพีรยาใน LINE เมื่อเปิดลิงก์บนมือถือ ระบบจะตั้งค่าซิงค์ให้อัตโนมัติทันที ไม่ต้องกรอก Key เอง
            </p>
            <button
              onClick={handleCopyPartnerLink}
              className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'คัดลอกลิงก์เรียบร้อยแล้ว!' : 'คัดลอกลิงก์ส่งให้ Pealpeal ใน LINE'}</span>
            </button>
          </div>
        )}

        {/* Project Cloud & Design Hub */}
        <div className="space-y-2">
          <OneDriveButton variant="card" />
          <CanvaButton variant="card" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>Supabase Project URL</span>
              </label>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
              >
                <span>เปิด Supabase</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzabcdefghijklm.supabase.co"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Anon Public API Key</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleTestAndSync}
                disabled={isTesting}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all border border-stone-200 dark:border-stone-700 disabled:opacity-50"
                title="ทดสอบการอ่านและเขียนกับ Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบเชื่อมต่อ'}</span>
              </button>
            )}

            {config.url && (
              <button
                type="button"
                onClick={clearSupabaseConfig}
                className="px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs active:scale-95 transition-all border border-rose-200 dark:border-rose-900"
                title="ล้างค่าและกลับสู่โหมดในเครื่อง"
              >
                ล้างค่า
              </button>
            )}
          </div>
        </form>

        {/* 1-Click Database Setup Guide (Collapsible) */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="w-full p-3 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <span>📌</span>
              <span>วิธีเปิดฐานข้อมูล Supabase ฟรี (3 ขั้นตอน 1 นาที)</span>
            </div>
            {showSqlGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSqlGuide && (
            <div className="p-3.5 bg-white dark:bg-stone-900 space-y-3 text-xs border-t border-stone-200 dark:border-stone-800">
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300">
                <li>
                  เปิดเว็บ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 underline">supabase.com</a> ล็อกอินแล้วกด <b>New Project</b> (ฟรีตลอดไป)
                </li>
                <li>
                  ไปที่เมนู <b>SQL Editor</b> (รูปไอคอน SQL แถบซ้าย) แล้ววางโค้ดด้านล่างนี้ จากนั้นกดปุ่ม <b>Run</b>
                </li>
              </ol>

              <div className="relative">
                <pre className="p-2.5 rounded-xl bg-stone-900 text-stone-100 font-mono text-[10px] overflow-x-auto max-h-36">
                  {SUPABASE_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center gap-1 shadow-xs"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                3. ไปที่ <b>Project Settings &gt; API</b> คัดลอก <b>Project URL</b> และ <b>anon public key</b> มาวางในช่องด้านบน แล้วกดบันทึก เป็นอันเสร็จสมบูรณ์!
              </p>
            </div>
          )}
        </div>

        {/* Data Backup & Restore (JSON) */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="font-medium text-[11px]">สำรองข้อมูล:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
              title="ดาวน์โหลดข้อมูลทั้งหมดเก็บไว้ในเครื่อง"
            >
              <Download className="w-3 h-3" />
              <span>ส่งออก JSON</span>
            </button>

            <label className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer">
              <Upload className="w-3 h-3" />
              <span>นำเข้า JSON</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
