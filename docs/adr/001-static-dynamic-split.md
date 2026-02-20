# ADR 001: Static/Dynamic Split

**Status:** Accepted

## Context

The app serves two purposes: marketing content (hero, features, FAQ, use cases) that search engines must crawl, and an interactive hashtag generator that requires JavaScript. Shipping a single-page React app would hurt SEO — crawlers would see an empty page until JavaScript executes. Rendering everything server-side on each request would add unnecessary latency and compute costs for content that rarely changes.

## Decision

Split the page into a **static layer** (HTML generated at build time, zero JavaScript) and a **dynamic layer** (React components that hydrate on the client). The hydration boundary starts at `HashtagGenerator.tsx`. Everything above it — header, hero, feature bar, use cases, FAQ content, structured data — is pure HTML served from the CDN edge.

## Considerations

**Benefits:**

- Static content loads instantly from CDN with no origin round-trip
- Search engines index all marketing content without executing JavaScript
- The interactive generator loads independently — a slow AI response doesn't block the page
- Lighthouse performance score stays high because the critical rendering path has no JavaScript

**Tradeoffs:**

- Content changes to static sections require a rebuild and redeploy

This mirrors the principle of separating read-optimized paths from write-optimized paths. The static layer is a read-optimized materialized view — precomputed at build time, served at the edge. The API layer is the write path, handling dynamic computation on demand.
