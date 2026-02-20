import FaqAccordion from "./FaqAccordion";

export default function Footer() {
  return (
    <footer className="bg-buffer-light border-t border-buffer-border">
      <div className="max-w-5xl mx-auto px-5 py-14 space-y-14">
        {/* How It Works */}
        <section aria-labelledby="how-it-works">
          <h2
            id="how-it-works"
            className="text-2xl font-bold tracking-tight text-buffer-dark mb-6 text-center"
          >
            How It Works
          </h2>
          <ol className="grid sm:grid-cols-4 gap-5 max-w-3xl mx-auto">
            {[
              {
                num: "1",
                color: "from-buffer-blue to-blue-400",
                title: "Paste your text",
                desc: "Any article, blog post, caption, or social media draft.",
              },
              {
                num: "2",
                color: "from-buffer-purple to-violet-400",
                title: "Choose an AI model",
                desc: "Pick Claude Opus, GPT-5, or Gemini.",
              },
              {
                num: "3",
                color: "from-buffer-coral to-rose-400",
                title: "Get hashtags",
                desc: "The AI extracts the most relevant hashtags in seconds.",
              },
              {
                num: "4",
                color: "from-buffer-green to-emerald-400",
                title: "Copy & use",
                desc: "Click any hashtag to copy it, or grab them all at once.",
              },
            ].map((step) => (
              <li key={step.num} className="text-center">
                <span
                  className={`inline-flex w-9 h-9 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold items-center justify-center shadow-sm mb-3`}
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <div>
                  <strong className="text-buffer-dark block mb-1">{step.title}</strong>
                  <p className="text-sm text-buffer-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="max-w-2xl mx-auto min-h-[24rem]">
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight text-buffer-dark mb-6 text-center"
          >
            Frequently Asked Questions
          </h2>
          <FaqAccordion />
        </section>

        {/* Accessibility & SEO */}
        <section aria-labelledby="accessibility-heading" className="max-w-2xl mx-auto">
          <h2
            id="accessibility-heading"
            className="text-xl font-bold tracking-tight text-buffer-dark mb-4 text-center"
          >
            Built for Everyone
          </h2>
          <p className="text-sm text-buffer-muted text-center mb-5">
            This page is designed to be fast, accessible, and easy to navigate for all users.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-buffer-muted" aria-label="Accessibility features">
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">Keyboard navigable</strong> &mdash; every control reachable via Tab, arrows, and Escape</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">Screen reader friendly</strong> &mdash; ARIA roles, labels, and live regions throughout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">Skip-to-content link</strong> &mdash; jump straight to the generator with one keystroke</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">Reduced motion support</strong> &mdash; animations disabled when preferred</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">AA contrast ratios</strong> &mdash; all text meets WCAG 2.1 minimum contrast</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-buffer-blue mt-0.5" aria-hidden="true">&#10003;</span>
              <span><strong className="text-buffer-dark">Semantic HTML</strong> &mdash; proper headings, landmarks, and structured data for crawlers</span>
            </li>
          </ul>
        </section>

        <div className="pt-6 border-t border-buffer-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-buffer-muted">
          <p>
            AI Hashtag Generator Pro &mdash; Free AI-powered hashtag tool.
          </p>
          <p>
            Built with Claude Opus, GPT-5 &amp; Gemini.
          </p>
        </div>
      </div>
    </footer>
  );
}
