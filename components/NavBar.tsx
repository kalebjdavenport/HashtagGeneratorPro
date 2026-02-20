"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#hashtag-generator", label: "Generator" },
  { href: "#use-cases-heading", label: "Use Cases" },
  { href: "#architecture", label: "Architecture" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq-heading", label: "FAQ" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  function handleLinkClick() {
    setIsOpen(false);
  }

  return (
    <header className="border-b border-buffer-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <nav
        className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between"
        aria-label="Primary"
      >
        <a
          href="/"
          className="text-buffer-dark font-bold text-base tracking-tight flex items-center gap-1.5"
        >
          <Image
            src="/icon-192.png"
            alt=""
            width={24}
            height={24}
            className="rounded-md"
          />
          HashtagGeneratorPro
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 text-sm" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-2.5 py-1.5 rounded-md text-buffer-muted hover:text-buffer-dark hover:bg-buffer-light transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          ref={buttonRef}
          type="button"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-buffer-muted hover:text-buffer-dark hover:bg-buffer-light transition-colors"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[grid-template-rows] duration-200 ease-out grid ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        role="region"
        aria-label="Mobile navigation"
        inert={!isOpen || undefined}
      >
        <div className="overflow-hidden">
          <ul className="px-5 pb-4 pt-1 space-y-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-buffer-muted hover:text-buffer-dark hover:bg-buffer-light transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
