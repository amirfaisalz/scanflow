"use client";

import { Star, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "VP of Growth at LuxRetail",
    content:
      "ScanFlow completely transformed our physical billboard campaigns. Routing iOS users to the App Store and Android users to Google Play directly reduced our drop-off by 38% on day one.",
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "Lead Platform Engineer at HyperScale",
    content:
      "The sub-12ms edge redirect latency is unmatched. We replaced our brittle in-house Nginx rewrite logic with ScanFlow’s API in 30 minutes, gaining end-to-end journey telemetry.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Brody",
    role: "Head of Marketing at FoodPulse",
    content:
      "Being able to A/B test restaurant table QR codes between our native ordering app and mobile web menu gave us a 4.8x lift in repeat customer loyalty enrollments.",
    rating: 5,
    avatar: "MB",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <Sparkles className="size-3.5" />
            <span>Wall of Love</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Loved by Fast-Growing Teams Worldwide
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            See how engineering and marketing leaders use ScanFlow to turn physical scans into revenue.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col justify-between space-y-4 hover:border-fire/40 hover:shadow-xl hover:shadow-fire/5 transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-500" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                <div className="size-10 rounded-full bg-fire/10 text-fire font-bold flex items-center justify-center text-xs">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
