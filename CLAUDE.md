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
npm test              # Single run — vitest run
npm run test:watch    # Interactive dev — vitest
npm run ci            # Tests + type checking (run before pushing)
```

**Always run `npm run ci` before pushing.** `npm test` alone won't catch TypeScript errors because provider SDKs are mocked — the `ci` script adds `tsc --noEmit` to catch type mismatches against real SDK types.

Tests use Vitest + React Testing Library + jsdom. No API keys, running server, or browser required — all providers are mocked. The `vitest.setup.ts` file mocks `server-only` globally and handles RTL cleanup.

Test files live in `__tests__/` mirroring the source structure:
- `__tests__/lib/` — unit tests for parse-hashtags, prompts, cache, server-cache, logger, rate-limit, providers
- `__tests__/api/` — API route validation, error handling, server cache integration, structured logging
- `__tests__/components/` — MethodTabs, InputForm, StatusMessage

## Production URL

The canonical production domain is `https://hashtag-generator-pro.vercel.app`. This is set in `app/layout.tsx` (metadataBase, canonical, OG URL), `app/sitemap.ts`, `app/robots.ts`, and `components/JsonLd.tsx`.

## Key Architecture Decisions

### Static/Dynamic Split
- **Static Components** (no JS): layout, page content, footer, FAQ content, JSON-LD. These render to pure HTML at build time for SEO — no JavaScript shipped to the browser.
- **Client Components** (`"use client"`): NavBar, HashtagGenerator and its children (MethodTabs, InputForm, StatusMessage, HashtagResults, FaqAccordion). These hydrate on the client for interactivity.
- The hydration boundary starts at `HashtagGenerator.tsx`. Everything above it in the page is pure static HTML.

### API Route (`app/api/generate/route.ts`)
The route runs entirely server-side (Vercel serverless function) and follows this pipeline:

1. **Rate limit** — Per-IP sliding window (5 req/60s) via Upstash Redis. Fails open if Redis is unavailable.
2. **Validate** — Rejects bad input (missing/invalid method, text too short/long) with 400 before any API call is made.
3. **Server cache check** — Checks L2 Redis cache for a previous result with the same input. Fails open if Redis is unavailable.
4. **Dispatch** — Routes to the correct provider module (`claude.ts`, `openai.ts`, or `gemini.ts`). Each provider is isolated with its own SDK and API key.
5. **Cache & respond** — Stores the result in L2 cache (fire-and-forget), returns to client. On error, maps to typed error codes (`RATE_LIMITED`, `MISSING_KEY`, `PROVIDER_ERROR`).

Every request emits exactly one structured JSON log line in a `finally` block (`lib/logger.ts`). The client calls the route via an async `fetch()` from the `useHashtagGenerator` hook. Provider modules use `import "server-only"` to prevent accidental client bundling.

### Caching (Two Tiers + CDN)
- **CDN Edge**: Static assets served with immutable cache headers. No origin hits for returning visitors.
- **L1 — Browser localStorage** (`lib/cache.ts`): Per-user AI response cache with SHA-256 content-addressed keys. Key: `htgp-cache-{SHA256(method:title:text)}`. TTL 24h, max 50 entries, LRU eviction.
- **L2 — Server Redis** (`lib/server-cache.ts`): Cross-user AI response cache. Key: `htgp-srv-{SHA256(method:title:text)}`. TTL 24h. Deduplicates identical requests across all users. Fails open if Redis is unavailable.

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
