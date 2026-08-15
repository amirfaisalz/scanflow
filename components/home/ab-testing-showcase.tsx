"use client";

import { useState } from "react";
import {
  Split,
  Trophy,
} from "lucide-react";

export function ABTestingShowcase() {
  const [splitRatio, setSplitRatio] = useState(50);

  return (
    <section id="ab-testing" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <Split className="size-3.5" />
            <span>A/B Traffic Splitting</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            A/B Split Test Your QR Campaigns in Real Time
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Eliminate guesswork by splitting scan traffic across multiple landing page variants to double your conversion rate.
          </p>
        </div>

        {/* Interactive Split Testing Box */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl">
          {/* Slider Controls */}
          <div className="mb-8 space-y-3 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-zinc-700 dark:text-zinc-300">Traffic Distribution:</span>
              <span className="font-mono text-fire">
                Variant A: {splitRatio}% | Variant B: {100 - splitRatio}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={splitRatio}
              onChange={(e) => setSplitRatio(Number(e.target.value))}
              className="w-full accent-fire cursor-pointer"
            />
          </div>

          {/* Variant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Variant A */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-500">VARIANT A</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {splitRatio}% Traffic
                </span>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Original Landing Page
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                https://scanflow.dev/landing-v1
              </p>
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Conversion Rate:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">3.2%</span>
              </div>
            </div>

            {/* Variant B (Winner) */}
            <div className="rounded-xl border border-fire/40 bg-fire/5 dark:bg-fire/10 p-6 space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-fire">
                  <Trophy className="size-3.5 text-amber-500 fill-amber-500" />
                  <span>VARIANT B (WINNER)</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-fire text-white">
                  {100 - splitRatio}% Traffic
                </span>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Interactive Video Hero Page
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                https://scanflow.dev/landing-v2-video
              </p>
              <div className="pt-2 border-t border-fire/20 flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Conversion Rate:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  7.8% (+143% Lift)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
