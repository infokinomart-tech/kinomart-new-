import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: { sizeLimit: '256kb' },
  },
};

// Maps our internal event names to Meta's standard event names.
// Events with no good Meta equivalent are skipped for Meta (still sent to GA4).
const META_EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function getClientIp(req: VercelRequest): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  if (Array.isArray(fwd)) return fwd[0];
  return undefined;
}

async function sendToGA4(body: any, measurementId: string, apiSecret: string) {
  const { event, ecommerce, page_location, page_title } = body;

  const params: Record<string, any> = { ...(ecommerce || {}) };
  if (page_location) params.page_location = page_location;
  if (page_title) params.page_title = page_title;
  // GA4 MP expects `items` array named exactly `items` inside params — already true from ecommerce shape.

  const payload = {
    client_id: body.client_id || crypto.randomUUID(),
    non_personalized_ads: false,
    events: [{ name: event, params }],
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

async function sendToMeta(body: any, pixelId: string, accessToken: string, req: VercelRequest) {
  const metaEventName = META_EVENT_MAP[body.event];
  if (!metaEventName) return { skipped: true };

  const meta = body.meta || {};
  const userData: Record<string, any> = {
    client_ip_address: getClientIp(req),
    client_user_agent: req.headers['user-agent'],
  };
  if (body.user_data?.em) userData.em = sha256(body.user_data.em);
  if (body.user_data?.ph) userData.ph = sha256(body.user_data.ph.replace(/[^0-9]/g, ''));

  const eventPayload = {
    event_name: metaEventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    event_source_url: body.page_location,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      content_ids: meta.content_ids,
      contents: meta.contents,
      content_type: 'product',
      content_name: meta.content_name,
      content_category: meta.content_category,
      num_items: meta.num_items,
      value: meta.value,
      currency: meta.currency || 'BDT',
    },
  };

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(
    accessToken
  )}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [eventPayload] }),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, response: json };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!body.event) {
      return res.status(400).json({ ok: false, error: 'Missing event name' });
    }

    const ga4Secret = process.env.GA4_API_SECRET;
    const metaToken = process.env.META_ACCESS_TOKEN;

    const results: Record<string, any> = {};

    // GA4: measurement_id is public (comes from admin settings, sent by the client);
    // the API secret stays server-side only.
    if (body.measurement_id && ga4Secret) {
      try {
        results.ga4 = await sendToGA4(body, body.measurement_id, ga4Secret);
      } catch (err: any) {
        results.ga4 = { ok: false, error: err?.message };
      }
    }

    // Meta: pixel_id is public (from admin settings); access token stays server-side only.
    if (body.pixel_id && metaToken) {
      try {
        results.meta = await sendToMeta(body, body.pixel_id, metaToken, req);
      } catch (err: any) {
        results.meta = { ok: false, error: err?.message };
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (err: any) {
    console.error('[api/track] error:', err);
    // Tracking failures should never break the site — always 200 so the client's
    // fire-and-forget call doesn't surface an error to the shopper.
    return res.status(200).json({ ok: false, error: err?.message || String(err) });
  }
}
