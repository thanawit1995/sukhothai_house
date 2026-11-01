import React from 'react';
import { FileText, Hammer, Wallet, Home } from 'lucide-react';

export default function BottomNav({ activeTab, onChangeTab, currentUser }) {
  const isJob = currentUser === 'JOB';
  const activeColor = isJob ? 'text-sky-600' : 'text-rose-600';
  const activeBg = isJob ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700';

  const navItems = [
    { id: 'notes', label: 'โน้ตร่วมกัน', icon: FileText },
    { id: 'status', label: 'สถานะงาน', icon: Hammer },
    { id: 'finance', label: 'การเงิน', icon: Wallet },
    { id: 'house', label: 'ผังบ้าน & 3D', icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-amber-100/80 dark:border-stone-800 shadow-lg transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all active:scale-90"
              style={{ minHeight: '52px' }}
            >
              <div className={`p-1.5 rounded-2xl transition-all ${isActive ? activeBg : 'text-stone-400 dark:text-stone-500'}`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'text-stone-400 dark:text-stone-500'}`} />
              </div>
              
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? activeColor : 'text-stone-400 dark:text-stone-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
