export default function ArchitectureDiagram() {
  return (
    <figure
      role="img"
      aria-label="Architecture diagram showing how static assets are served from the CDN edge, the browser hydrates the React interactive components, and the serverless API route dispatches to AI providers"
    >
      <svg
        viewBox="0 0 800 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Background */}
        <rect width="800" height="620" rx="16" fill="#F7F8FA" />

        {/* ── CDN Edge Layer ─────────────────────────── */}
        <rect x="40" y="20" width="720" height="130" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="20" width="720" height="32" rx="12" fill="#EEF2FF" />
        <rect x="40" y="40" width="720" height="2" fill="#EEF2FF" />
        <text x="400" y="42" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#2C4BFF">
          CDN EDGE (GLOBAL)
        </text>

        {/* Static asset boxes */}
        <rect x="65" y="65" width="140" height="60" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="135" y="88" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">Static HTML</text>
        <text x="135" y="104" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">SSG at build time</text>

        <rect x="225" y="65" width="140" height="60" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="295" y="88" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">JS Chunks</text>
        <text x="295" y="104" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Immutable, hashed</text>

        <rect x="385" y="65" width="140" height="60" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="455" y="88" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">CSS + Fonts</text>
        <text x="455" y="104" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Immutable, swap</text>

        <rect x="545" y="65" width="190" height="60" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
        <text x="640" y="88" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">SEO Assets</text>
        <text x="640" y="104" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">sitemap.xml, robots.txt</text>

        {/* ── Arrow: CDN → Browser ──────────────────── */}
        <line x1="400" y1="150" x2="400" y2="175" stroke="#2C4BFF" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="394,173 400,183 406,173" fill="#2C4BFF" />

        {/* ── Browser Layer ──────────────────────────── */}
        <rect x="40" y="185" width="720" height="195" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="185" width="720" height="32" rx="12" fill="#F0FDF4" />
        <rect x="40" y="205" width="720" height="2" fill="#F0FDF4" />
        <text x="400" y="207" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#059669">
          BROWSER (CLIENT)
        </text>

        {/* Static HTML section */}
        <rect x="65" y="225" width="340" height="65" rx="8" fill="#F0FDF4" stroke="#A7F3D0" strokeWidth="1" />
        <text x="235" y="248" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">
          Static HTML (instant paint, no JS)
        </text>
        <text x="235" y="265" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">
          Header · Hero · Use Cases · Footer · FAQ · JSON-LD
        </text>

        {/* Hydrated React section */}
        <rect x="65" y="300" width="340" height="65" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <text x="235" y="322" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">
          Hydrated React Island (&quot;use client&quot;)
        </text>
        <text x="235" y="339" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">
          HashtagGenerator · Tabs · Form · Results · Status
        </text>

        {/* Cache box */}
        <rect x="440" y="225" width="295" height="140" rx="8" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" />
        <text x="587" y="252" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">
          localStorage Cache
        </text>

        <text x="460" y="275" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Key:</text>
        <text x="460" y="292" fontFamily="monospace" fontSize="9" fill="#9A3412">htgp-cache-&#123;SHA256&#125;</text>

        <text x="460" y="315" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">TTL: 24 hours</text>
        <text x="460" y="332" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Max: 50 entries (LRU eviction)</text>
        <text x="460" y="349" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Scope: per-browser, per-origin</text>

        {/* Arrow: cache ↔ React */}
        <line x1="405" y1="332" x2="440" y2="295" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="436,298 440,290 444,299" fill="#D97706" />
        <text x="408" y="320" fontFamily="Figtree, system-ui, sans-serif" fontSize="9" fill="#D97706" fontWeight="600">HIT?</text>

        {/* ── Arrow: Browser → Server ───────────────── */}
        <line x1="235" y1="380" x2="235" y2="415" stroke="#F26D5B" strokeWidth="2" />
        <polygon points="229,413 235,423 241,413" fill="#F26D5B" />
        <text x="245" y="404" fontFamily="monospace" fontSize="9" fill="#F26D5B" fontWeight="600">
          POST /api/generate
        </text>
        <text x="245" y="416" fontFamily="Figtree, system-ui, sans-serif" fontSize="9" fill="#636E7F">
          (only on cache MISS)
        </text>

        {/* ── Server Layer ───────────────────────────── */}
        <rect x="40" y="425" width="720" height="175" rx="12" fill="white" stroke="#E0E4EA" strokeWidth="1.5" />
        <rect x="40" y="425" width="720" height="32" rx="12" fill="#FEF2F2" />
        <rect x="40" y="445" width="720" height="2" fill="#FEF2F2" />
        <text x="400" y="447" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#DC2626">
          SERVERLESS FUNCTION (NODE.JS)
        </text>

        {/* API Route box */}
        <rect x="65" y="462" width="670" height="42" rx="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
        <text x="400" y="480" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#1E2330">
          API Route Handler
        </text>
        <text x="400" y="494" textAnchor="middle" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">
          Validate Input → Check API Key → Dispatch to Provider → Parse with parseHashtags() → Respond
        </text>

        {/* Provider boxes */}
        <rect x="65" y="520" width="210" height="60" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        <circle cx="90" cy="550" r="6" fill="#D97706" />
        <text x="110" y="545" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#1E2330">Anthropic API</text>
        <text x="110" y="562" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Claude Opus (claude-opus-4-6)</text>

        <rect x="295" y="520" width="210" height="60" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
        <circle cx="320" cy="550" r="6" fill="#059669" />
        <text x="340" y="545" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#1E2330">OpenAI API</text>
        <text x="340" y="562" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">GPT-5 (gpt-5)</text>

        <rect x="525" y="520" width="210" height="60" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
        <circle cx="550" cy="550" r="6" fill="#2563EB" />
        <text x="570" y="545" fontFamily="Figtree, system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#1E2330">Google AI API</text>
        <text x="570" y="562" fontFamily="Figtree, system-ui, sans-serif" fontSize="10" fill="#636E7F">Gemini (gemini-2.5-flash)</text>

        {/* Dispatch arrows */}
        <line x1="170" y1="504" x2="170" y2="520" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="166,518 170,524 174,518" fill="#D97706" />

        <line x1="400" y1="504" x2="400" y2="520" stroke="#059669" strokeWidth="1.5" />
        <polygon points="396,518 400,524 404,518" fill="#059669" />

        <line x1="630" y1="504" x2="630" y2="520" stroke="#2563EB" strokeWidth="1.5" />
        <polygon points="626,518 630,524 634,518" fill="#2563EB" />
      </svg>

      <figcaption className="text-xs text-buffer-muted text-center mt-3">
        Static HTML and assets are served from CDN edge nodes globally.
        The interactive React components hydrate client-side and communicate with
        serverless API routes that dispatch to AI providers. Responses are cached
        in localStorage using SHA-256 content-addressed keys.
      </figcaption>
    </figure>
  );
}
