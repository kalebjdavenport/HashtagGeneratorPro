# CLAUDE.md — HashtagGeneratorPro

This file provides context for Claude Code when working on this project.

## What This Project Is

HashtagGeneratorPro is a production-ready Next.js web application that generates hashtags from text using three AI providers (Claude Opus, GPT-5, Gemini). Users paste text, pick a model, and get relevant hashtags in seconds. It's the server-side API successor to the original client-side HashtagGenerator (which used KeyBERT, Chrome Gemini Nano, and WebLLM in the browser).

## How to Run

```bash
npm install
cp .env.example .env   # Add API keys
npm run dev             # http://localhost:3000
```

If the dev server returns 500 errors, use `npm run dev:fresh` to kill stale processes on port 3000 and restart. Do NOT run `npm run build` while the dev server is running — it corrupts Turbopack's state.

## Testing

```bash
npm test              # Single run (CI) — vitest run
npm run test:watch    # Interactive dev — vitest
```

Tests use Vitest + React Testing Library + jsdom. No API keys, running server, or browser required — all providers are mocked. The `vitest.setup.ts` file mocks `server-only` globally and handles RTL cleanup.

Test files live in `__tests__/` mirroring the source structure:
- `__tests__/lib/` — unit tests for parse-hashtags, prompts, cache
- `__tests__/api/` — API route validation and error handling
- `__tests__/components/` — MethodTabs, InputForm, StatusMessage

## Production URL

The canonical production domain is `https://hashtag-generator-pro.vercel.app`. This is set in `app/layout.tsx` (metadataBase, canonical, OG URL), `app/sitemap.ts`, `app/robots.ts`, and `components/JsonLd.tsx`.

## Key Architecture Decisions

### Static/Dynamic Split
- **Static Components** (no JS): layout, page content, footer, FAQ content, JSON-LD. These render to pure HTML at build time for SEO — no JavaScript shipped to the browser.
- **Client Components** (`"use client"`): NavBar, HashtagGenerator and its children (MethodTabs, InputForm, StatusMessage, HashtagResults, FaqAccordion). These hydrate on the client for interactivity.
- The hydration boundary starts at `HashtagGenerator.tsx`. Everything above it in the page is pure static HTML.

### API Route (`app/api/generate/route.ts`)
The route runs entirely server-side (Vercel serverless function) and follows a three-stage pipeline:

1. **Validate** — Rejects bad input (missing/invalid method, text too short/long) with 400 before any API call is made. This is the cheapest check and fails fast.
2. **Dispatch** — Checks the provider's API key exists in `process.env`, then routes to the correct provider module (`claude.ts`, `openai.ts`, or `gemini.ts`). Each provider is isolated with its own SDK and API key — if one is rate-limited, the others remain available.
3. **Respond** — Returns the result on success, or catches errors and maps them to typed error codes (`RATE_LIMITED` for HTTP 429, `MISSING_KEY` for unconfigured providers, `PROVIDER_ERROR` for everything else).

This never blocks the browser — the client calls the route via an async `fetch()` from the `useHashtagGenerator` hook, keeping the UI responsive while the server waits on the AI provider. Provider modules use `import "server-only"` to prevent accidental client bundling.

### Caching (Two Tiers)
1. **CDN Edge**: Static assets served with immutable cache headers. No origin hits for returning visitors.
2. **Browser localStorage** (`lib/cache.ts`): AI responses cached with SHA-256 content-addressed keys. Key format: `htgp-cache-{SHA256(method:title:text)}`. TTL 24h, max 50 entries, LRU eviction.

### Styling
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin and a custom `@theme` block in `globals.css`.
- Color palette: cobalt blue (#2C4BFF), coral, purple, amber. Provider-branded colors for tabs.

## File Conventions

| Pattern | Location |
|---------|----------|
| Shared types/constants | `lib/types.ts` |
| AI prompts | `lib/prompts.ts` |
| Server-only provider code | `lib/providers/*.ts` |
| Client hooks | `hooks/*.ts` |
| Client components | `components/*.tsx` with `"use client"` directive |
| Static components | `components/*.tsx` without the directive |
| Tests | `__tests__/**/*.test.ts(x)` mirroring source structure |

## Common Tasks

### Adding a new AI provider
1. Create `lib/providers/newprovider.ts` with `import "server-only"` and export a `generateHashtags` function
2. Add the method ID to `MethodId` union in `lib/types.ts`
3. Add an entry to `METHOD_LABELS`, `METHODS` in `lib/types.ts`
4. Register it in `lib/providers/index.ts`
5. Add the API key to `.env.example` and the key check in `app/api/generate/route.ts`

### Changing the AI prompt
Edit `lib/prompts.ts`. The `SYSTEM_PROMPT` is shared across all providers. The `buildUserPrompt()` function constructs the user message from title + text.

### Updating styles
All custom CSS is in `app/globals.css`. The theme colors are defined in the `@theme` block. Tailwind utility classes are used throughout components.

## Things to Watch Out For

- **Do not run `npm run build` while `npm run dev` is running.** It corrupts the Turbopack dev server and causes 500 errors. Use `npx tsc --noEmit` for type-checking instead.
- **`useLocalStorage` hook** initializes with `initialValue` on the server, then reads localStorage in a `useEffect` to avoid hydration mismatches.
- **`useRef` in React 19** requires an explicit initial value (e.g., `useRef<T>(undefined)`).
- **Gemini model availability** can change. Currently using `gemini-2.5-flash`. If it stops working, check Google AI Studio for available models.
- **`suppressHydrationWarning`** is set on `<body>` to handle browser extension attribute injection (Grammarly, etc.).
