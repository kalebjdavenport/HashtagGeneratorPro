export default function ArchitectureDiagram() {
  const f = "Figtree, system-ui, sans-serif";
  const mono = "ui-monospace, monospace";
  const dark = "#1E2330";
  const muted = "#566070";

  return (
    <figure>
      <svg
        viewBox="0 0 820 832"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Architecture diagram showing the CDN edge caching layer for static assets, the browser hydration boundary separating static HTML from the interactive React island, the localStorage response cache, and the Next.js route handler that dispatches to isolated AI providers with independent rate limits"
      >
        {/* Background */}
        <rect width="820" height="832" rx="16" fill="#F7F8FA" />

        {/* ═══════════════════════════════════════════════
            LAYER 1 — CDN EDGE (CACHING)
            ═══════════════════════════════════════════════ */}
        <rect x="40" y="20" width="740" height="155" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="20" width="740" height="32" rx="12" fill="#EEF2FF" />
        <rect x="40" y="40" width="740" height="2" fill="#EEF2FF" />
        <text x="410" y="42" textAnchor="middle" fontFamily={f} fontSize="12" fontWeight="700" fill="#2C4BFF">
          CDN EDGE — IMMUTABLE CACHE (GLOBAL)
        </text>

        {/* Static assets */}
        <rect x="60" y="62" width="165" height="52" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="142" y="83" textAnchor="middle" fontFamily={f} fontSize="11" fontWeight="600" fill={dark}>Static HTML</text>
        <text x="142" y="98" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>SSG at build · cached until redeploy</text>

        <rect x="240" y="62" width="130" height="52" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="305" y="83" textAnchor="middle" fontFamily={f} fontSize="11" fontWeight="600" fill={dark}>JS Chunks</text>
        <text x="305" y="98" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>Content-hashed · forever</text>

        <rect x="385" y="62" width="130" height="52" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="450" y="83" textAnchor="middle" fontFamily={f} fontSize="11" fontWeight="600" fill={dark}>CSS + Fonts</text>
        <text x="450" y="98" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>Content-hashed · forever</text>

        <rect x="530" y="62" width="235" height="52" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="647" y="83" textAnchor="middle" fontFamily={f} fontSize="11" fontWeight="600" fill={dark}>SEO Assets</text>
        <text x="647" y="98" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>sitemap.xml · robots.txt · JSON-LD</text>

        {/* CDN cache callout */}
        <rect x="60" y="124" width="705" height="40" rx="6" fill="#FAFAFE" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="4 3" />
        <text x="410" y="140" textAnchor="middle" fontFamily={f} fontSize="10" fill="#2C4BFF" fontWeight="600">
          Cache-Control: public, max-age=31536000, immutable
        </text>
        <text x="410" y="154" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          All static assets are served from edge nodes worldwide — zero origin hits for returning visitors
        </text>

        {/* Arrow: CDN → Browser */}
        <line x1="410" y1="175" x2="410" y2="198" stroke="#2C4BFF" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="404,196 410,206 416,196" fill="#2C4BFF" />

        {/* ═══════════════════════════════════════════════
            LAYER 2 — BROWSER (HYDRATION BOUNDARY)
            ═══════════════════════════════════════════════ */}
        <rect x="40" y="208" width="740" height="260" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="208" width="740" height="32" rx="12" fill="#F0FDF4" />
        <rect x="40" y="228" width="740" height="2" fill="#F0FDF4" />
        <text x="410" y="230" textAnchor="middle" fontFamily={f} fontSize="12" fontWeight="700" fill="#059669">
          BROWSER (CLIENT)
        </text>

        {/* Hydration boundary label */}
        <line x1="60" y1="310" x2="430" y2="310" stroke="#D97706" strokeWidth="1.5" strokeDasharray="5 4" />
        <rect x="140" y="300" width="180" height="20" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <text x="230" y="314" textAnchor="middle" fontFamily={f} fontSize="9" fontWeight="700" fill="#B45309">
          HYDRATION BOUNDARY
        </text>

        {/* STATIC ZONE — above the boundary */}
        <rect x="60" y="245" width="370" height="55" rx="8" fill="#F0FDF4" stroke="#A7F3D0" strokeWidth="1" />
        <text x="70" y="261" fontFamily={f} fontSize="10" fontWeight="700" fill="#059669">STATIC — NO JS REQUIRED</text>
        <text x="245" y="278" textAnchor="middle" fontFamily={f} fontSize="10" fontWeight="600" fill={dark}>
          Header · Hero · Use Cases · Footer · FAQ · JSON-LD
        </text>
        <text x="245" y="292" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          Pure HTML from server — visible instantly, fully crawlable
        </text>

        {/* INTERACTIVE ZONE — below the boundary */}
        <rect x="60" y="328" width="370" height="128" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <text x="70" y="345" fontFamily={f} fontSize="10" fontWeight="700" fill="#B45309">INTERACTIVE — &quot;use client&quot;</text>
        <text x="245" y="363" textAnchor="middle" fontFamily={f} fontSize="10" fontWeight="600" fill={dark}>
          HashtagGenerator (orchestrator)
        </text>
        <text x="245" y="380" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          MethodTabs · InputForm · StatusMessage · HashtagResults
        </text>

        {/* Why hydrate callout */}
        <rect x="75" y="393" width="340" height="52" rx="6" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" strokeDasharray="4 3" />
        <text x="245" y="409" textAnchor="middle" fontFamily={f} fontSize="9" fontWeight="600" fill="#92400E">
          Why hydrate? These components need:
        </text>
        <text x="245" y="422" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          useState (form input) · onClick (copy, submit) · useEffect (cache)
        </text>
        <text x="245" y="435" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          Keyboard events (tab nav) · Dynamic rendering (results)
        </text>

        {/* ── localStorage Cache ── */}
        <rect x="450" y="245" width="315" height="212" rx="8" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1.5" />
        <text x="607" y="268" textAnchor="middle" fontFamily={f} fontSize="12" fontWeight="700" fill="#92400E">
          Response Cache
        </text>
        <text x="607" y="283" textAnchor="middle" fontFamily={f} fontSize="10" fill={muted}>
          localStorage (browser-side)
        </text>

        <text x="465" y="306" fontFamily={f} fontSize="10" fontWeight="600" fill={dark}>Key</text>
        <text x="465" y="320" fontFamily={mono} fontSize="9" fill="#9A3412">htgp-cache-&#123;SHA-256(method:title:text)&#125;</text>

        <text x="465" y="342" fontFamily={f} fontSize="10" fontWeight="600" fill={dark}>Rules</text>
        <text x="465" y="356" fontFamily={f} fontSize="9" fill={muted}>TTL: 24 hours · Max: 50 entries · LRU eviction</text>
        <text x="465" y="370" fontFamily={f} fontSize="9" fill={muted}>Same input + same model = instant (no API call)</text>
        <text x="465" y="384" fontFamily={f} fontSize="9" fill={muted}>Same input + diff model = separate cache entry</text>

        <text x="465" y="406" fontFamily={f} fontSize="10" fontWeight="600" fill={dark}>How it reduces load</text>
        <text x="465" y="420" fontFamily={f} fontSize="9" fill={muted}>Identical requests never reach the server twice.</text>
        <text x="465" y="434" fontFamily={f} fontSize="9" fill={muted}>Combined with CDN edge caching for static assets,</text>
        <text x="465" y="448" fontFamily={f} fontSize="9" fill={muted}>the origin server only handles unique AI requests.</text>

        {/* Arrow: React ↔ cache */}
        <line x1="430" y1="380" x2="448" y2="380" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="445,375 455,380 445,385" fill="#D97706" />
        <line x1="448" y1="365" x2="430" y2="365" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="433,360 423,365 433,370" fill="#D97706" />
        <text x="436" y="358" textAnchor="middle" fontFamily={f} fontSize="8" fill="#D97706" fontWeight="600">HIT</text>
        <text x="436" y="395" textAnchor="middle" fontFamily={f} fontSize="8" fill="#D97706" fontWeight="600">MISS</text>

        {/* ── Arrow: Browser → Server ── */}
        <line x1="245" y1="468" x2="245" y2="508" stroke="#F26D5B" strokeWidth="2" />
        <polygon points="239,506 245,516 251,506" fill="#F26D5B" />
        <text x="255" y="492" fontFamily={mono} fontSize="9" fill="#F26D5B" fontWeight="600">
          POST /api/generate
        </text>
        <text x="255" y="505" fontFamily={f} fontSize="9" fill={muted}>
          (only on cache MISS)
        </text>

        {/* ═══════════════════════════════════════════════
            LAYER 3 — SERVERLESS (RATE LIMITING)
            ═══════════════════════════════════════════════ */}
        <rect x="40" y="520" width="740" height="292" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="520" width="740" height="32" rx="12" fill="#FEF2F2" />
        <rect x="40" y="540" width="740" height="2" fill="#FEF2F2" />
        <text x="410" y="542" textAnchor="middle" fontFamily={f} fontSize="12" fontWeight="700" fill="#DC2626">
          NEXT.JS ROUTE HANDLER — app/api/generate/route.ts
        </text>

        {/* API Route */}
        <rect x="60" y="555" width="710" height="50" rx="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
        <text x="410" y="572" textAnchor="middle" fontFamily={f} fontSize="11" fontWeight="600" fill={dark}>
          export async function POST() → Validate → Check Key → Dispatch → parseHashtags() → Respond
        </text>
        <text x="410" y="586" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          Compiled at build time into an isolated serverless function (Vercel deploys as AWS Lambda)
        </text>
        <text x="410" y="598" textAnchor="middle" fontFamily={f} fontSize="9" fill={muted}>
          API keys in process.env only (never bundled to client) · import &quot;server-only&quot; enforced
        </text>

        {/* Provider isolation label */}
        <rect x="60" y="615" width="710" height="24" rx="6" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" strokeDasharray="4 3" />
        <text x="410" y="631" textAnchor="middle" fontFamily={f} fontSize="10" fontWeight="700" fill="#DC2626">
          ISOLATED PROVIDERS — INDEPENDENT API KEYS, SEPARATE RATE LIMITS
        </text>

        {/* Provider boxes */}
        <rect x="60" y="650" width="225" height="148" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        <circle cx="82" cy="670" r="6" fill="#D97706" />
        <text x="100" y="674" fontFamily={f} fontSize="12" fontWeight="600" fill={dark}>Anthropic API</text>
        <text x="75" y="692" fontFamily={f} fontSize="10" fill={muted}>Model: claude-opus-4-6</text>
        <text x="75" y="708" fontFamily={f} fontSize="9" fontWeight="600" fill="#B45309">Rate limit: per Anthropic key</text>
        <text x="75" y="724" fontFamily={f} fontSize="9" fill={muted}>429 → caught, returned as</text>
        <text x="75" y="737" fontFamily={mono} fontSize="9" fill="#DC2626">RATE_LIMITED</text>
        <rect x="75" y="750" width="195" height="36" rx="4" fill="#FEF9C3" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 2" />
        <text x="172" y="765" textAnchor="middle" fontFamily={f} fontSize="8" fill="#92400E">
          Each provider fails independently —
        </text>
        <text x="172" y="778" textAnchor="middle" fontFamily={f} fontSize="8" fill="#92400E">
          one outage never affects the other two
        </text>

        <rect x="298" y="650" width="225" height="148" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
        <circle cx="320" cy="670" r="6" fill="#059669" />
        <text x="338" y="674" fontFamily={f} fontSize="12" fontWeight="600" fill={dark}>OpenAI API</text>
        <text x="313" y="692" fontFamily={f} fontSize="10" fill={muted}>Model: gpt-5</text>
        <text x="313" y="708" fontFamily={f} fontSize="9" fontWeight="600" fill="#047857">Rate limit: per OpenAI key</text>
        <text x="313" y="724" fontFamily={f} fontSize="9" fill={muted}>429 → caught, returned as</text>
        <text x="313" y="737" fontFamily={mono} fontSize="9" fill="#DC2626">RATE_LIMITED</text>
        <text x="313" y="760" fontFamily={f} fontSize="9" fill={muted}>Temp: 0.3 · Strong at contextual</text>
        <text x="313" y="774" fontFamily={f} fontSize="9" fill={muted}>understanding and concise tags</text>
        <text x="313" y="788" fontFamily={f} fontSize="9" fill={muted}>Max tokens: 300</text>

        <rect x="536" y="650" width="225" height="148" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
        <circle cx="558" cy="670" r="6" fill="#2563EB" />
        <text x="576" y="674" fontFamily={f} fontSize="12" fontWeight="600" fill={dark}>Google AI API</text>
        <text x="551" y="692" fontFamily={f} fontSize="10" fill={muted}>Model: gemini-2.5-flash</text>
        <text x="551" y="708" fontFamily={f} fontSize="9" fontWeight="600" fill="#1D4ED8">Rate limit: per Google key</text>
        <text x="551" y="724" fontFamily={f} fontSize="9" fill={muted}>429 → caught, returned as</text>
        <text x="551" y="737" fontFamily={mono} fontSize="9" fill="#DC2626">RATE_LIMITED</text>
        <text x="551" y="760" fontFamily={f} fontSize="9" fill={muted}>Fastest response times · Free tier</text>
        <text x="551" y="774" fontFamily={f} fontSize="9" fill={muted}>available · Good for high-volume</text>
        <text x="551" y="788" fontFamily={f} fontSize="9" fill={muted}>Temp: 0.4 · Max tokens: 256</text>

        {/* Dispatch arrows */}
        <line x1="172" y1="605" x2="172" y2="650" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="168,648 172,654 176,648" fill="#D97706" />

        <line x1="410" y1="605" x2="410" y2="650" stroke="#059669" strokeWidth="1.5" />
        <polygon points="406,648 410,654 414,648" fill="#059669" />

        <line x1="648" y1="605" x2="648" y2="650" stroke="#2563EB" strokeWidth="1.5" />
        <polygon points="644,648 648,654 652,648" fill="#2563EB" />
      </svg>

      <figcaption className="mt-6 max-w-2xl mx-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-buffer-muted">
          <div>
            <dt className="font-semibold text-buffer-dark mb-0.5">Two-tier caching</dt>
            <dd>CDN edge serves static assets with immutable headers. Browser caches AI responses in localStorage via SHA-256 keys — identical requests never hit the server twice.</dd>
          </div>
          <div>
            <dt className="font-semibold text-buffer-dark mb-0.5">Provider isolation</dt>
            <dd>Each AI provider has its own API key and independent rate limits. If one is down, the other two remain available.</dd>
          </div>
          <div>
            <dt className="font-semibold text-buffer-dark mb-0.5">Hydration boundary</dt>
            <dd>Only the interactive form uses &quot;use client&quot; and hydrates with JS. All SEO content renders as pure static HTML with zero JavaScript.</dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
