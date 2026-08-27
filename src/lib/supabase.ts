/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  try {
    return (import.meta as { env?: Record<string, string> }).env?.[key] || '';
  } catch {
    return '';
  }
};

const getStoredVar = (key: string): string => {
  try {
    if (typeof window !== 'undefined') {
      const direct = localStorage.getItem(key);
      if (direct) return direct;

      const stg = localStorage.getItem('kinomart_settings');
      if (stg) {
        const parsed = JSON.parse(stg);
        if (key === 'kinomart_supabase_url' && parsed.supabaseUrl) return parsed.supabaseUrl;
        if (key === 'kinomart_supabase_key' && parsed.supabaseKey) return parsed.supabaseKey;
      }
    }
  } catch {
    // Ignore localStorage access errors
  }
  return '';
};

export const getSupabaseConfig = (): { url: string; key: string } => {
  const envUrl = getEnvVar('VITE_SUPABASE_URL');
  const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
  const localUrl = getStoredVar('kinomart_supabase_url');
  const localKey = getStoredVar('kinomart_supabase_key');

  const url = (localUrl && localUrl.startsWith('http')) ? localUrl : envUrl;
  const key = localKey || envKey;

  const validUrl = url && url.startsWith('http') && !url.includes('your-supabase-project') ? url : '';
  const validKey = key && !key.includes('your-supabase-anon-key') ? key : '';

  return { url: validUrl, key: validKey };
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

// Early In-Flight Network Preload (Initiates instant query before React lifecycle mount)
let preloadedProductsPromise: Promise<any> | null = null;
let preloadedCategoriesPromise: Promise<any> | null = null;
let preloadedSettingsPromise: Promise<any> | null = null;

export const startEarlyPreload = () => {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    if (!preloadedProductsPromise) {
      preloadedProductsPromise = Promise.resolve(client.from('products').select('*'));
    }
    if (!preloadedCategoriesPromise) {
      preloadedCategoriesPromise = Promise.resolve(client.from('categories').select('*'));
    }
    if (!preloadedSettingsPromise) {
      preloadedSettingsPromise = Promise.resolve(client.from('settings').select('*'));
    }
  } catch (e) {
    // Ignore preload error
  }
};

export const consumePreloadPromises = () => {
  const promises = {
    products: preloadedProductsPromise,
    categories: preloadedCategoriesPromise,
    settings: preloadedSettingsPromise
  };
  preloadedProductsPromise = null;
  preloadedCategoriesPromise = null;
  preloadedSettingsPromise = null;
  return promises;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const supabase: SupabaseClient | null = getSupabaseClient();

// Auto-start preload immediately upon script evaluation
if (typeof window !== 'undefined') {
  try {
    startEarlyPreload();
  } catch {
    // Ignore
  }
}

export const isSupabaseConfigured = (): boolean => {
  return !!getSupabaseClient();
};

export const setSupabaseCredentials = (url: string, key: string) => {
  const current = getSupabaseConfig();
  if (current.url === url && current.key === key && cachedClient) {
    return;
  }
  try {
    if (typeof window !== 'undefined') {
      if (url) localStorage.setItem('kinomart_supabase_url', url);
      else localStorage.removeItem('kinomart_supabase_url');

      if (key) localStorage.setItem('kinomart_supabase_key', key);
      else localStorage.removeItem('kinomart_supabase_key');
    }
  } catch {
    // Ignore
  }
  cachedClient = null;
  getSupabaseClient();
};

