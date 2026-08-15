"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, X, Star } from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-50 bg-fire text-white px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300">
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left / Center Announcement */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs text-white">
            <Sparkles className="size-3 text-amber-200 fill-amber-200" />
            ScanFlow v2.4
          </span>
          <span className="font-medium text-white/95">
            Turn static QR codes into programmable edge routing engines with sub-millisecond redirects.
          </span>
          <a
            href="#playground"
            className="inline-flex items-center gap-1 font-bold underline underline-offset-4 hover:text-white/80 transition-colors"
          >
            <span>Try the interactive playground</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>

        {/* Right Star pill & Close button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/20 hover:bg-black/30 px-2.5 py-1 text-xs font-medium transition-colors text-white"
          >
            <Star className="size-3 text-amber-300 fill-amber-300" />
            <span>Open Source on GitHub</span>
          </a>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md hover:bg-black/20 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
