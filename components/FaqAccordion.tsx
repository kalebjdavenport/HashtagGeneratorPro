"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "What AI models does the generator use?",
    a: "Three frontier models: Anthropic\u2019s Claude Opus, OpenAI\u2019s GPT-5, and Google\u2019s Gemini. You can compare results from all three.",
  },
  {
    q: "Is my text stored or shared?",
    a: "No. Your text is sent to our secure server to call the AI API, but it\u2019s never stored, logged, or shared. Results are cached locally in your browser.",
  },
  {
    q: "Is the hashtag generator free?",
    a: "Yes, completely free with no signup, email, or paywall. API costs are covered by us.",
  },
  {
    q: "What platforms do the hashtags work on?",
    a: "Instagram, TikTok, Twitter/X, LinkedIn, YouTube, and any platform that supports hashtags.",
  },
  {
    q: "How many hashtags are generated?",
    a: "Each request generates 5\u20138 relevant hashtags, optimized for maximum reach on social media.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className="rounded-xl border border-buffer-border bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full font-semibold text-buffer-dark cursor-pointer py-3 px-4 select-none text-sm flex items-center text-left"
            >
              <span className="flex-1">{item.q}</span>
              <span
                className={`faq-chevron ml-3 flex-shrink-0 ${isOpen ? "faq-chevron-open" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              className="faq-content"
              role="region"
              aria-hidden={!isOpen}
            >
              <div>
                <p className="pb-3 px-4 text-sm text-buffer-muted leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
