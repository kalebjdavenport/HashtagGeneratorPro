# HashtagGeneratorPro — Architecture

## Overview

A Next.js 15 application that generates hashtags from text using three AI providers: Claude Opus (Anthropic), GPT-5 (OpenAI), and Gemini Flash (Google). The page is split into static HTML for SEO content and a client-side React app for the interactive generator. The server handles rate limiting, caching, and AI provider calls.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Rate Limiting & Cache | Upstash Redis | — |
| AI Providers | Anthropic SDK, OpenAI SDK, Google Generative AI SDK | Latest |
| Deployment | Vercel / any Node.js host | — |

---

## Rendering

### Static (Server Components)

These render to HTML at build time. No JavaScript is shipped to the browser for them. Search engines can index all content without executing scripts.

```
app/layout.tsx          → Root HTML, fonts, metadata, skip-to-content link
app/page.tsx            → Hero, social proof bar, use-case cards
components/Footer.tsx   → "Why Use", "How It Works", FAQ sections
components/JsonLd.tsx   → 4 JSON-LD schemas (WebApplication, FAQPage, HowTo, BreadcrumbList)
app/sitemap.ts          → /sitemap.xml
app/robots.ts           → /robots.txt
app/not-found.tsx       → 404 page
```

### Client (Hydrated Components)

The `"use client"` boundary starts at `HashtagGenerator.tsx`. These components are server-rendered to HTML at build time (so the form is visible immediately), then hydrated with JavaScript for interactivity.

```
components/HashtagGenerator.tsx  → State management, callbacks
components/MethodTabs.tsx        → Tab selector with keyboard navigation
components/InputForm.tsx         → Title input, textarea, file upload, submit
components/StatusMessage.tsx     → Loading spinner, error alerts
components/HashtagResults.tsx    → Hashtag chips, copy buttons, timing
```

The client JS payload is ~4.6 kB for the page, plus ~102 kB shared React runtime. No lazy loading is used because the bundle is already small.

---

## Request Flow

```
User clicks "Generate Hashtags"
│
├─ 1. useHashtagGenerator hook fires
│
├─ 2. Check browser cache (L1: localStorage)
│     Key: htgp-cache-{SHA256(method:title:text)}
│     HIT → return cached result, no network request
│     MISS → continue
│
├─ 3. POST /api/generate { method, title, text }
│   │
│   ├─ 4. Create structured request log
│   │
│   ├─ 5. Rate limit (Upstash Redis, 5 req/60s per IP)
│   │     BLOCKED → return 429
│   │     Redis down → skip, allow request (fail-open)
│   │
│   ├─ 6. Validate input
│   │     method ∈ [claude, gpt5, gemini]
│   │     20 ≤ text.length ≤ 50,000
│   │     API key exists in process.env
│   │
│   ├─ 7. Check server cache (L2: Redis)
│   │     Key: htgp-srv-{SHA256(method:title:text)}
│   │     HIT → return cached result, skip provider call
│   │     MISS → continue
│   │     Redis down → skip, call provider (fail-open)
│   │
│   ├─ 8. Call AI provider
│   │     claude → Anthropic SDK → claude-opus-4-6
│   │     gpt5   → OpenAI SDK   → gpt-5
│   │     gemini → Google AI SDK → gemini-2.5-flash
│   │
│   ├─ 9. Write result to server cache (fire-and-forget)
│   │
│   ├─ 10. Return { success: true, result }
│   │
│   └─ finally: compute latencyMs, emit structured JSON log
│
├─ 11. Write result to browser cache (localStorage)
│
└─ 12. Render hashtag chips
```

---

## Caching

Two cache tiers reduce AI provider calls. Both use SHA-256 content-addressed keys derived from `method:title:text`. Both fail open — if a cache is unavailable, the request proceeds to the next layer.

```
Browser (per-user, per-device)
  L1: localStorage
  Key prefix: htgp-cache-
  TTL: 24h, max 50 entries, LRU eviction
  Effect: no network round-trip for repeated queries
      │ miss
      ▼
Server (cross-user, global)
  L2: Upstash Redis
  Key prefix: htgp-srv-
  TTL: 24h, automatic expiry via Redis EX
  Effect: user B gets user A's result for the same input
      │ miss
      ▼
AI Provider call
```

The two SHA-256 implementations are intentionally separate. `lib/cache.ts` runs in the browser, `lib/server-cache.ts` runs on the server. Sharing code across the build boundary would couple the client and server bundles.

### Session Persistence

