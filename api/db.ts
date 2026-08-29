import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Whitelisted tables and their primary key columns — prevents SQL injection via table/column names
// and matches the schema in neon_schema.sql
const TABLES: Record<string, { pk: string }> = {
  products: { pk: 'id' },
  categories: { pk: 'id' },
  orders: { pk: 'id' },
  coupons: { pk: 'id' },
  customer_profiles: { pk: 'phone' },
  team: { pk: 'id' },
  settings: { pk: 'id' },
};

const IDENT_RE = /^[a-z_][a-z0-9_]*$/i;

function assertIdent(name: string): string {
  if (!IDENT_RE.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return name;
}

// Postgres parameter binding needs jsonb columns sent as JSON text, not raw JS
// objects/arrays (which some drivers would otherwise stringify as "[object Object]").
function serializeValue(v: any): any {
  if (v !== null && typeof v === 'object') {
    return JSON.stringify(v);
  }
  return v;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured');
  return neon(url);
}

function buildWhere(filter: Record<string, any>): { clause: string; values: any[] } {
  const keys = Object.keys(filter || {});
  if (keys.length === 0) return { clause: '', values: [] };
  const parts: string[] = [];
  const values: any[] = [];
  keys.forEach((k, i) => {
    assertIdent(k);
    parts.push(`"${k}" = $${i + 1}`);
    values.push(filter[k]);
  });
  return { clause: ' WHERE ' + parts.join(' AND '), values };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const table = String(req.query.table || (req.body && req.body.table) || '');
    if (!table || !TABLES[table]) {
      return res.status(400).json({ data: null, error: { message: `Unknown or missing table: ${table}` } });
    }
    assertIdent(table);
    const sql = getSql();

    if (req.method === 'GET') {
      const { table: _t, ...filters } = req.query as Record<string, string>;
      const cleanFilters: Record<string, any> = {};
      Object.keys(filters).forEach((k) => {
        assertIdent(k);
        cleanFilters[k] = filters[k];
      });
      const { clause, values } = buildWhere(cleanFilters);
      const query = `SELECT * FROM "${table}"${clause} ORDER BY 1 DESC`;
      const rows = await sql(query, values);
      return res.status(200).json({ data: rows, error: null });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { op, payload, filter, onConflict } = body;

      if (op === 'insert') {
        const cols = Object.keys(payload || {});
        cols.forEach(assertIdent);
        if (cols.length === 0) return res.status(400).json({ data: null, error: { message: 'Empty payload' } });
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const values = cols.map((c) => serializeValue(payload[c]));
        const query = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const rows = await sql(query, values);
        return res.status(200).json({ data: rows, error: null });
      }

      if (op === 'update') {
        const cols = Object.keys(payload || {});
        cols.forEach(assertIdent);
        if (cols.length === 0) return res.status(400).json({ data: null, error: { message: 'Empty payload' } });
        const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
        const values = cols.map((c) => serializeValue(payload[c]));
        const { clause, values: whereValues } = buildWhere(filter || {});
        if (!clause) return res.status(400).json({ data: null, error: { message: 'Update requires a filter' } });
        const offsetClause = clause.replace(/\$(\d+)/g, (_m, n) => `$${Number(n) + cols.length}`);
        const query = `UPDATE "${table}" SET ${setClause}${offsetClause} RETURNING *`;
        const rows = await sql(query, [...values, ...whereValues]);
        return res.status(200).json({ data: rows, error: null });
      }

      if (op === 'upsert') {
        const cols = Object.keys(payload || {});
        cols.forEach(assertIdent);
        if (cols.length === 0) return res.status(400).json({ data: null, error: { message: 'Empty payload' } });
        const conflictCol = assertIdent(onConflict || TABLES[table].pk);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const values = cols.map((c) => serializeValue(payload[c]));
        const updateSet = cols
          .filter((c) => c !== conflictCol)
          .map((c) => `"${c}" = EXCLUDED."${c}"`)
          .join(', ');
        const query = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})
          ON CONFLICT ("${conflictCol}") DO UPDATE SET ${updateSet || `"${conflictCol}" = EXCLUDED."${conflictCol}"`}
          RETURNING *`;
        const rows = await sql(query, values);
        return res.status(200).json({ data: rows, error: null });
      }

      if (op === 'delete') {
        const { clause, values } = buildWhere(filter || {});
        if (!clause) return res.status(400).json({ data: null, error: { message: 'Delete requires a filter' } });
        const query = `DELETE FROM "${table}"${clause} RETURNING *`;
        const rows = await sql(query, values);
        return res.status(200).json({ data: rows, error: null });
      }

      return res.status(400).json({ data: null, error: { message: `Unknown op: ${op}` } });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ data: null, error: { message: 'Method not allowed' } });
  } catch (err: any) {
    console.error('[api/db] error:', err);
    return res.status(200).json({ data: null, error: { message: err?.message || String(err) } });
  }
}
