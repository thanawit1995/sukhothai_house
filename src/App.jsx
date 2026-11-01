import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SettingsModal from './components/SettingsModal';

import NotesPage from './pages/NotesPage';
import StatusPage from './pages/StatusPage';
import FinancePage from './pages/FinancePage';
import HouseBlueprintPage from './pages/HouseBlueprintPage';

import { StorageService } from './lib/storage';

export default function App() {
  // Current user: 'JOB' or 'Pealpeal'
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('home_current_user') || 'JOB';
  });

  // Active navigation tab (Req 8: 4 main tabs)
  // 'notes' | 'status' | 'finance' | 'house'
  const [activeTab, setActiveTab] = useState('notes');

  // Highlighted target note if clicked from notification
  const [targetNoteId, setTargetNoteId] = useState(null);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App persistent data
  const [notes, setNotes] = useState(StorageService.getNotes());
  const [stages, setStages] = useState(StorageService.getStages());
  const [expenses, setExpenses] = useState(StorageService.getExpenses());
  const [notifications, setNotifications] = useState(StorageService.getNotifications());

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

  return (
    <div className="min-h-screen bg-slate-50/70 text-stone-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      
      {/* Sticky Mobile Header with Notification Bell & Profile Switcher */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* Main Dynamic Page Content (Bright & Cheerful Theme) */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'notes' && (
          <NotesPage
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            currentUser={currentUser}
            targetNoteId={targetNoteId}
          />
        )}

        {activeTab === 'status' && (
          <StatusPage
            stages={stages}
            onUpdateStages={handleUpdateStages}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'finance' && (
          <FinancePage
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'house' && (
          <HouseBlueprintPage
            notes={notes}
            onAddNote={handleAddNote}
            currentUser={currentUser}
          />
        )}
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

      {/* Supabase Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
