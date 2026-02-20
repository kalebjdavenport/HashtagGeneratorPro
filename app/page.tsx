import HashtagGenerator from "@/components/HashtagGenerator";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import NavBar from "@/components/NavBar";
import ArchitectureDiagramClient from "@/components/ArchitectureDiagramClient";

export default function Home() {
  return (
    <>
      <JsonLd />

      <NavBar />

      <main className="flex-1">
        {/* Hero */}
        <div className="hero-gradient">
          <section
            aria-labelledby="hashtag-gen-heading"
            className="max-w-2xl mx-auto px-5 pt-14 pb-16"
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-buffer-blue bg-white border border-buffer-blue/20 rounded-full px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-buffer-green animate-pulse motion-reduce:animate-none" />
                Powered by 3 frontier AI models
              </div>
              <h1
                id="hashtag-gen-heading"
                className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-buffer-dark leading-[1.1]"
              >
                Generate hashtags with{" "}
                <span className="bg-gradient-to-r from-buffer-blue via-buffer-purple to-buffer-coral bg-clip-text text-transparent">
                  cutting-edge AI
                </span>
              </h1>
              <p className="text-buffer-muted text-lg leading-relaxed max-w-xl">
                Paste any text or upload a .txt file and get relevant,
                high-performing hashtags in seconds. Compare results from{" "}
                <strong className="text-buffer-dark">Claude Opus</strong>,{" "}
                <strong className="text-buffer-dark">GPT-5</strong>, and{" "}
                <strong className="text-buffer-dark">Gemini Flash</strong>. Free,
                no signup.
              </p>
            </div>
            <HashtagGenerator />
          </section>
        </div>

        {/* Feature Highlights */}
        <div className="border-y border-buffer-border bg-white">
          <ul
            className="max-w-5xl mx-auto px-5 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-buffer-muted"
            aria-label="Key features"
          >
            <li className="flex items-center gap-2">
              <span className="text-amber-600 text-base" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span className="font-medium text-buffer-dark">4.8/5</span>
              user rating
            </li>
            <li className="w-px h-4 bg-buffer-border hidden sm:block" aria-hidden="true" />
            <li className="font-medium text-buffer-dark">
              3 AI models
            </li>
            <li className="w-px h-4 bg-buffer-border hidden sm:block" aria-hidden="true" />
            <li className="font-medium text-buffer-dark">
              100% free
            </li>
            <li className="w-px h-4 bg-buffer-border hidden sm:block" aria-hidden="true" />
            <li className="font-medium text-buffer-dark">
              Private
            </li>
            <li className="w-px h-4 bg-buffer-border hidden sm:block" aria-hidden="true" />
            <li className="font-medium text-buffer-dark">
              Smart caching
            </li>
          </ul>
        </div>

        {/* Use Cases */}
        <section
          aria-labelledby="use-cases-heading"
          className="max-w-5xl mx-auto px-5 py-14"
        >
          <h2
            id="use-cases-heading"
            className="text-2xl font-bold tracking-tight text-buffer-dark mb-2 text-center"
          >
            Generate Hashtags For Any Platform
          </h2>
          <p className="text-buffer-muted text-center mb-8 max-w-lg mx-auto">
            Whether you&apos;re posting a reel, publishing a blog, or crafting a
            tweet &mdash; get the right hashtags instantly.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <article className="feature-card rounded-xl border border-buffer-border bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-buffer-dark mb-1.5">
                Instagram &amp; TikTok
              </h3>
              <p className="text-sm text-buffer-muted leading-relaxed">
                Maximize discoverability on visual platforms. AI finds
                niche-relevant hashtags that boost your reach and engagement.
              </p>
            </article>
            <article className="feature-card rounded-xl border border-buffer-border bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-buffer-dark mb-1.5">
                Twitter / X &amp; LinkedIn
              </h3>
              <p className="text-sm text-buffer-muted leading-relaxed">
                Find concise, high-impact hashtags for professional posts,
                thought leadership, and conversation threads.
              </p>
            </article>
            <article className="feature-card rounded-xl border border-buffer-border bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-buffer-dark mb-1.5">
                Blog Posts &amp; Articles
              </h3>
              <p className="text-sm text-buffer-muted leading-relaxed">
                Extract topic tags from long-form content for SEO, content
                categorization, and cross-platform distribution.
              </p>
            </article>
          </div>
        </section>

        {/* Architecture */}
        <section
          aria-labelledby="architecture-heading"
          className="max-w-4xl mx-auto px-5 py-14"
          id="architecture"
        >
          <h2
            id="architecture-heading"
            className="text-2xl font-bold tracking-tight text-buffer-dark mb-2 text-center"
          >
            Architecture
          </h2>
          <p className="text-buffer-muted text-center mb-8 max-w-lg mx-auto">
            Static assets are served from CDN edge nodes. The interactive
            React components hydrate client-side and call serverless API
            routes that dispatch to AI providers.
          </p>
          <ArchitectureDiagramClient />
        </section>
      </main>

      <Footer />
    </>
  );
}
