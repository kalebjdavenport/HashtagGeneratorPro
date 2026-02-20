# HashtagGeneratorPro — Internal Architecture

## Overview

HashtagGeneratorPro is a Next.js 15 App Router application that generates hashtags from text using three AI providers (Claude Opus, GPT-5, Gemini). The app is designed around a clear static/dynamic split: all SEO-critical content is statically generated at build time, while the interactive generator hydrates on the client and communicates with server-side API routes.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| AI Providers | Anthropic SDK, OpenAI SDK, Google Generative AI SDK | Latest |
| Deployment Target | Vercel / any Node.js host | — |

---

## Static vs Dynamic Rendering

### Build-Time Static Rendering (Server Components)

The following components render to **pure HTML at build time**. They ship zero JavaScript to the client and are served directly from the CDN:

```
app/layout.tsx          → <html>, <body>, skip-to-content link, Figtree font
app/page.tsx            → Header nav, hero section, social proof bar, use-case cards
components/Footer.tsx   → "Why Use", "How It Works", FAQ sections
components/JsonLd.tsx   → 4 structured data <script> tags (WebApplication, FAQPage, HowTo, BreadcrumbList)
app/sitemap.ts          → /sitemap.xml (generated at build)
app/robots.ts           → /robots.txt (generated at build)
app/not-found.tsx       → Custom 404 page
```

**Why this matters for SEO**: Search engine crawlers see the full page content — headings, paragraphs, FAQ answers, structured data — without executing any JavaScript. The page is fully indexable from the static HTML alone.

### Client-Side Hydration (Client Components)

The `"use client"` boundary starts at `HashtagGenerator.tsx`. These components are server-rendered to HTML during build (so the form is visible immediately), then **hydrated** with JavaScript in the browser to become interactive:

```
components/HashtagGenerator.tsx  → Top-level orchestrator (state, callbacks)
components/MethodTabs.tsx        → Tab selector with keyboard navigation
components/InputForm.tsx         → Title input, textarea, file upload, submit button
components/StatusMessage.tsx     → Loading spinner, error alerts
components/HashtagResults.tsx    → Hashtag chips, copy buttons, timing display
```

**Hydration flow**:
1. Browser receives static HTML — the form is visible and styled immediately
2. React JS bundle loads (~107 kB shared runtime + ~4.6 kB page code)
3. React attaches event listeners to the existing DOM (hydration)
4. The form becomes interactive (typing, tab switching, submitting)

**Why no lazy loading**: The client JS payload is ~4.6 kB for the page. There are no heavy client-side dependencies (unlike the original project which downloaded ML models). The overhead of `next/dynamic` or `React.lazy` would be counterproductive at this size.

---

## Request Flow

```
User clicks "Generate Hashtags"
│
├─ 1. useHashtagGenerator hook fires
│
├─ 2. Compute cache key: SHA-256(method + ":" + title + ":" + text)
│
├─ 3. Check localStorage cache
│   ├─ HIT → Return cached GenerationResult immediately (no network)
│   └─ MISS → Continue to step 4
│
├─ 4. POST /api/generate { method, title, text }
│   │
│   ├─ 5. API route validates input:
│   │   - method ∈ ["claude", "gpt5", "gemini"]
│   │   - text.length >= 20
│   │   - text.length <= 50,000
│   │   - Required API key exists in process.env
│   │
│   ├─ 6. Dispatch to provider:
│   │   ├─ claude → Anthropic SDK → claude-opus-4-6
│   │   ├─ gpt5   → OpenAI SDK   → gpt-5
│   │   └─ gemini → Google AI SDK → gemini-2.5-flash
│   │
│   ├─ 7. Parse LLM output with parseHashtags()
│   │
│   └─ 8. Return { success: true, result: { hashtags[], durationMs, method } }
│
├─ 9. Cache result in localStorage with timestamp
│
└─ 10. Render hashtag chips with copy-to-clipboard
```

---

## Caching Strategy

### Client-Side Response Cache (`lib/cache.ts`)

All API responses are cached in the browser's `localStorage` using content-addressed keys.

| Parameter | Value |
|-----------|-------|
| Key format | `htgp-cache-{SHA256(method:title:text)}` |
| Hash algorithm | SHA-256 via Web Crypto API (`crypto.subtle.digest`) |
| TTL | 24 hours |
| Max entries | 50 |
| Eviction | LRU — when at capacity, the 10 oldest entries are removed |
| Scope | Per-browser, per-origin |

