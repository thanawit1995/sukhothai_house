/**
 * Canva Integration Utility for OUR home
 * 
 * Provides deep linking to the shared project Canva design:
 * https://canva.link/y0r6ot0p4uz5f77
 * 
 * Deep Link Strategy:
 * - Android (e.g. Oppo Find X9): Uses Android Intent targeting package com.canva.editor
 *   with browser_fallback_url so it directly switches to the Canva native app.
 * - iOS (e.g. iPhone 14 Pro): Uses standard canva.link Universal Link which iOS intercepts
 *   and switches directly into the Canva app.
 * - Desktop: Opens in a new tab.
 */

export const CANVA_DESIGN_URL = 'https://canva.link/y0r6ot0p4uz5f77';

export function getCanvaPlatformInfo() {
  if (typeof window === 'undefined') {
    return { isAndroid: false, isIOS: false, isMobile: false, isDesktop: true };
  }
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = isAndroid || isIOS;
  return { isAndroid, isIOS, isMobile, isDesktop: !isMobile };
}

/**
 * Returns the platform-specific URL / Intent URI for Canva
 */
export function getCanvaAppUrl() {
  if (typeof window === 'undefined') return CANVA_DESIGN_URL;
  
  const { isAndroid } = getCanvaPlatformInfo();
  
  if (isAndroid) {
    const encodedFallback = encodeURIComponent(CANVA_DESIGN_URL);
    // Direct Android Intent targeting Canva app (package: com.canva.editor)
    return `intent://canva.link/y0r6ot0p4uz5f77#Intent;scheme=https;package=com.canva.editor;S.browser_fallback_url=${encodedFallback};end`;
  }
  
  return CANVA_DESIGN_URL;
}

/**
 * Programmatic open helper with fallback
 */
export function openCanvaDesign(e) {
  const { isAndroid, isIOS } = getCanvaPlatformInfo();
  const appUrl = getCanvaAppUrl();
  
  if (isAndroid) {
    if (e && e.preventDefault) e.preventDefault();
    window.location.href = appUrl;
    return;
  }
  
  if (isIOS) {
    if (e && e.preventDefault) e.preventDefault();
    // Navigating directly on iOS triggers Universal Link to Canva app
    window.location.href = CANVA_DESIGN_URL;
    return;
  }
  
  // Desktop
  if (e && e.preventDefault) {
    e.preventDefault();
    window.open(CANVA_DESIGN_URL, '_blank', 'noopener,noreferrer');
  }
}
