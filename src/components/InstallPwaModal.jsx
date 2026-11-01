import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // 2. Check dismissal cooldown (dismissed within 24 hours)
    const dismissedTime = localStorage.getItem('home_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // 4. Android / Chrome / Edge install prompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show modal after 1.5 seconds so user first sees the app
      setTimeout(() => setIsOpen(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after 2 seconds
    if (isIosDevice) {
      setTimeout(() => setIsOpen(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('home_pwa_dismissed', String(Date.now()));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-amber-200 dark:border-stone-800 space-y-4 animate-slide-up">
        
        {/* Header with App Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="./icons/icon-192.png" 
              alt="บ้านรัตนากร 10" 
              className="w-12 h-12 rounded-2xl shadow-md border border-amber-300"
            />
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                ติดตั้ง บ้านรัตนากร 10
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                เพื่อเปิดใช้งานไวขึ้น เหมือนแอปจริงบนมือถือ
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="bg-amber-50/70 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-100 dark:border-stone-700/60 text-xs space-y-1.5 text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">✓</span>
            <span>เปิดเต็มหน้าจอ ไม่มีแถบ URL มาเกะกะสายตา</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">✓</span>
            <span>ซิงก์ข้อมูลสร้างบ้านกับคู่ของคุณแบบ Realtime 24 ชม.</span>
          </div>
        </div>

        {/* iOS vs Android Action */}
        {isIOS ? (
          <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-2xl border border-sky-200 dark:border-sky-900 text-xs space-y-2 text-sky-900 dark:text-sky-200">
            <p className="font-bold flex items-center gap-1.5">
              <span>🍎</span> วิธีติดตั้งบน iPhone (Safari):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-sky-800 dark:text-sky-300">
              <li>แตะปุ่ม <strong>แชร์</strong> (ไอคอนสี่เหลี่ยมลูกศรชี้ขึ้น <Share className="w-3.5 h-3.5 inline text-sky-600" /> ด้านล่าง)</li>
              <li>เลื่อนลงแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม"</strong> (Add to Home Screen)</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-1 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs active:scale-98 shadow-xs"
            >
              เข้าใจแล้ว ปิดหน้าต่างนี้
            </button>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
            >
              ไว้คราวหลัง
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ติดตั้งทันที</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
