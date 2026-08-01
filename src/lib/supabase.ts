import { createClient } from '@supabase/supabase-js';

function parseSupabaseConfig() {
  const envUrl = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || (typeof process !== 'undefined' ? process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL : '') || '';
  const envKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY : '') || '';

  let url = String(envUrl).trim().replace(/^["']|["']$/g, '');
  let key = String(envKey).trim().replace(/^["']|["']$/g, '');

  if (!url || !key) return { url: '', key: '', valid: false };
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname || parsed.hostname.includes('your-') || parsed.hostname.includes('example')) {
      return { url: '', key: '', valid: false };
    }
    return { url, key, valid: true };
  } catch {
    return { url: '', key: '', valid: false };
  }
}

const config = parseSupabaseConfig();

export const isSupabaseConfigured = config.valid;

export const supabase = isSupabaseConfigured
  ? createClient(config.url, config.key)
  : null;

