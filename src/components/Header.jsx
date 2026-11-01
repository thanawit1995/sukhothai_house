import React, { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, Check, ChevronRight, Monitor, Smartphone, Sun, Moon } from 'lucide-react';

export default function Header({ 
  currentUser, 
  onSwitchUser, 
  viewMode,
  onToggleViewMode,
  theme,
  onToggleTheme,
  notifications,
  onNotificationClick,
  onMarkAllRead
}) {
  const isJob = currentUser === 'JOB';
  const isDark = theme === 'dark';
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const notiRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Click / touch outside to close notification dropdown (Req 2)
  useEffect(() => {
    if (!showNotiDropdown) return;
    const handleOutsideClick = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setShowNotiDropdown(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showNotiDropdown]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-amber-100 dark:border-stone-800 shadow-xs transition-colors">
      <div className={`mx-auto px-3 sm:px-4 pt-[max(env(safe-area-inset-top),10px)] pb-2 flex items-center justify-between gap-1.5 transition-all duration-300 ${
        viewMode === 'desktop' ? 'max-w-7xl px-6' : 'max-w-md'
      }`}>
        
        {/* Project Branding (Never wraps title) */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg sm:text-xl shadow-xs border border-amber-200 dark:border-amber-800 shrink-0">
            🏡
          </div>
          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
              บ้านรัตนากร เฟส 10
            </h1>
            <p className="text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-500 whitespace-nowrap leading-none mt-0.5">
              ต.บ้านกล้วย อ.เมืองสุโขทัย
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Day / Night Mode Toggle Button (Req 2) */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center text-stone-700 dark:text-amber-400 active:scale-95 transition-all shadow-xs"
            title={isDark ? 'สลับเป็นโหมดกลางวัน (สว่าง)' : 'สลับเป็นโหมดกลางคืน (ถนอมสายตา)'}
            aria-label="สลับโหมดกลางวัน/กลางคืน"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Desktop <-> Mobile View Toggle Button (Req 1) */}
          <button
            onClick={onToggleViewMode}
            className="h-8 px-2 sm:px-2.5 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100/80 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-400 border border-amber-200/80 dark:border-stone-700 flex items-center gap-1 active:scale-95 transition-all shadow-xs"
            title={viewMode === 'desktop' ? 'สลับกลับเป็นมุมมองมือถือ' : 'สลับเป็นมุมมองจอคอมพิวเตอร์ (3 คอลัมน์)'}
          >
            {viewMode === 'desktop' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold hidden md:inline">มือถือ</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold hidden md:inline">จอคอม</span>
              </>
            )}
          </button>

          {/* Profile Switcher: JOB <-> Pealpeal */}
          <button
            onClick={onSwitchUser}
            className={`h-8 px-2 sm:px-2.5 rounded-xl border flex items-center gap-1 transition-all duration-200 active:scale-95 shadow-xs ${
              isJob 
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300' 
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
            title="แตะเพื่อสลับผู้ใช้งาน (JOB <-> Pealpeal)"
          >
            <span className="text-xs">{isJob ? '👔' : '🌸'}</span>
            <span className="text-[11px] font-black">{currentUser}</span>
            <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>

          {/* Notification Bell with Badge (Req 1 & 2) */}
          <div className="relative" ref={notiRef}>
            <button
              onClick={() => setShowNotiDropdown(!showNotiDropdown)}
              className="relative w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 active:scale-95 transition-all shadow-xs"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer (Fixed on Mobile, Absolute on Desktop - Perfectly Aligned) */}
            {showNotiDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50 backdrop-blur-2xs cursor-pointer"
                  onClick={() => setShowNotiDropdown(false)}
                />
                <div className="fixed top-14 left-3 right-3 sm:absolute sm:top-11 sm:right-0 sm:left-auto sm:w-80 max-w-sm mx-auto z-50 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-3.5 space-y-2.5 animate-slide-up">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">🔔 การแจ้งเตือน</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllRead();
                        }}
                        className="text-[10px] text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400 dark:text-stone-500">
                        ไม่มีการแจ้งเตือนใหม่
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((noti) => (
                        <div
                          key={noti.id}
                          onClick={() => {
                            onNotificationClick(noti.targetTab, noti.targetId);
                            setShowNotiDropdown(false);
                          }}
                          className={`p-2.5 rounded-2xl cursor-pointer transition-all active:scale-98 flex items-start gap-2.5 ${
                            !noti.isRead 
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60' 
                              : 'bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">
                            {noti.user === 'JOB' ? '👔' : '🌸'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                              {noti.title}
                            </h5>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2">
                              {noti.message}
                            </p>
                            <span className="text-[9px] text-stone-400 dark:text-stone-500 block mt-1">
                              {noti.date}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0 self-center" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
