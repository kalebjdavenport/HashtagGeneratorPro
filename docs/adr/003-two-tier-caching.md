# ADR 003: Two-Tier Caching

**Status:** Accepted

## Context

AI provider calls are expensive (cost, latency). Users often regenerate hashtags for the same text, and different users may paste the same popular article. The app needs caching at two levels: per-user (to avoid redundant API calls for a single user) and cross-user (to deduplicate identical requests across all users).

## Decision

Implement a **two-tier cache** with content-addressed keys:

1. **L1 — Browser localStorage** (`lib/cache.ts`): Per-user, per-device. Key format: `htgp-cache-{SHA256(method:title:text)}`. TTL 24h, max 50 entries, LRU eviction. Returns cached results instantly without a network round-trip.

2. **L2 — Server Redis** (`lib/server-cache.ts`): Cross-user, global. Key format: `htgp-srv-{SHA256(method:title:text)}`. TTL 24h, managed by Redis `EX` option. Deduplicates identical requests across all users.

Both tiers use the same SHA-256 content-addressed key derivation (method + title + text), but different prefixes to avoid collisions. Cache reads are fail-open — if either tier fails, the request proceeds to the AI provider.

## Consequences

**Benefits:**
- L1 eliminates network round-trips entirely for repeated queries on the same device
- L2 eliminates redundant AI provider calls across users — if user A generates hashtags for a viral article, user B gets the cached result
- Content-addressed keys guarantee that identical inputs always map to the same cache entry
- Both tiers fail open, so cache infrastructure problems never block functionality

**Tradeoffs:**
- Two cache implementations to maintain (though they're simple and independent)
- L1 and L2 are not synchronized — a user could get an L2 hit that differs from their L1 cache if the provider gave slightly different results on a previous call
- SHA-256 hashing adds a small amount of compute per request (negligible compared to AI provider latency)

**DDIA connection:** This follows the L1/L2 cache hierarchy pattern from CPU architecture, applied at the application level. L1 (localStorage) is fast but private; L2 (Redis) is slower but shared. Content-addressed storage guarantees deduplication — the same input always produces the same key, similar to content-addressable storage systems like Git.
