import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FolderOpen } from 'lucide-react';
import { getOneDriveAppUrl, openOneDriveHome, getPlatformInfo, ONEDRIVE_HOME_URL } from '../lib/onedrive';

/**
 * Microsoft OneDrive Official Cloud Icon
 */
export function OneDriveIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.364 13.568A5.434 5.434 0 0 0 18.25 9.1a6.452 6.452 0 0 0-11.233-2.251A4.868 4.868 0 0 0 0 11.666C0 14.394 2.188 16.6 4.887 16.6h14.477a4.636 4.636 0 0 0 0-9.272zm-14.477 7.509h14.477a7.618 7.618 0 0 0 6.634-11.396 7.822 7.822 0 0 0-6.19-4.225A9.453 9.453 0 0 0 11.373 0a9.28 9.28 0 0 0-8.91 6.516A7.433 7.433 0 0 0 .584 7.697a7.618 7.618 0 0 0 4.303 13.38z"/>
    </svg>
  );
}

/**
 * Multi-purpose OneDrive Button & Banner
 * 
 * Variants:
 * - 'header': Compact navbar button for Header.jsx (Responsive, switches directly to app on mobile)
 * - 'card': Rich banner card for HouseBlueprintPage / NotesPage with open & copy link buttons
 * - 'pill': Compact standalone pill button
 */
export default function OneDriveButton({ 
  variant = 'header',
  className = '',
  showLabel = true 
}) {
  const [isCopied, setIsCopied] = useState(false);
  const platform = typeof window !== 'undefined' ? getPlatformInfo() : { isDesktop: true };
  const appUrl = typeof window !== 'undefined' ? getOneDriveAppUrl() : ONEDRIVE_HOME_URL;
  const isDesktop = platform.isDesktop;

  const handleClick = (e) => {
    openOneDriveHome(e);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ONEDRIVE_HOME_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = ONEDRIVE_HOME_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  // Sub-bar Button (Full column 50% split for mobile/single-column header)
  if (variant === 'bar') {
    return (
      <a
        href={appUrl}
        onClick={handleClick}
        target={isDesktop ? '_blank' : undefined}
        rel="noopener noreferrer"
        className={`h-8 px-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/70 dark:from-sky-950/60 dark:to-blue-950/40 hover:from-sky-100 hover:to-blue-100 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-300 flex items-center justify-between active:scale-98 transition-all shadow-2xs group min-w-0 ${className}`}
        title="เปิดโฟลเดอร์ Home ในแอป OneDrive (สลับเข้าแอป)"
        aria-label="เปิดโฟลเดอร์ Home ในแอป OneDrive"
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <OneDriveIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black truncate text-sky-900 dark:text-sky-200">OneDrive [Home]</span>
        </div>
        <ExternalLink className="w-3 h-3 text-sky-500/70 dark:text-sky-400/70 shrink-0 ml-1" />
      </a>
    );
  }

  // Header Toolbar Button
  if (variant === 'header') {
    return (
      <a
        href={appUrl}
        onClick={handleClick}
        target={isDesktop ? '_blank' : undefined}
        rel="noopener noreferrer"
        className={`h-8 px-2 sm:px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs shrink-0 group ${className}`}
        title="เปิดโฟลเดอร์ Home ในแอป OneDrive (สลับเข้าแอป)"
        aria-label="เปิดโฟลเดอร์ Home ในแอป OneDrive"
      >
        <OneDriveIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
        {showLabel && (
          <span className="text-[10px] sm:text-[11px] font-black tracking-tight">
            <span className="inline sm:hidden">Home</span>
            <span className="hidden sm:inline">OneDrive [Home]</span>
          </span>
        )}
      </a>
    );
  }

  // Card Banner (For HouseBlueprintPage, etc.)
  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-sky-50 via-sky-50/80 to-blue-50/70 dark:from-sky-950/40 dark:via-sky-950/30 dark:to-blue-950/30 border border-sky-200/90 dark:border-sky-800/60 rounded-3xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs transition-all ${className}`}>
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs border border-sky-200/60 dark:border-sky-800/40">
            <OneDriveIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <span>OneDrive:</span>
                <span className="text-sky-700 dark:text-sky-300 font-extrabold underline decoration-sky-300 underline-offset-2">Home</span>
              </h4>
              <span className="text-[9px] bg-sky-100 dark:bg-sky-900/70 text-sky-800 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                คลังไฟล์โครงการ
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
              เปิดดูแบบก่อสร้าง, โฉนดรังวัด, สเปกวัสดุ และรูป 3D ต้นฉบับในแอป OneDrive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center w-full sm:w-auto">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white/90 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs"
            title="คัดลอกลิงก์ OneDrive Home"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">คัดลอกลิงก์</span>
              </>
            )}
          </button>

          {/* Open App Button */}
          <a
            href={appUrl}
            onClick={handleClick}
            target={isDesktop ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>สลับเข้าแอป OneDrive</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>

      </div>
    );
  }

  // Pill Variant
  return (
    <a
      href={appUrl}
      onClick={handleClick}
      target={isDesktop ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-bold active:scale-95 transition-all shadow-2xs ${className}`}
      title="เปิดโฟลเดอร์ Home ในแอป OneDrive"
    >
      <OneDriveIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
      <span>OneDrive [Home]</span>
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  );
}