**Cache behavior**:
- Same input + same method = instant cached result (no API call)
- Same input + different method = separate cache entry (allows model comparison)
- Changing even one character in the input = new cache key (SHA-256 avalanche effect)
- "Clear" button removes the current method's result from React state only
- "Reset" button wipes all `htgp-cache-*` entries from localStorage

**Why client-side**: Since the same user with the same input will always get the same output from a given model (temperature is low), caching on the client avoids redundant API calls and reduces costs. There is no server-side response cache — each unique request hits the AI provider.

### Session Persistence (`hooks/useLocalStorage.ts`)

User input (title, text, selected method) is persisted to localStorage with debounced writes (500ms). This survives page reloads.

| Key | Value |
|-----|-------|
| `htgp-title` | Last entered title string |
| `htgp-text` | Last entered text string |
| `htgp-method` | Last selected method ID |

---

## Rate Limiting

### Current Implementation

The app currently relies on **provider-level rate limiting**. Each AI provider enforces its own limits:

| Provider | Rate Limit Source |
|----------|------------------|
| Anthropic (Claude) | Per-API-key limits set by Anthropic |
| OpenAI (GPT-5) | Per-API-key limits set by OpenAI |
| Google (Gemini) | Per-project quotas in Google Cloud |

When a provider returns HTTP 429, the API route catches it and returns a user-friendly error:
```json
{ "success": false, "error": "Rate limit exceeded: ...", "code": "RATE_LIMITED" }
```

The client-side cache naturally reduces rate limit pressure — identical requests never hit the API twice within the 24-hour TTL.

### Recommended Production Additions

For production deployment, add server-side rate limiting to `/api/generate`:

1. **Per-IP throttle**: 10 requests/minute using `next-rate-limit`, Upstash Redis, or Vercel KV
2. **Global throttle**: Cap total requests per provider to stay within billing budgets
3. **Abuse prevention**: Reject requests with text > 50,000 characters (already implemented)

Example middleware approach:
```
POST /api/generate
  → Check IP rate limit (Redis/KV)
    → OVER LIMIT: Return 429 immediately
    → UNDER LIMIT: Proceed to provider call
```

---

## CDN & Deployment Strategy

### Asset Serving (Vercel or similar CDN)

| Asset | Served By | Cache Behavior |
|-------|-----------|---------------|
| Static HTML pages (`/`, `/404`) | CDN edge (global) | Cached, revalidated on redeploy |
| JS chunks (`/_next/static/chunks/`) | CDN edge (global) | **Immutable** — filenames contain content hashes, cached forever |
| CSS (`/_next/static/css/`) | CDN edge (global) | **Immutable** — content-hashed filenames |
| Fonts (Figtree, self-hosted by Next.js) | CDN edge (global) | Immutable, `font-display: swap` for no FOIT |
| Favicon (`/favicon.svg`) | CDN edge (global) | Cached with long TTL |
| `/sitemap.xml` | CDN edge (global) | Static, regenerated on build |
| `/robots.txt` | CDN edge (global) | Static, regenerated on build |
| `POST /api/generate` | **Serverless function** (not CDN) | Never cached — dynamic per-request |

### Key Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Page JS (route-specific) | ~4.6 kB | Extremely lightweight |
| Shared JS (React runtime) | ~102 kB | Standard React 19 + Next.js |
| Time to First Byte | <50ms | Static HTML from CDN edge |
| Time to Interactive | <200ms | Small hydration payload |
| Largest Contentful Paint | Heading text | No heavy images in viewport |

---

## API Route Design (`app/api/generate/route.ts`)

### Request

```
POST /api/generate
Content-Type: application/json

{
  "method": "claude" | "gpt5" | "gemini",
  "title": "optional title string",
  "text": "content text (20-50,000 characters)"
}
```

### Response — Success (200)

```json
{
  "success": true,
  "result": {
    "hashtags": ["#ai", "#machinelearning", "#deeplearning", "#neural", "#coding"],
    "durationMs": 1234,
    "method": "claude"
  }
}
```

### Response — Errors

