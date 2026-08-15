"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function CtaBanner() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-950 text-white">
      {/* Fiery ambient background light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 sm:w-175 h-150 bg-linear-to-r from-fire/30 via-[#FF6B35]/20 to-fire-hover/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center relative">
        {/* Top Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-fire/40 bg-fire/20 px-4 py-1.5 text-xs font-semibold text-[#FF8C42] mb-6 shadow-sm">
          <Sparkles className="size-3.5 text-[#FF8C42]" />
          <span>Start Scaling Your Conversions</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance leading-tight">
          Ready to Turn Every QR Code into a High-Converting Engine?
        </h2>

        {/* Subtitle */}
        <p className="text-zinc-300 mt-4 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Launch your first dynamic campaign in 60 seconds. Route intelligently, A/B test with ease, and track full-funnel ROI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-fire hover:bg-fire-hover text-white shadow-xl shadow-fire/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
            >
              <span>Create Your First Dynamic QR</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a href="#playground" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-medium border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              Try the Live Sandbox
            </Button>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs sm:text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-fire" />
            <span>Free forever tier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-fire" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-fire" />
            <span>Sub-12ms global edge redirects</span>
          </div>
        </div>
      </div>
    </section>
  );
}
