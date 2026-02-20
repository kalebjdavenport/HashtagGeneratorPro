# HashtagGeneratorPro

AI-powered hashtag generator that lets you paste any text and get relevant, high-performing hashtags in seconds. Compare results from three frontier AI models — Claude Opus, GPT-5, and Gemini — side by side.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and add your API keys
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Keys

You need at least one API key to use the generator. Get them here:

| Provider | Key | Sign up |
|----------|-----|---------|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| OpenAI (GPT-5) | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google (Gemini) | `GOOGLE_AI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) |

Add them to your `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run dev:fresh` | Kill port 3000 and start fresh |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run type-check` | TypeScript check without emitting |

## Architecture

The app is built on a static/dynamic split:

- **Static** (Server Components) — Header, hero, use cases, footer, FAQ, JSON-LD structured data. Rendered to pure HTML at build time, served from CDN edge, fully crawlable with zero client JS.
- **Interactive** (Client Components) — The hashtag generator form, tab selector, results display. Hydrated with React on the client after the static HTML paints.
- **API Route** — `POST /api/generate` validates input, dispatches to the selected AI provider, parses the response, and returns hashtags. API keys never leave the server.

### Caching

Two tiers of caching minimize load:

1. **CDN Edge** — All static assets (HTML, JS, CSS, fonts) are served with immutable cache headers from edge nodes globally.
2. **Browser** — AI responses are cached in `localStorage` using SHA-256 content-addressed keys (`htgp-cache-{hash}`). Same input + same model = instant result with no API call. TTL: 24 hours, max 50 entries, LRU eviction.

### Rate Limiting

Each AI provider is isolated with its own API key and independent rate limits. If Anthropic is rate-limited, OpenAI and Google remain available. HTTP 429 responses from any provider are caught and returned to the client as a `RATE_LIMITED` error with the provider's message.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| AI | Anthropic SDK, OpenAI SDK, Google Generative AI SDK |
| Deployment | Vercel / any Node.js host |

## File Structure

```
HashtagGeneratorPro/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata, skip link
│   ├── page.tsx                # Hero, feature bar, use cases, architecture
│   ├── globals.css             # Tailwind v4 theme, animations, accessibility
│   ├── sitemap.ts              # Generated sitemap.xml
│   ├── robots.ts               # Generated robots.txt
│   ├── not-found.tsx           # Custom 404
│   └── api/generate/
│       └── route.ts            # POST handler: validate → dispatch → respond
├── components/
│   ├── NavBar.tsx              # Responsive nav with mobile hamburger menu
│   ├── HashtagGenerator.tsx    # Client: top-level orchestrator
│   ├── MethodTabs.tsx          # Client: accessible tab selector
│   ├── InputForm.tsx           # Client: form inputs + file upload
│   ├── HashtagResults.tsx      # Client: hashtag chips + copy
│   ├── StatusMessage.tsx       # Client: loading + error states
│   ├── FaqAccordion.tsx        # Client: animated accordion
│   ├── Footer.tsx              # Server: how-it-works, FAQ, accessibility
│   ├── JsonLd.tsx              # Server: 4 structured data schemas
│   └── ArchitectureDiagram.tsx # Server: inline SVG architecture diagram
├── lib/
│   ├── types.ts                # Shared types and constants
│   ├── prompts.ts              # System prompt + user prompt builder
│   ├── parse-hashtags.ts       # LLM output parser
│   ├── clipboard.ts            # Copy-to-clipboard utility
│   ├── cache.ts                # SHA-256 localStorage cache
│   └── providers/
│       ├── claude.ts           # Server-only: Anthropic SDK
│       ├── openai.ts           # Server-only: OpenAI SDK
│       ├── gemini.ts           # Server-only: Google AI SDK
│       └── index.ts            # Provider registry + dispatch
├── hooks/
│   ├── useHashtagGenerator.ts  # Cache → API → state management
│   └── useLocalStorage.ts      # Persistent localStorage with debounce
└── docs/
    └── ARCHITECTURE.md         # Detailed internal architecture docs
```

## Accessibility

- Skip-to-content link
- Full keyboard navigation (Tab, arrows, Escape)
- ARIA roles, labels, and live regions
- WCAG 2.1 AA contrast ratios
- `prefers-reduced-motion` support
- Semantic HTML with proper heading hierarchy
