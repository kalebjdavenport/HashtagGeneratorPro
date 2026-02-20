# ADR 004: Provider Isolation

**Status:** Accepted

## Context

The app integrates three AI providers (Anthropic Claude, OpenAI GPT-5, Google Gemini), each with its own SDK, API key, rate limits, error behavior, and availability characteristics. A shared abstraction layer could reduce code duplication but would couple providers together — a breaking change in one SDK could affect all providers.

## Decision

Each AI provider is an **independent module** (`lib/providers/claude.ts`, `openai.ts`, `gemini.ts`) with its own SDK import, API key, and error handling. A thin registry (`lib/providers/index.ts`) dispatches to the correct module by method ID. Providers share only the `GenerationResult` return type and the system/user prompt templates.

## Consequences

**Benefits:**
- A bug or breaking change in one provider's SDK cannot affect others
- Each provider can be independently upgraded, tested, or disabled
- If one provider is rate-limited or down, users can switch to another immediately
- Adding a new provider is a self-contained task: create one file, register it, add the API key

**Tradeoffs:**
- Some code is duplicated across providers (SDK initialization, prompt formatting, response parsing)
- Each provider must independently handle its SDK's error types
- No shared retry or circuit-breaker logic — each provider handles failures in its own way

**DDIA connection:** This follows the bounded context pattern from domain-driven design. Each provider is a bounded context with its own model (SDK types), its own data source (API endpoint), and its own failure modes. The blast radius of any single provider failure is contained to that provider. This is also related to the bulkhead pattern — isolating components so that a failure in one does not cascade to others.
