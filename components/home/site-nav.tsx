"use client";

import {
  ArrowRight,
  LayoutDashboard,
  Menu,
  QrCode,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SiteNavProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export function SiteNav({ user }: SiteNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Routing", href: "#routing" },
    { name: "Journey", href: "#journeys" },
    { name: "A/B Testing", href: "#ab-testing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-zinc-950/60 transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold tracking-tight"
          >
            {/* Custom Fiery Gradient QR Logo Emblem */}
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-fire via-[#FF6A3D] to-fire-hover text-white shadow-md shadow-fire/25 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-fire/35">
              <QrCode className="size-5 text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-fire/30 blur-xs -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                ScanFlow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* GitHub Star Pill */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Star className="size-3.5 text-amber-500 fill-amber-500" />
            <span>GitHub</span>
            <span className="ml-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              v2.4
            </span>
          </a>

          {user ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="font-medium gap-1.5 bg-fire hover:bg-fire-hover text-white shadow-sm shadow-fire/20"
              >
                <LayoutDashboard className="size-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="font-semibold gap-1.5 bg-fire hover:bg-fire-hover text-white shadow-md shadow-fire/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-4"
                >
                  <span>Get Started</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            {!user ? (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center gap-1.5 bg-fire hover:bg-fire-hover text-white">
                    Start for Free
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-1.5 bg-fire hover:bg-fire-hover text-white">
                  <LayoutDashboard className="size-4" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
