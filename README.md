# Zelena Oaza - Garden Services Landing Page

A modern, responsive landing page for a garden maintenance and landscaping business in Serbia. Built with React, TypeScript, Tailwind CSS, and Vite.

## Features

- **Interactive Service Calculator** - Users can select garden services, specify area, and get real-time monthly cost estimates
- **Multi-language Support** - Available in Serbian (Latin/Cyrillic), English, and German
- **Dark/Light Theme** - Full theme support with automatic system preference detection
- **Before/After Gallery** - Interactive image slider showcasing past work
- **Contact Form** - Integrated with Telegram bot via Cloudflare Worker for instant order notifications
- **Fully Responsive** - Optimized for mobile, tablet, and desktop viewing
- **Accessible** - Keyboard navigation, ARIA labels, and screen reader friendly

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives (shadcn/ui style)
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Form Validation**: Zod schema validation
- **Routing**: React Router DOM
- **Internationalization**: Custom i18n context with translation support
- **Backend Integration**: Cloudflare Worker for Telegram bot notifications

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, Input, etc.)
│   ├── garden/          # Garden-specific components (GardenLanding, BeforeAfterSlider)
│   └── ThemeToggle.tsx  # Dark/light mode toggle
├── contexts/           # React contexts (ThemeContext, I18nContext)
├── i18n/               # Internationalization (translations, i18n setup)
├── hooks/              # Custom React hooks
├── pages/              # Page components (Index, NotFound)
├── assets/             # Static assets (images, gallery photos)
├── lib/                # Utility functions
├── App.tsx             # Main app component with providers
├── main.tsx            # Entry point
├── index.css           # Global styles and design system
└── App.css             # (Unused - cleared)

worker/                  # Cloudflare Worker
├── src/index.ts        # Worker entry point
└── wrangler.toml      # Worker configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
bun run build
```

### Preview Production Build

```bash
npm run preview
# or
bun run preview
```

## Configuration

### Telegram Bot Integration

1. Create a Telegram bot via @BotFather
2. Get your bot token and chat ID
3. Deploy the Cloudflare Worker (see `/worker/README.md`)
4. Update the `WORKER_ENDPOINT` in `src/components/garden/GardenLanding.tsx`

### Contact Information

Update these constants in `src/components/garden/GardenLanding.tsx`:

```typescript
const BUSINESS_PHONE_INTL = "381600000000"; // Your business phone
const BUSINESS_PHONE_DISPLAY = "+381 60 000 0000";
```

### Service Configuration

Edit the `SERVICES` array in `src/components/garden/GardenLanding.tsx` to modify:
- Service names and descriptions (via i18n translations)
- Pricing per m² or per visit
- Minimum prices
- Default frequency settings

## Translations

Translations are managed in `src/i18n/translations.ts`. Supported locales:
- `sr-Latn` - Serbian (Latin)
- `sr-Cyrl` - Serbian (Cyrillic)
- `en` - English
- `de` - German

## License

MIT

Created by tebraDev for Zelena Oaza garden services business.