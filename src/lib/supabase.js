import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from localStorage or Vite environment variables
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('home_supabase_url');
  const localKey = localStorage.getItem('home_supabase_key');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: localUrl || envUrl || '',
    key: localKey || envKey || ''
  };
};

export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem('home_supabase_url', url.trim());
  localStorage.setItem('home_supabase_key', key.trim());
  window.location.reload();
};

const config = getSupabaseConfig();

export const supabase = (config.url && config.key)
  ? createClient(config.url, config.key)
  : null;
