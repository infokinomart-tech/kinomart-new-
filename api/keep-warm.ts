import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Cheap endpoint whose only job is to touch the Neon database so it doesn't
// autosuspend. Call this every few minutes from an external scheduler (see
// README section "Keeping Neon warm") since Vercel's own Hobby-plan cron can
// only run once a day, which isn't frequent enough to prevent autosuspend.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  // Optional lightweight protection: if CRON_SECRET is set, require it.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const provided = req.headers.authorization?.replace('Bearer ', '') || req.query.secret;
    if (provided !== expected) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured' });
    }
    const sql = neon(url);
    await sql('SELECT 1');
    return res.status(200).json({ ok: true, time: new Date().toISOString() });
  } catch (err: any) {
    console.error('[api/keep-warm] error:', err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
