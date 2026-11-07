import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Palette } from 'lucide-react';
import { getCanvaAppUrl, openCanvaDesign, getCanvaPlatformInfo, CANVA_DESIGN_URL } from '../lib/canva';

/**
 * Official Canva Brand Icon
 */
export function CanvaIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <title>Canva</title>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM6.962 7.68c.754 0 1.337.549 1.405 1.2.069.583-.171 1.097-.822 1.406-.343.171-.48.172-.549.069-.034-.069 0-.137.069-.206.617-.514.617-.926.548-1.508-.034-.378-.308-.618-.583-.618-1.2 0-2.914 2.674-2.674 4.629.103.754.549 1.646 1.509 1.646.308 0 .65-.103.96-.24.5-.264.799-.47 1.097-.8-.073-.885.704-2.046 1.851-2.046.515 0 .926.205.96.583.068.514-.377.582-.514.582s-.378-.034-.378-.17c-.034-.138.309-.07.275-.378-.035-.206-.24-.274-.446-.274-.72 0-1.131.994-1.029 1.611.035.275.172.549.447.549.205 0 .514-.31.617-.755.068-.308.343-.514.583-.514.102 0 .17.034.205.171v.138c-.034.137-.137.548-.102.651 0 .069.034.171.17.171.092 0 .436-.18.777-.459.117-.59.253-1.298.253-1.357.034-.24.137-.48.617-.48.103 0 .171.034.205.171v.138l-.136.617c.445-.583 1.097-.994 1.508-.994.172 0 .309.102.309.274 0 .103 0 .274-.069.446-.137.377-.309.96-.412 1.474 0 .137.035.274.207.274.171 0 .685-.206 1.096-.754l.007-.004c-.002-.068-.007-.134-.007-.202 0-.411.035-.754.104-.994.068-.274.411-.514.617-.514.103 0 .205.069.205.171 0 .035 0 .103-.034.137-.137.446-.24.857-.24 1.269 0 .24.034.582.102.788 0 .034.035.069.07.069.068 0 .548-.445.89-1.028-.308-.206-.48-.549-.48-.96 0-.72.446-1.097.858-1.097.343 0 .617.24.617.72 0 .308-.103.65-.274.96h.102a.77.77 0 0 0 .584-.24.293.293 0 0 1 .134-.117c.335-.425.83-.74 1.41-.74.48 0 .924.205.959.582.068.515-.378.618-.515.618l-.002-.002c-.138 0-.377-.035-.377-.172 0-.137.309-.068.274-.376-.034-.206-.24-.275-.446-.275-.686 0-1.13.891-1.028 1.611.034.275.171.583.445.583.206 0 .515-.308.652-.754.068-.274.343-.514.583-.514.103 0 .17.034.205.171 0 .069 0 .206-.137.652-.17.308-.171.48-.137.617.034.274.171.48.309.583.034.034.068.102.068.102 0 .069-.034.138-.137.138-.034 0-.068 0-.103-.035-.514-.205-.72-.548-.789-.891-.205.24-.445.377-.72.377-.445 0-.89-.411-.96-.926a1.609 1.609 0 0 1 .075-.649c-.203.13-.422.203-.623.203h-.17c-.447.652-.927 1.098-1.27 1.303a.896.896 0 0 1-.377.104c-.068 0-.171-.035-.205-.104-.095-.152-.156-.392-.193-.667-.481.527-1.145.805-1.453.805-.343 0-.548-.206-.582-.55v-.376c.102-.754.377-1.2.377-1.337a.074.074 0 0 0-.069-.07c-.24 0-1.028.824-1.166 1.373l-.103.445c-.068.309-.377.515-.582.515-.103 0-.172-.035-.206-.172v-.137l.046-.233c-.435.31-.87.508-1.075.508-.308 0-.48-.172-.514-.412-.206.274-.445.412-.754.412-.352 0-.696-.24-.862-.593-.244.275-.523.553-.852.764-.48.309-1.028.549-1.68.549-.582 0-1.097-.309-1.371-.583-.412-.377-.651-.96-.686-1.509-.205-1.68.823-3.84 2.4-4.8.378-.205.755-.343 1.132-.343zm9.77 3.291c-.104 0-.172.172-.172.343 0 .274.137.583.309.755a1.74 1.74 0 0 0 .102-.583c0-.343-.137-.515-.24-.515z"/>
    </svg>
  );
}

/**
 * Multi-purpose Canva Button & Banner
 * 
 * Variants:
 * - 'header': Compact navbar button for Header.jsx (Responsive, switches directly to Canva app on mobile)
 * - 'card': Rich banner card for HouseBlueprintPage / SyncModal with open & copy link buttons
 * - 'pill': Compact standalone pill button
 */
export default function CanvaButton({ 
  variant = 'header',
  className = '',
  showLabel = true 
}) {
  const [isCopied, setIsCopied] = useState(false);
  const platform = typeof window !== 'undefined' ? getCanvaPlatformInfo() : { isDesktop: true };
  const appUrl = typeof window !== 'undefined' ? getCanvaAppUrl() : CANVA_DESIGN_URL;
  const isDesktop = platform.isDesktop;

  const handleClick = (e) => {
    openCanvaDesign(e);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CANVA_DESIGN_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = CANVA_DESIGN_URL;
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
        className={`h-8 px-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50/70 dark:from-teal-950/60 dark:to-cyan-950/40 hover:from-teal-100 hover:to-cyan-100 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-300 flex items-center justify-between active:scale-98 transition-all shadow-2xs group min-w-0 ${className}`}
        title="เปิดมู้ดบอร์ดในแอป Canva (สลับเข้าแอป)"
        aria-label="เปิดมู้ดบอร์ดในแอป Canva"
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <CanvaIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black truncate text-teal-900 dark:text-teal-200">Canva Design</span>
        </div>
        <ExternalLink className="w-3 h-3 text-teal-500/70 dark:text-teal-400/70 shrink-0 ml-1" />
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
        className={`h-8 px-2 sm:px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs shrink-0 group ${className}`}
        title="เปิดงานออกแบบในแอป Canva (สลับเข้าแอป)"
        aria-label="เปิดงานออกแบบในแอป Canva"
      >
        <CanvaIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
        {showLabel && (
          <span className="text-[10px] sm:text-[11px] font-black tracking-tight">
            Canva
          </span>
        )}
      </a>
    );
  }

  // Card Banner (For HouseBlueprintPage / SyncModal, etc.)
  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-teal-50 via-teal-50/80 to-cyan-50/70 dark:from-teal-950/40 dark:via-teal-950/30 dark:to-cyan-950/30 border border-teal-200/90 dark:border-teal-800/60 rounded-3xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs transition-all ${className}`}>
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-2xs border border-teal-200/60 dark:border-teal-800/40">
            <CanvaIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <span>Canva:</span>
                <span className="text-teal-700 dark:text-teal-300 font-extrabold underline decoration-teal-300 underline-offset-2">Moodboard & Design</span>
              </h4>
              <span className="text-[9px] bg-teal-100 dark:bg-teal-900/70 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                มู้ดบอร์ดบ้าน
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
              เปิดดูมู้ดบอร์ด ไอเดียตกแต่งภายใน โทนสีห้อง และงานพรีเซนต์ในแอป Canva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center w-full sm:w-auto">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white/90 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs"
            title="คัดลอกลิงก์ Canva"
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
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>สลับเข้าแอป Canva</span>
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-xs font-bold active:scale-95 transition-all shadow-2xs ${className}`}
      title="เปิดมู้ดบอร์ดในแอป Canva"
    >
      <CanvaIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
      <span>Canva Design</span>
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  );
}
