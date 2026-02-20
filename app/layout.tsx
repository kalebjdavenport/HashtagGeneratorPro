import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hashtaggeneratorpro.com"),
  title: {
    default:
      "AI Hashtag Generator \u2014 Free Tool Powered by Claude, GPT-5 & Gemini",
    template: "%s | AI Hashtag Generator Pro",
  },
  description:
    "Generate relevant, high-performing hashtags from any text instantly. Compare results from Claude Opus, GPT-5, and Gemini \u2014 three cutting-edge AI models. Free, fast, no signup required.",
  keywords: [
    "hashtag generator",
    "ai hashtag generator",
    "free hashtag generator",
    "social media hashtags",
    "instagram hashtags",
    "content marketing",
    "hashtag tool",
    "ai hashtags",
    "claude opus",
    "gpt-5",
    "gemini",
  ],
  authors: [{ name: "HashtagGeneratorPro" }],
  creator: "HashtagGeneratorPro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hashtaggeneratorpro.com",
    siteName: "AI Hashtag Generator Pro",
    title:
      "AI Hashtag Generator \u2014 Free Tool Powered by Claude, GPT-5 & Gemini",
    description:
      "Paste any text and get perfectly relevant hashtags in seconds. Compare results from three top AI models. Free, no signup.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Hashtag Generator Pro \u2014 Generate hashtags with Claude, GPT-5, and Gemini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AI Hashtag Generator \u2014 Free Tool Powered by Claude, GPT-5 & Gemini",
    description:
      "Paste any text and get relevant hashtags in seconds. Compare Claude, GPT-5, and Gemini side by side.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.jpg" },
  other: { "theme-color": "#168eea" },
  alternates: {
    canonical: "https://hashtaggeneratorpro.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} bg-white text-buffer-dark min-h-screen font-sans flex flex-col`}
        suppressHydrationWarning
      >
        <a
          href="#hashtag-generator"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-buffer-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to generator
        </a>
        {children}
      </body>
    </html>
  );
}
