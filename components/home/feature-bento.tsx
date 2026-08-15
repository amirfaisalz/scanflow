"use client";

import {
  Sliders,
  ShieldCheck,
  Palette,
  Zap,
  Split,
  Layers,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Zero-Friction OS Routing",
    icon: Sliders,
    badge: "Edge Native",
    description:
      "Direct iOS users to the App Store, Android to Google Play, and desktop to your web app with zero manual intervention.",
  },
  {
    title: "Full-Funnel Scan Attribution",
    icon: Layers,
    badge: "Lifecycle Tracking",
    description:
      "Track the complete customer journey from initial physical QR scan through session identity binding and completed checkout.",
  },
  {
    title: "Automated A/B Split Testing",
    icon: Split,
    badge: "Conversion Boost",
    description:
      "Distribute incoming scan traffic across multiple landing page variants with deterministic hash splits to find winning offers.",
  },
  {
    title: "Custom Vector QR Studio",
    icon: Palette,
    badge: "Brand Ready",
    description:
      "Customize brand colors, error correction levels, and styling with real-time preview. Export print-ready crisp SVG or PNG files.",
  },
  {
    title: "Sub-12ms Instant Edge Redirects",
    icon: Zap,
    badge: "Zero Lag",
    description:
      "Deterministic HTTP 307 redirects resolved directly in memory at global edge nodes with non-blocking background telemetry.",
  },
  {
    title: "Enterprise Multi-Tenancy & Security",
    icon: ShieldCheck,
    badge: "PostgreSQL & Auth",
    description:
      "Strict organization workspaces and role-based access control with Better Auth and Drizzle ORM on PostgreSQL.",
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <Sparkles className="size-3.5 text-fire" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Everything You Need to Maximize Every Single QR Scan
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            A high-performance dynamic QR engine built for zero latency, bulletproof routing, and verified revenue attribution.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-fire/40 hover:shadow-xl hover:shadow-fire/5 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-fire flex items-center justify-center group-hover:bg-fire/10 transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white mb-2 group-hover:text-fire transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
