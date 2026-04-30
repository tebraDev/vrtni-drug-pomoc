# Cloudflare Worker — Zelena Oaza order forwarder

This Worker receives the order JSON from the static site (GitHub Pages) and
forwards it to your Telegram bot. The static site holds **no secrets**; only
the Worker knows the bot token and chat id.

## 1. Create a Telegram bot

1. Open Telegram, talk to **@BotFather**, run `/newbot` and follow the steps.
2. Save the **bot token** (looks like `123456:ABC-...`).
3. Start a chat with your new bot and send any message to it.
4. Get your **chat id**:
   - Easiest: talk to **@userinfobot** — it tells you your numeric id.
   - Or open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy
     `result[0].message.chat.id`.

## 2. Deploy the Worker

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

Then set the secrets (never commit them):

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
# Optional: lock the Worker to your GitHub Pages origin
wrangler secret put ALLOWED_ORIGIN   # e.g. https://yourname.github.io
```

## 3. Wire the site to the Worker

After `wrangler deploy` you get a URL like
`https://zelena-oaza-order.<your-subdomain>.workers.dev`.

Open `src/components/garden/GardenLanding.tsx` and set:

```ts
const WORKER_ENDPOINT = "https://zelena-oaza-order.<your-subdomain>.workers.dev/order";
```

## CORS

The Worker responds with `Access-Control-Allow-Origin: <ALLOWED_ORIGIN or *>`
so the form can be submitted from your GitHub Pages domain. Set
`ALLOWED_ORIGIN` to your real origin in production to prevent abuse.