User input (title, text, selected method) is persisted to localStorage with debounced writes (500ms) via `hooks/useLocalStorage.ts`. Keys: `htgp-title`, `htgp-text`, `htgp-method`.

---

## Rate Limiting

### Application-Level (`lib/rate-limit.ts`)

Per-IP rate limiting using Upstash Redis with a sliding window algorithm. Runs before input validation so abusive requests are rejected early.

| Parameter | Value |
|-----------|-------|
| Algorithm | Sliding window (`@upstash/ratelimit`) |
| Limit | 5 requests per 60 seconds per IP |
| IP source | `x-forwarded-for` header (first entry), fallback `127.0.0.1` |
| Fail behavior | Fail-open — if Redis is down, requests proceed |

The rate limiter uses a lazy singleton: the Redis client is created on first use and only if `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. Without those env vars, rate limiting is silently disabled.

### Provider-Level

Each AI provider enforces its own per-API-key rate limits independently. When a provider returns HTTP 429, the route returns it to the client as `{ code: "RATE_LIMITED" }`.

---

## Observability

### Structured Logging (`lib/logger.ts`)

Every API request emits exactly one structured JSON log line via `console.log(JSON.stringify(...))`. The log object is created at the top of the handler, populated as the request progresses, and emitted in a `finally` block so it's written regardless of outcome.

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | `string` | UUID v4, unique per request |
| `timestamp` | `string` | ISO 8601 when the request started |
| `method` | `string \| null` | AI provider, null if request failed before parsing |
| `ip` | `string` | Client IP from `x-forwarded-for` |
| `latencyMs` | `number` | Total request duration in milliseconds |
| `statusCode` | `number` | HTTP response status code |
| `cacheHit` | `boolean` | Whether the server Redis cache returned a result |
| `error` | `string \| null` | Error message if the request failed |
| `code` | `string \| null` | Error code (`RATE_LIMITED`, `PROVIDER_ERROR`, `INVALID_INPUT`, `MISSING_KEY`) |

Vercel parses structured JSON logs automatically. Logs can be forwarded to Datadog, Axiom, or other aggregators via Vercel Log Drains.

---

## Security

### API Security

- API keys exist only in `process.env` on the server. They are never sent to the browser.
- Provider modules use `import "server-only"` to prevent accidental client bundling.
- Input is validated and bounded (20–50,000 characters) before any provider call.
- Per-IP rate limiting rejects abusive traffic before it reaches the AI providers.

### HTTP Security Headers (`next.config.ts`)

Four headers are set on every response:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents browsers from guessing content types. Without it, a browser could execute a JSON response as HTML/JavaScript. |
| `X-Frame-Options` | `DENY` | Prevents clickjacking by blocking the page from being embedded in iframes. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits URL information sent to third parties. Cross-origin requests (e.g., to AI provider APIs) receive only the origin, not the full path. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years. Vercel applies this on `*.vercel.app` automatically, but custom domains need it explicitly. |

---

## API Route (`app/api/generate/route.ts`)

### Request

```
POST /api/generate
Content-Type: application/json

{
  "method": "claude" | "gpt5" | "gemini",
  "title": "optional title string",
  "text": "content text (20–50,000 characters)"
}
```

### Success Response (200)

```json
{
  "success": true,
  "result": {
    "hashtags": ["#ai", "#machinelearning", "#deeplearning"],
    "durationMs": 1234,
    "method": "claude"
  }
}
```

### Error Responses

| Status | Code | Cause |
|--------|------|-------|
| 400 | `INVALID_INPUT` | Bad method, text too short/long |
| 429 | `RATE_LIMITED` | Application or provider rate limit exceeded |
| 500 | `PROVIDER_ERROR` | AI provider call failed |
| 503 | `MISSING_KEY` | API key not configured |

### Pipeline

```
create log → rate limit → validate → server cache check → call AI → cache result → respond → emit log
```

The `finally` block guarantees a log line is emitted for every request, including failures.

---

## Deployment

### Asset Serving

| Asset | Served By | Caching |
|-------|-----------|---------|
| Static HTML (`/`, `/404`) | CDN edge | Revalidated on redeploy |
| JS/CSS chunks (`/_next/static/`) | CDN edge | Immutable (content-hashed filenames) |
| Fonts (Figtree) | CDN edge | Immutable, `font-display: swap` |
| `/sitemap.xml`, `/robots.txt` | CDN edge | Regenerated on build |
| `POST /api/generate` | Serverless function | Server Redis cache (L2) |

### Performance

| Metric | Value |
|--------|-------|
| Route JS | ~4.6 kB |
| Shared JS (React + Next.js) | ~102 kB |
| Time to First Byte | <50ms (static HTML from CDN) |
| Time to Interactive | <200ms |

---

## SEO

### Metadata (`app/layout.tsx`)

Title, description, keywords, canonical URL, Open Graph tags, and Twitter Card tags. All point to the production domain `https://hashtag-generator-pro.vercel.app`.