| Status | Code | Cause |
|--------|------|-------|
| 400 | `INVALID_INPUT` | Bad method, text too short/long |
| 429 | `RATE_LIMITED` | Provider returned 429 |
| 500 | `PROVIDER_ERROR` | API call failed |
| 503 | `MISSING_KEY` | API key not set in environment |

### Security

- API keys are **never exposed to the client**. They exist only in `process.env` on the server.
- Provider modules use `import "server-only"` to prevent accidental client bundling.
- Input is validated and bounded (20–50,000 characters) to prevent abuse.

---

## File Structure

```
HashtagGeneratorPro/
├── app/
│   ├── layout.tsx              # Server: root layout, fonts, metadata, skip-link
│   ├── page.tsx                # Server: hero, social proof, use cases
│   ├── globals.css             # Tailwind v4 + Buffer theme + custom CSS
│   ├── sitemap.ts              # Next.js sitemap API
│   ├── robots.ts               # Next.js robots API
│   ├── not-found.tsx           # Custom 404
│   └── api/generate/
│       └── route.ts            # POST handler: validate → dispatch → respond
├── components/
│   ├── HashtagGenerator.tsx    # Client: top-level orchestrator
│   ├── MethodTabs.tsx          # Client: accessible tab selector
│   ├── InputForm.tsx           # Client: form inputs + file upload
│   ├── HashtagResults.tsx      # Client: hashtag chips + copy
│   ├── StatusMessage.tsx       # Client: spinner + error alerts
│   ├── Footer.tsx              # Server: features, how-it-works, FAQ
│   └── JsonLd.tsx              # Server: structured data (4 schemas)
├── lib/
│   ├── types.ts                # Shared types: MethodId, GenerationResult, API shapes
│   ├── prompts.ts              # Shared system prompt + user prompt builder
│   ├── parse-hashtags.ts       # LLM output parser (regex + fallback)
│   ├── clipboard.ts            # Clipboard API + execCommand fallback
│   ├── cache.ts                # SHA-256 content-addressed localStorage cache
│   └── providers/
│       ├── claude.ts           # Server-only: Anthropic SDK
│       ├── openai.ts           # Server-only: OpenAI SDK
│       ├── gemini.ts           # Server-only: Google AI SDK
│       └── index.ts            # Server-only: provider registry + dispatch
├── hooks/
│   ├── useHashtagGenerator.ts  # Core hook: cache → API → state
│   └── useLocalStorage.ts      # Generic localStorage persistence
├── docs/
│   └── ARCHITECTURE.md         # This file
├── public/
│   └── favicon.svg
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## SEO Architecture

### Metadata (Next.js Metadata API in `layout.tsx`)
- Title with keyword-rich template
- Description targeting "ai hashtag generator", "free hashtag tool"
- Open Graph tags with image, locale, site name
- Twitter Card (summary_large_image)
- Canonical URL
- Extended keyword list

### Structured Data (JSON-LD in `JsonLd.tsx`)
| Schema | Purpose |
|--------|---------|
| `WebApplication` | Rich result for the tool — name, description, price (free), rating |
| `FAQPage` | 5 Q&A pairs — eligible for FAQ rich snippets in Google |
| `HowTo` | 4-step process — eligible for HowTo rich snippets |
| `BreadcrumbList` | Breadcrumb trail for SERPs |

### Static Content for Crawlers
All SEO-critical content renders as static HTML without JavaScript:
- H1 heading with primary keyword
- Descriptive intro paragraph
- Use-case section targeting platform-specific searches
- Social proof bar
- "Why Use" feature grid
- "How It Works" ordered steps
- FAQ with 5 keyword-rich questions
- Footer with brand mention

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Skip-to-content link | Hidden link in `layout.tsx`, visible on focus |
| Keyboard tab navigation | Arrow keys, Home/End in `MethodTabs.tsx` |
| ARIA roles | `tablist`, `tab`, `tabpanel`, `alert`, `status`, `region` |
| Focus management | Results panel auto-focuses when new results arrive |
| Form validation | `aria-invalid`, `aria-busy`, `aria-describedby` |
| Screen reader feedback | `aria-live="polite"` for status, `aria-live="assertive"` for copy feedback |
| Reduced motion | `prefers-reduced-motion` disables animations |
| Color contrast | All text meets WCAG 2.1 AA contrast ratios |
