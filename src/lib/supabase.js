import { createClient } from '@supabase/supabase-js';

// Sanitize and normalize Supabase project URL to strictly https://<ref>.supabase.co
export const sanitizeSupabaseUrl = (input) => {
  if (!input) return '';
  let str = input.trim();
  
  // 1. If user pasted any URL containing the 20-char project ref (e.g. dashboard, /rest/v1, settings)
  const match = str.match(/([a-z0-9]{20})/i);
  if (match && (str.includes('supabase') || !str.includes('.'))) {
    return `https://${match[1].toLowerCase()}.supabase.co`;
  }

  // 2. Ensure https://
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'https://' + str;
  }

  // 3. Strip subpaths if accidentally appended (e.g. /rest/v1, /dashboard, trailing slashes)
  str = str.replace(/\/(rest\/v1|dashboard|project|auth\/v1|settings).*$/i, '');
  return str.replace(/\/+$/, '');
};

// Auto-import Supabase credentials from URL hash or query params
// Format: #sync=PROJECT_URL|ANON_KEY or ?sb_url=...&sb_key=...
export const autoImportSyncConfigFromUrl = () => {
  if (typeof window === 'undefined') return false;
  try {
    const hash = window.location.hash;
    const search = window.location.search;
    let url = null;
    let key = null;

    if (hash && hash.includes('sync=')) {
      const match = hash.match(/sync=([^&]+)/);
      if (match && match[1]) {
        try {
          const decoded = decodeURIComponent(match[1]);
          if (decoded.includes('|')) {
            const parts = decoded.split('|');
            url = parts[0]?.trim();
            key = parts[1]?.trim();
          } else if (decoded.startsWith('{')) {
            const parsed = JSON.parse(decoded);
            url = parsed.url;
            key = parsed.key;
          }
        } catch (e) {
          console.warn('Failed to parse sync hash:', e);
        }
      }
    }

    if (!url && search) {
      const params = new URLSearchParams(search);
      url = params.get('sb_url');
      key = params.get('sb_key');
    }

    if (url && key) {
      const cleanUrl = sanitizeSupabaseUrl(url);
      const cleanKey = key.trim();

      localStorage.setItem('home_supabase_url', cleanUrl);
      localStorage.setItem('home_supabase_key', cleanKey);

      // Clean URL without triggering reload, keeping hash clean
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
      return true;
    }
  } catch (err) {
    console.warn('Error in autoImportSyncConfigFromUrl:', err);
  }
  return false;
};

// Execute immediately when script evaluates
autoImportSyncConfigFromUrl();

// Get Supabase credentials from localStorage or Vite environment variables
export const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', key: '' };
  }
  const rawLocalUrl = localStorage.getItem('home_supabase_url');
  const rawLocalKey = localStorage.getItem('home_supabase_key');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = sanitizeSupabaseUrl(rawLocalUrl || envUrl || '');
  const key = (rawLocalKey || envKey || '').trim();

  // Self-heal corrupted localStorage URL automatically!
  if (rawLocalUrl && rawLocalUrl !== url) {
    localStorage.setItem('home_supabase_url', url);
  }

  return { url, key };
};

export const saveSupabaseConfig = (url, key) => {
  if (!url || !key) {
    localStorage.removeItem('home_supabase_url');
    localStorage.removeItem('home_supabase_key');
  } else {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = key.trim();

    localStorage.setItem('home_supabase_url', cleanUrl);
    localStorage.setItem('home_supabase_key', cleanKey);
  }
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('home_supabase_url');
  localStorage.removeItem('home_supabase_key');
  window.location.reload();
};

const config = getSupabaseConfig();

let client = null;
if (config.url && config.key) {
  try {
    client = createClient(config.url, config.key);
  } catch (err) {
    console.error('Supabase initialization failed:', err);
  }
}

export const supabase = client;
