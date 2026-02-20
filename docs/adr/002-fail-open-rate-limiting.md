# ADR 002: Fail-Open Rate Limiting

**Status:** Accepted

## Context

The app uses Upstash Redis for sliding-window rate limiting. Redis is an external dependency — it can be temporarily unreachable due to network partitions, maintenance windows, or DNS failures. When Redis is down, the rate limiter must either reject all requests (fail-closed) or allow them through (fail-open).

## Decision

Rate limiting **fails open**: if the Redis connection fails, the request proceeds as if no rate limit existed. The rate limit check is wrapped in a try/catch that silently catches errors and allows the request to continue.

## Consequences

**Benefits:**
- A Redis outage does not become an application outage — users can still generate hashtags
- No cascading failure: a problem in the rate-limiting infrastructure stays contained
- Simple implementation: one try/catch block, no circuit breaker or retry logic needed

**Tradeoffs:**
- During a Redis outage, rate limits are not enforced — a determined abuser could make unlimited requests
- The window of exposure is bounded by Redis's typical availability (>99.9% for Upstash)
- AI provider rate limits still apply as a secondary defense layer

**DDIA connection:** This is a CAP theorem tradeoff. The rate limiter is a distributed system (app server + Redis). During a network partition, we choose **availability** (serve all requests) over **consistency** (enforce exact rate limits). This is the right tradeoff because rate limiting is a best-effort protection, not a correctness requirement — it's worse to block legitimate users than to temporarily allow excess traffic.
