"use client";

import {
  Sliders,
  ShieldCheck,
  Palette,
  Zap,
  Split,
  Layers,
} from "lucide-react";

const features = [
  {
    title: "Dynamic Rule Orchestrator",
    icon: Sliders,
    badge: "Edge Native",
    description:
      "Build deterministic routing logic based on visitor OS (iOS/Android/macOS/Windows), country code, language, and hour of the day.",
  },
  {
    title: "End-to-End Scan Journeys",
    icon: Layers,
    badge: "Visitor Stitching",
    description:
      "Track every touchpoint from initial physical QR scan through session binding, page engagement, and final conversion event.",
  },
  {
    title: "A/B Traffic Split Engine",
    icon: Split,
    badge: "Conversion Optimization",
    description:
      "Run multi-variant experiments with deterministic hash-based traffic weights to continuously find highest-converting landing pages.",
  },
  {
    title: "Dynamic QR Studio & Vector Export",
    icon: Palette,
    badge: "Custom Branding",
    description:
      "Customize QR module colors, error correction levels, and styling with instant preview. Export print-ready high-res SVG or PNG.",
  },
  {
    title: "Sub-12ms Edge FastPath",
    icon: Zap,
    badge: "Zero Latency",
    description:
      "Deterministic HTTP 307 redirects resolved directly in memory at global edge nodes with asynchronous telemetry streaming.",
  },
  {
    title: "Enterprise Multi-Tenancy & RBAC",
    icon: ShieldCheck,
    badge: "PostgreSQL & Auth",
    description:
      "Strict organization and account isolation using Better Auth and Drizzle ORM on PostgreSQL with encrypted telemetry logs.",
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Everything you need to scale dynamic QR infrastructure
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            A developer-first platform designed for low latency, reliable context-aware routing, and rich analytics.
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
