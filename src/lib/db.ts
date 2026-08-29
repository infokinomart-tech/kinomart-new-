/// <reference types="vite/client" />
// Lightweight client that talks to our own Vercel serverless API (/api/db, /api/upload),
// which is backed by Neon Postgres + Cloudflare R2. It mimics the small slice of the
// Supabase JS query-builder interface that the rest of the app already uses
// (.from(table).select()/.eq()/.insert()/.update()/.upsert()/.delete()), so the calling
// code in StoreContext/AdminSettings did not need to be rewritten.

export type DbResult<T = any> = { data: T | null; error: { message: string; code?: string } | null; count?: number | null };

async function postOp(body: Record<string, any>): Promise<DbResult> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    const data = json.data ?? null;
    return { data, error: json.error ?? null, count: Array.isArray(data) ? data.length : null };
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'Network error' } };
  }
}

async function getSelect(table: string, filters: Record<string, any>): Promise<DbResult> {
  try {
    const qs = new URLSearchParams({ table });
    Object.keys(filters).forEach((k) => qs.set(k, String(filters[k])));
    const res = await fetch(`/api/db?${qs.toString()}`);
    const json = await res.json();
    return { data: json.data ?? null, error: json.error ?? null };
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'Network error' } };
  }
}

interface QueryBuilder extends PromiseLike<DbResult> {
  select: (cols?: string) => QueryBuilder;
  eq: (col: string, val: any) => QueryBuilder;
  limit: (n: number) => QueryBuilder;
  insert: (payload: Record<string, any>) => Promise<DbResult>;
  upsert: (payload: Record<string, any>, opts?: { onConflict?: string }) => Promise<DbResult>;
  update: (payload: Record<string, any>, opts?: { count?: 'exact' }) => { eq: (col: string, val: any) => Promise<DbResult> };
  delete: () => { eq: (col: string, val: any) => Promise<DbResult> };
}

function from(table: string): QueryBuilder {
  const filters: Record<string, any> = {};
  let resultPromise: Promise<DbResult> | null = null;

  const builder: QueryBuilder = {
    select() {
      resultPromise = getSelect(table, filters);
      return builder;
    },
    eq(col: string, val: any) {
      filters[col] = val;
      // If select() already ran (no filters yet applied), rerun with filter included.
      if (resultPromise) resultPromise = getSelect(table, filters);
      return builder;
    },
    limit(_n: number) {
      // Row limiting isn't implemented server-side (tables are small); kept as a
      // no-op for interface compatibility with existing call sites.
      return builder;
    },
    insert(payload) {
      return postOp({ table, op: 'insert', payload });
    },
    upsert(payload, opts) {
      return postOp({ table, op: 'upsert', payload, onConflict: opts?.onConflict });
    },
    update(payload, _opts) {
      return {
        eq: (col: string, val: any) => postOp({ table, op: 'update', payload, filter: { [col]: val } }),
      };
    },
    delete() {
      return {
        eq: (col: string, val: any) => postOp({ table, op: 'delete', filter: { [col]: val } }),
      };
    },
    then(onfulfilled, onrejected) {
      const p = resultPromise || getSelect(table, filters);
      return p.then(onfulfilled as any, onrejected as any);
    },
  };

  return builder;
}

// No-op realtime channel stub — live updates are handled by the existing
// polling/focus-refresh fallback in StoreContext, which is simpler and more
// reliable across serverless function invocations than a websocket channel.
function channel(_name: string) {
  const chain = {
    on(..._args: any[]) {
      return chain;
    },
    subscribe(..._args: any[]) {
      return chain;
    },
  };
  return chain;
}

const dbClient = {
  from,
  channel,
  removeChannel(_ch: any) {
    /* no-op */
  },
};

type DbClient = typeof dbClient;

export const getSupabaseClient = (): DbClient => dbClient;

export const isSupabaseConfigured = (): boolean => true;

// Kept only for backwards compatibility with existing call sites — credentials now
// live exclusively in Vercel server environment variables, never in the browser.
export const setSupabaseCredentials = (_url?: string, _key?: string): void => {
  /* no-op: DB connection is server-side only now */
};

export const getSupabaseConfig = (): { url: string; key: string } => ({ url: '', key: '' });

// Early in-flight preload (kicks off requests before React mounts, same idea as before)
let preloadedProductsPromise: Promise<DbResult> | null = null;
let preloadedCategoriesPromise: Promise<DbResult> | null = null;
let preloadedSettingsPromise: Promise<DbResult> | null = null;

export const startEarlyPreload = () => {
  try {
    if (!preloadedProductsPromise) preloadedProductsPromise = getSelect('products', {});
    if (!preloadedCategoriesPromise) preloadedCategoriesPromise = getSelect('categories', {});
    if (!preloadedSettingsPromise) preloadedSettingsPromise = getSelect('settings', {});
  } catch {
    // ignore
  }
};

export const consumePreloadPromises = () => {
  const promises = {
    products: preloadedProductsPromise,
    categories: preloadedCategoriesPromise,
    settings: preloadedSettingsPromise,
  };
  preloadedProductsPromise = null;
  preloadedCategoriesPromise = null;
  preloadedSettingsPromise = null;
  return promises;
};

export const supabase: DbClient = dbClient;

if (typeof window !== 'undefined') {
  try {
    startEarlyPreload();
  } catch {
    // ignore
  }
}
