import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-3">404</h1>
      <p className="text-buffer-muted text-lg mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-block bg-buffer-blue text-white font-semibold py-3 px-6 rounded-xl hover:bg-buffer-blue-hover transition-colors"
      >
        Back to Generator
      </Link>
    </main>
  );
}
