export default function JsonLd() {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Hashtag Generator Pro",
    description:
      "Generate relevant hashtags from any text using three cutting-edge AI models: Claude Opus, GPT-5, and Gemini. Free, fast, no signup required.",
    url: "https://hashtag-generator-pro.vercel.app/",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires a modern web browser",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AI models does the hashtag generator use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The AI Hashtag Generator Pro uses three frontier AI models: Anthropic's Claude Opus, OpenAI's GPT-5, and Google's Gemini. You can compare results from all three to find the best hashtags for your content.",
        },
      },
      {
        "@type": "Question",
        name: "Is the AI hashtag generator free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The AI Hashtag Generator Pro is completely free with no signup, email, or paywall required. API costs are covered by us.",
        },
      },
      {
        "@type": "Question",
        name: "Is my text stored or shared when generating hashtags?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your text is sent to our secure server to generate hashtags via AI APIs, but it is never stored, logged, or shared with third parties. Results are cached locally in your browser for faster repeat lookups.",
        },
      },
      {
        "@type": "Question",
        name: "What platforms can I use the generated hashtags on?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The generated hashtags work on any platform including Instagram, TikTok, Twitter/X, LinkedIn, YouTube, and blog posts. The AI extracts topic-relevant keywords that work across social media.",
        },
      },
      {
        "@type": "Question",
        name: "How many hashtags does the generator create?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The generator produces 5 to 8 relevant hashtags per request, optimized for the ideal number recommended by social media platforms for maximum reach.",
        },
      },
    ],
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Generate AI-Powered Hashtags",
    description:
      "Use cutting-edge AI models to generate relevant hashtags from any text in seconds.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your text",
        text: "Copy and paste any article, blog post, caption, or text into the input field. The more text you provide, the better the results.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose an AI model",
        text: "Select from three AI models: Claude Opus, GPT-5, or Gemini. Each model has unique strengths for hashtag generation.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Generate hashtags",
        text: "Click Generate Hashtags and the AI will analyze your text and extract the most relevant topic hashtags in seconds.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Copy and use",
        text: "Click any individual hashtag to copy it, or use Copy All to grab them all at once for pasting into your social media post.",
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hashtag-generator-pro.vercel.app/",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
