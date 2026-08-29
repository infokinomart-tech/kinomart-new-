// Sends the same ecommerce events already captured in dataLayer.ts to our
// /api/track serverless function, which forwards them server-side to GA4
// (Measurement Protocol) and Meta (Conversions API). This is a supplement to
// the existing client-side gtag.js/fbq tracking, not a replacement — sending
// both is standard practice and lets each platform de-duplicate using the
// shared client_id / event_id.

const CLIENT_ID_KEY = 'kinomart_cid';

function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let cid = localStorage.getItem(CLIENT_ID_KEY);
    if (!cid) {
      cid = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(CLIENT_ID_KEY, cid);
    }
    return cid;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function generateEventId(): string {
  try {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

interface ServerEventPayload {
  event: string;
  measurementId?: string;
  pixelId?: string;
  eventId?: string;
  ecommerce?: Record<string, any>;
  meta?: {
    content_ids?: string[];
    contents?: { id: string; quantity: number; item_price: number }[];
    content_name?: string;
    content_category?: string;
    num_items?: number;
    value?: number;
    currency?: string;
  };
  userData?: { em?: string; ph?: string };
}

/**
 * Fire-and-forget: sends an event to our backend, which relays it to GA4/Meta
 * server-side. Never throws — tracking must never break the shopping flow.
 */
export function sendServerEvent(payload: ServerEventPayload): void {
  if (typeof window === 'undefined') return;
  // Skip entirely if neither platform is configured — avoids a useless request.
  if (!payload.measurementId && !payload.pixelId) return;

  try {
    const body = JSON.stringify({
      event: payload.event,
      client_id: getOrCreateClientId(),
      event_id: payload.eventId || generateEventId(),
      measurement_id: payload.measurementId,
      pixel_id: payload.pixelId,
      page_location: window.location.href,
      page_title: document.title,
      ecommerce: payload.ecommerce,
      meta: payload.meta,
      user_data: payload.userData,
    });

    // Use sendBeacon when available so events like `purchase` (fired right
    // before a redirect/navigation) still reach the server reliably.
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/track', blob);
      if (sent) return;
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* silent — tracking failures should never surface to the user */
    });
  } catch {
    /* silent */
  }
}
