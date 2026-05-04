/**
 * Zelena Oaza — order forwarder Worker
 *
 * Receives a JSON payload from the static site, validates it, and forwards
 * it as a Telegram message via the Bot API. Stores nothing.
 *
 * Required secrets (set via `wrangler secret put`):
 *   - TELEGRAM_BOT_TOKEN
 *   - TELEGRAM_CHAT_ID
 * Optional:
 *   - ALLOWED_ORIGIN   e.g. "https://yourname.github.io"  (defaults to "*")
 */

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  ALLOWED_ORIGIN?: string;
}

interface OrderPayload {
  message?: string;
  contact?: {
    name?: string;
    phone?: string;
    city?: string | null;
    address?: string | null;
    notes?: string | null;
  };
  items?: unknown[];
  totalMonthlyRSD?: number;
  locale?: string;
  source?: string;
  sentAt?: string;
}

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const json = (data: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = env.ALLOWED_ORIGIN || "*";
    const reqOrigin = request.headers.get("Origin") || "";
    const origin =
      allowed === "*" || reqOrigin === allowed ? allowed : allowed;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }
    if (allowed !== "*" && reqOrigin !== allowed) {
      return json({ error: "Forbidden origin" }, 403, origin);
    }

    let body: OrderPayload;
    try {
      body = (await request.json()) as OrderPayload;
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    const name = (body.contact?.name ?? "").toString().trim().slice(0, 100);
    const phone = (body.contact?.phone ?? "").toString().trim().slice(0, 30);
    const message = (body.message ?? "").toString().slice(0, 4000);

    if (!name || !phone || !message) {
      return json({ error: "Missing required fields" }, 400, origin);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ error: "Worker not configured" }, 500, origin);
    }

    const text =
      `<b>🌿 Nova narudžbina — Zelena Oaza</b>\n\n` +
      `<pre>${escapeHtml(message)}</pre>\n` +
      `<i>Source: ${escapeHtml(body.source ?? "web")} · ${escapeHtml(
        body.locale ?? ""
      )}</i>`;

    const tgRes = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error("Telegram API error", tgRes.status, errText);
      return json({ error: "Upstream delivery failed" }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  },
};