# Before this site goes live — required, not optional

These aren't cosmetic. Each one is currently a placeholder value that will
silently break lead generation or make the site look unfinished to a real
visitor. Nothing below was guessed or fabricated — these need the actual
business's real information.

## 1. Phone number (blocks every Call / WhatsApp button)

File: `src/components/garden/GardenLanding.tsx`

```ts
const BUSINESS_PHONE_INTL = "381600000000"; // ← fake, replace with real number, E.164 without +
const BUSINESS_PHONE_DISPLAY = "+381 60 000 0000"; // ← fake, replace with real display format
```

Every "Call now" button, the WhatsApp buttons, and the floating WhatsApp
icon on every page use this constant. Until it's a real number, none of
them can generate a lead.

## 2. Cloudflare Worker endpoint (blocks the order form)

File: `src/components/garden/GardenLanding.tsx`

```ts
const WORKER_ENDPOINT = "https://zelena-oaza-order.zelena-oaza.workers.dev"; // ← generic example from worker/README.md, not a deployed endpoint
```

Follow `worker/README.md` to deploy the Worker and get a real
`*.workers.dev` URL (or custom domain), then set the Telegram bot token
and chat ID as Worker secrets. Until this is a real, deployed URL with
secrets configured, the contact form's "Send order" button will fail.

## 3. Privacy Policy — data controller identity

File: `src/i18n/translations.ts` — search for `[ime, adresa, e-mail]` /
`[name, address, e-mail]` (appears once per locale, 4 places total).

Right now the Privacy Policy dialog literally shows bracketed placeholder
text to visitors. Needs the real business name/owner, address, and contact
email to be legally meaningful and not look unfinished.

## 4. Canonical domain / SEO metadata

Files: `index.html`, `public/robots.txt`, `public/sitemap.xml`

All three currently point to `https://vrtni-drug-pomoc.lovable.app/`, but
`.github/workflows/deploy.yml` deploys to **GitHub Pages** under
`/vrtni-drug-pomoc/`. Once you know the real production URL (a
`*.github.io` address or a custom domain), update:

- `<link rel="canonical" ...>` and the `og:url`-equivalent JSON-LD `url` in `index.html`
- the `Sitemap:` line in `public/robots.txt`
- the `<loc>` in `public/sitemap.xml`

Leaving this wrong means Google may index the wrong URL, and links shared
on WhatsApp/Viber may preview incorrectly.

## 5. Social preview image

File: `index.html` (`og:image`, `twitter:image`, JSON-LD `image`)

Currently points to a temporary Lovable editor-preview screenshot hosted
on their CDN. Replace with a real photo of the business's work (e.g. one
of the before/after gallery shots) hosted from this repo or a stable CDN.

---

Once all five are filled in with real values, this checklist can be
deleted.
