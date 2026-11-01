import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InstallPwaModal from './components/InstallPwaModal';

import NotesPage from './pages/NotesPage';
import StatusPage from './pages/StatusPage';
import FinancePage from './pages/FinancePage';
import HouseBlueprintPage from './pages/HouseBlueprintPage';

import { StorageService } from './lib/storage';

const TABS = ['notes', 'status', 'finance', 'house'];

export default function App() {
  // Current user: 'JOB' or 'Pealpeal'
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('home_current_user') || 'JOB';
  });

  // Day vs Night Mode (Req 2)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('home_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('home_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Desktop vs Mobile View Mode (Req 1)
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('home_view_mode');
    if (saved) return saved;
    return typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'desktop' : 'mobile';
  });

  // Active navigation tab for mobile mode
  // 'notes' | 'status' | 'finance' | 'house'
  const [activeTab, setActiveTab] = useState('notes');
  const activeIndex = TABS.indexOf(activeTab);

  // Desktop 3rd Column tab switcher ('finance' | 'house')
  const [desktopCol3Tab, setDesktopCol3Tab] = useState('finance');

  // Highlighted target note if clicked from notification
  const [targetNoteId, setTargetNoteId] = useState(null);

  // App persistent data
  const [notes, setNotes] = useState(StorageService.getNotes());
  const [stages, setStages] = useState(StorageService.getStages());
  const [expenses, setExpenses] = useState(StorageService.getExpenses());
  const [notifications, setNotifications] = useState(StorageService.getNotifications());

  // Touch Swipe Gesture State (Req 3: iOS Duo finger-following swipe)
  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    dragOffset: 0,
    isDragging: false,
    directionLocked: null // 'horizontal' | 'vertical' | null
  });

  // Background Automatic & Realtime Cloud Sync between devices (Req 7)
  useEffect(() => {
    const handleSyncData = (serverData) => {
      if (!serverData) return;
      if (serverData.notes) setNotes(serverData.notes);
      if (serverData.stages) setStages(serverData.stages);
      if (serverData.expenses) setExpenses(serverData.expenses);
      if (serverData.notifications) setNotifications(serverData.notifications);
    };

    // 1. Initial sync
    StorageService.pullServerSync().then(handleSyncData);

    // 2. Realtime WebSocket subscription (Instant sync on 4G/Cloud)
    const unsubscribe = StorageService.subscribeRealtimeSync(handleSyncData);

    // 3. Fallback interval polling
    const interval = setInterval(() => {
      StorageService.pullServerSync().then(handleSyncData);
    }, 4000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Switch profile handler (JOB <-> Pealpeal)
  const handleSwitchUser = () => {
    const nextUser = currentUser === 'JOB' ? 'Pealpeal' : 'JOB';
    setCurrentUser(nextUser);
    localStorage.setItem('home_current_user', nextUser);
  };

  // Toggle View Mode (Mobile <-> Desktop) (Req 1)
  const handleToggleViewMode = () => {
    const next = viewMode === 'mobile' ? 'desktop' : 'mobile';
    setViewMode(next);
    localStorage.setItem('home_view_mode', next);
  };

  // Note actions
  const handleAddNote = (newNoteData) => {
    const updated = StorageService.addNote(newNoteData);
    setNotes(updated);
    setNotifications(StorageService.getNotifications());
  };

  const handleDeleteNote = (id) => {
    const updated = StorageService.deleteNote(id, currentUser);
    setNotes(updated);
    setNotifications(StorageService.getNotifications());
  };

  const handleUpdateNote = (id, updates) => {
    const updated = StorageService.updateNote(id, updates, currentUser);
    setNotes(updated);
    setNotifications(StorageService.getNotifications());
  };

  // Stage actions
  const handleUpdateStages = (newStages) => {
    StorageService.saveStages(newStages);
    setStages(newStages);
    setNotifications(StorageService.getNotifications());
  };

  // Expense actions
  const handleAddExpense = (exp) => {
    const updated = StorageService.addExpense(exp);
    setExpenses(updated);
    setNotifications(StorageService.getNotifications());
  };

  const handleUpdateExpense = (id, updates) => {
    const updated = StorageService.updateExpense(id, updates, currentUser);
    setExpenses(updated);
    setNotifications(StorageService.getNotifications());
  };

  const handleDeleteExpense = (id) => {
    const updated = StorageService.deleteExpense(id, currentUser);
    setExpenses(updated);
    setNotifications(StorageService.getNotifications());
  };

  // Notification navigation handler (Req 3)
  const handleNotificationClick = (targetTab, targetId) => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    if (targetId) {
      setTargetNoteId(targetId);
      setTimeout(() => {
        const el = document.getElementById(`note-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = StorageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  // Touch Swipe Handlers (iOS Duo Finger Tracking - Req 3)
  const handleTouchStart = (e) => {
    if (viewMode === 'desktop') return;
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      dragOffset: 0,
      isDragging: false,
      directionLocked: null
    });
  };

  const handleTouchMove = (e) => {
    if (viewMode === 'desktop') return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;

    let locked = touchState.directionLocked;
    if (!locked) {
      // Determine gesture direction
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
        locked = 'vertical';
      } else if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        locked = 'horizontal';
      }
    }

    if (locked === 'horizontal') {
      let effectiveDelta = deltaX;
      // Rubber-band resistance at boundary edges
      if ((activeIndex === 0 && deltaX > 0) || (activeIndex === TABS.length - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.25;
      }

      setTouchState({
        startX: touchState.startX,
        startY: touchState.startY,
        dragOffset: effectiveDelta,
        isDragging: true,
        directionLocked: 'horizontal'
      });
    } else if (locked === 'vertical') {
      setTouchState(prev => ({
        ...prev,
        directionLocked: 'vertical'
      }));
    }
  };

  const handleTouchEnd = () => {
    if (viewMode === 'desktop') return;
    if (touchState.isDragging && touchState.directionLocked === 'horizontal') {
      const threshold = 50; // swipe threshold in px
      if (touchState.dragOffset < -threshold && activeIndex < TABS.length - 1) {
        setActiveTab(TABS[activeIndex + 1]);
      } else if (touchState.dragOffset > threshold && activeIndex > 0) {
        setActiveTab(TABS[activeIndex - 1]);
      }
    }

    setTouchState({
      startX: 0,
      startY: 0,
      dragOffset: 0,
      isDragging: false,
      directionLocked: null
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex flex-col font-sans antialiased selection:bg-amber-200 overflow-x-hidden transition-colors duration-200">
      
      {/* Sticky Mobile/Desktop Header with Notification Bell, Profile Switcher, Day/Night & Mode Toggle */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* ================= DESKTOP 3-COLUMN DASHBOARD (Req 1) ================= */}
      {viewMode === 'desktop' ? (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-4 animate-fade-in">
          <div className="grid grid-cols-12 gap-5 items-start">
            
            {/* Column 1: โน้ต & ไอเดียล่าสุด */}
            <section className="col-span-12 lg:col-span-4 bg-white/70 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800 px-2">
                <span className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <span>📝</span> บันทึก & ไอเดีย ({notes.length})
                </span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  คอลัมน์ที่ 1
                </span>
              </div>
              <NotesPage
                notes={notes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                currentUser={currentUser}
                targetNoteId={targetNoteId}
              />
            </section>

            {/* Column 2: ความคืบหน้า & ไทม์ไลน์ก่อสร้าง */}
            <section className="col-span-12 lg:col-span-4 bg-white/70 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800 px-2">
                <span className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <span>🏗️</span> ความคืบหน้างาน ({stages.filter(s => s.status === 'done').length}/{stages.length})
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  คอลัมน์ที่ 2
                </span>
              </div>
              <StatusPage
                stages={stages}
                onUpdateStages={handleUpdateStages}
                currentUser={currentUser}
              />
            </section>

            {/* Column 3: คุมงบการเงิน & ผังบ้าน 3D (สลับดูได้สะดวก) */}
            <section className="col-span-12 lg:col-span-4 bg-white/70 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs p-3 space-y-3">
              {/* Column 3 Tab Switcher */}
              <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold text-stone-600 dark:text-stone-400">
                <button
                  onClick={() => setDesktopCol3Tab('finance')}
                  className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    desktopCol3Tab === 'finance' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-black' : 'hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <span>💰</span> การเงิน & คุมงบ
                </button>
                <button
                  onClick={() => setDesktopCol3Tab('house')}
                  className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    desktopCol3Tab === 'house' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-black' : 'hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <span>🏠</span> ผังบ้าน 3D & สเปก
                </button>
              </div>

              {desktopCol3Tab === 'finance' ? (
                <FinancePage
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                  currentUser={currentUser}
                />
              ) : (
                <HouseBlueprintPage
                  notes={notes}
                  onAddNote={handleAddNote}
                  currentUser={currentUser}
                />
              )}
            </section>

          </div>
        </main>
      ) : (
        /* ================= MOBILE FINGER-TRACKING SWIPEABLE CAROUSEL (Req 3) ================= */
        <>
          <main 
            className="flex-1 w-full max-w-md mx-auto overflow-hidden relative select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Sliding Multi-tab Strip with iOS-style Spring & 1:1 Finger Tracking */}
            <div 
              className="flex w-full will-change-transform"
              style={{
                transform: `translateX(calc(-${activeIndex * 100}% + ${touchState.dragOffset}px))`,
                transition: touchState.isDragging 
                  ? 'none' 
                  : 'transform 0.35s cubic-bezier(0.2, 0.95, 0.35, 1)'
              }}
            >
              {/* Tab 0: Notes & Ideas */}
              <div className="w-full shrink-0 min-w-full">
                <NotesPage
                  notes={notes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  currentUser={currentUser}
                  targetNoteId={targetNoteId}
                />
              </div>

              {/* Tab 1: Construction Progress Status */}
              <div className="w-full shrink-0 min-w-full">
                <StatusPage
                  stages={stages}
                  onUpdateStages={handleUpdateStages}
                  currentUser={currentUser}
                />
              </div>

              {/* Tab 2: Finance & Budget */}
              <div className="w-full shrink-0 min-w-full">
                <FinancePage
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                  currentUser={currentUser}
                />
              </div>

              {/* Tab 3: House Blueprint & Specs */}
              <div className="w-full shrink-0 min-w-full">
                <HouseBlueprintPage
                  notes={notes}
                  onAddNote={handleAddNote}
                  currentUser={currentUser}
                />
              </div>
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar (4 Main Tabs) */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              setTargetNoteId(null);
            }}
            currentUser={currentUser}
          />
        </>
      )}

      {/* PWA Smart Install Prompt Popup (Req 3) */}
      <InstallPwaModal />

    </div>
  );
}
