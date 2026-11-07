/**
 * OneDrive Integration Utility for OUR home
 * 
 * Provides deep linking to the shared project folder:
 * https://1drv.ms/f/c/98a3a9bec1e71efb/IgA-mg1Bxh8WRK6xdDG_gEVkAaoXJEsIbtHDyfwba8ZWggU?e=xoR4mz
 * 
 * Deep Link Strategy:
 * - Android (e.g. Oppo Find X9): Uses Android Intent targeting package com.microsoft.skydrive
 *   with browser_fallback_url so it directly switches to the OneDrive native app.
 * - iOS (e.g. iPhone 14 Pro): Uses standard 1drv.ms Universal Link which iOS intercepts
 *   and switches directly into the OneDrive app.
 * - Desktop: Opens the folder in a new tab.
 */

export const ONEDRIVE_HOME_URL = 'https://1drv.ms/f/c/98a3a9bec1e71efb/IgA-mg1Bxh8WRK6xdDG_gEVkAaoXJEsIbtHDyfwba8ZWggU?e=xoR4mz';

export function getPlatformInfo() {
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
 * Returns the platform-specific URL / Intent URI
 */
export function getOneDriveAppUrl() {
  if (typeof window === 'undefined') return ONEDRIVE_HOME_URL;
  
  const { isAndroid } = getPlatformInfo();
  
  if (isAndroid) {
    const encodedFallback = encodeURIComponent(ONEDRIVE_HOME_URL);
    // Direct Android Intent targeting Microsoft OneDrive app (package: com.microsoft.skydrive)
    return `intent://1drv.ms/f/c/98a3a9bec1e71efb/IgA-mg1Bxh8WRK6xdDG_gEVkAaoXJEsIbtHDyfwba8ZWggU?e=xoR4mz#Intent;scheme=https;package=com.microsoft.skydrive;S.browser_fallback_url=${encodedFallback};end`;
  }
  
  return ONEDRIVE_HOME_URL;
}

/**
 * Programmatic open helper with fallback
 */
export function openOneDriveHome(e) {
  const { isAndroid, isIOS } = getPlatformInfo();
  const appUrl = getOneDriveAppUrl();
  
  if (isAndroid) {
    if (e && e.preventDefault) e.preventDefault();
    window.location.href = appUrl;
    return;
  }
  
  if (isIOS) {
    if (e && e.preventDefault) e.preventDefault();
    // Navigating directly on iOS triggers Universal Link to OneDrive app
    window.location.href = ONEDRIVE_HOME_URL;
    return;
  }
  
  // Desktop
  if (e && e.preventDefault) {
    e.preventDefault();
    window.open(ONEDRIVE_HOME_URL, '_blank', 'noopener,noreferrer');
  }
}
