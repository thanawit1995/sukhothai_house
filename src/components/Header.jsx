import React, { useState } from 'react';
import { Bell, RefreshCw, Settings, Check, ChevronRight } from 'lucide-react';

export default function Header({ 
  currentUser, 
  onSwitchUser, 
  onOpenSettings,
  notifications,
  onNotificationClick,
  onMarkAllRead
}) {
  const isJob = currentUser === 'JOB';
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs transition-colors">
      <div className="max-w-md mx-auto px-4 pt-[max(env(safe-area-inset-top),14px)] pb-2.5 flex items-center justify-between">
        
        {/* Project Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-xs border border-amber-200">
            🏡
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-stone-800">บ้านรัตนากร เฟส 10</h1>
            <p className="text-[10px] text-stone-400">ต.บ้านกล้วย อ.เมืองสุโขทัย</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell with Badge (Req 3) */}
          <div className="relative">
            <button
              onClick={() => setShowNotiDropdown(!showNotiDropdown)}
              className="relative w-9 h-9 rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 flex items-center justify-center text-stone-600 active:scale-95 transition-all"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotiDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                  onClick={() => setShowNotiDropdown(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-3xl shadow-xl border border-stone-200 p-3 space-y-2.5 animate-slide-up">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-800">🔔 การแจ้งเตือน</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount} ใหม่
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllRead();
                        }}
                        className="text-[10px] text-sky-600 font-medium hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-stone-400">
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
                            !noti.isRead ? 'bg-amber-50/80 border border-amber-200/60' : 'bg-stone-50 hover:bg-stone-100'
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">
                            {noti.user === 'JOB' ? '👔' : '🌸'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-stone-800 truncate">
                              {noti.title}
                            </h5>
                            <p className="text-[10px] text-stone-500 line-clamp-2">
                              {noti.message}
                            </p>
                            <span className="text-[9px] text-stone-400 block mt-1">
                              {noti.date}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 self-center" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Switcher: JOB <-> Pealpeal */}
          <button
            onClick={onSwitchUser}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all duration-200 active:scale-95 shadow-xs ${
              isJob 
                ? 'bg-sky-50 border-sky-300 text-sky-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
            title="แตะเพื่อสลับผู้ใช้งาน (JOB <-> Pealpeal)"
          >
            <span className="text-sm">{isJob ? '👔' : '🌸'}</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[8px] uppercase tracking-wider text-stone-400">ผู้ใช้</span>
              <span className="text-[11px] font-bold">{currentUser}</span>
            </div>
            <RefreshCw className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Settings / Cloud */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 flex items-center justify-center text-stone-600 active:scale-95 transition-all"
            aria-label="ตั้งค่าระบบ"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