### Structured Data (`components/JsonLd.tsx`)

| Schema | Purpose |
|--------|---------|
| `WebApplication` | App name, description, price (free), aggregate rating |
| `FAQPage` | 5 Q&A pairs for FAQ rich snippets |
| `HowTo` | 4-step process for HowTo rich snippets |
| `BreadcrumbList` | Breadcrumb trail for SERPs |

All SEO content renders as static HTML — headings, paragraphs, FAQ answers, structured data — fully indexable without JavaScript.

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Skip-to-content link | Hidden link in `layout.tsx`, visible on focus |
| Keyboard navigation | Arrow keys, Home/End in `MethodTabs.tsx` |
| ARIA roles | `tablist`, `tab`, `tabpanel`, `alert`, `status`, `region` |
| Focus management | Results panel auto-focuses on new results |
| Form validation | `aria-invalid`, `aria-busy`, `aria-describedby` |
| Screen reader feedback | `aria-live="polite"` for status, `aria-live="assertive"` for copy feedback |
| Reduced motion | `prefers-reduced-motion` disables animations |
| Color contrast | All text meets WCAG 2.1 AA ratios |

---

## File Structure

```
HashtagGeneratorPro/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, metadata, skip-link
│   ├── page.tsx                   # Hero, social proof, use cases
│   ├── globals.css                # Tailwind v4 theme, animations, a11y
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   └── api/generate/
│       └── route.ts               # Rate limit → validate → cache → AI → respond
├── components/
│   ├── HashtagGenerator.tsx       # Client: orchestrator
│   ├── MethodTabs.tsx             # Client: tab selector
│   ├── InputForm.tsx              # Client: form inputs + file upload
│   ├── HashtagResults.tsx         # Client: hashtag chips + copy
│   ├── StatusMessage.tsx          # Client: spinner + error alerts
│   ├── NavBar.tsx                 # Client: responsive nav
│   ├── FaqAccordion.tsx           # Client: animated accordion
│   ├── ArchitectureDiagram.tsx    # Static: inline SVG diagram
│   ├── Footer.tsx                 # Static: features, how-it-works, FAQ
│   └── JsonLd.tsx                 # Static: 4 structured data schemas
├── lib/
│   ├── types.ts                   # Shared types and constants
│   ├── prompts.ts                 # System prompt + user prompt builder
│   ├── parse-hashtags.ts          # LLM output parser
│   ├── clipboard.ts               # Copy-to-clipboard utility
│   ├── cache.ts                   # Browser cache (L1, localStorage)
│   ├── server-cache.ts            # Server cache (L2, Redis)
│   ├── rate-limit.ts              # Per-IP rate limiter (Redis)
│   ├── logger.ts                  # Structured JSON request logging
│   └── providers/
│       ├── claude.ts              # Anthropic SDK
│       ├── openai.ts              # OpenAI SDK
│       ├── gemini.ts              # Google AI SDK
│       └── index.ts               # Provider registry + dispatch
├── hooks/
│   ├── useHashtagGenerator.ts     # Cache → API → state
│   └── useLocalStorage.ts         # Persistent localStorage with debounce
├── docs/
│   ├── ARCHITECTURE.md            # This file
│   └── adr/
│       ├── 001-static-dynamic-split.md
│       ├── 002-fail-open-rate-limiting.md
│       ├── 003-two-tier-caching.md
│       └── 004-provider-isolation.md
├── next.config.ts                 # Security headers, build config
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Architecture Decision Records

Detailed tradeoff analysis for key decisions lives in `docs/adr/`:

| ADR | Decision |
|-----|----------|
| [001](adr/001-static-dynamic-split.md) | Static HTML for SEO, client React for interactivity |
| [002](adr/002-fail-open-rate-limiting.md) | Rate limiting fails open when Redis is down |
| [003](adr/003-two-tier-caching.md) | Two-tier cache: browser localStorage + server Redis |
| [004](adr/004-provider-isolation.md) | Each AI provider is an independent module |
