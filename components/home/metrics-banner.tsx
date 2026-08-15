"use client";

import { ShieldCheck, Zap, Activity, TrendingUp } from "lucide-react";

const metrics = [
  {
    value: "< 12ms",
    label: "Global Edge Latency",
    sublabel: "Sub-millisecond rule resolution",
    icon: Zap,
    color: "text-[#FA5D29]",
    badge: "307 Edge FastPath",
  },
  {
    value: "99.99%",
    label: "Enterprise Uptime SLA",
    sublabel: "Multi-region fallback cluster",
    icon: ShieldCheck,
    color: "text-emerald-500",
    badge: "Zero Downtime",
  },
  {
    value: "50M+",
    label: "Scans Dispatched",
    sublabel: "Real-time analytical telemetry",
    icon: Activity,
    color: "text-amber-500",
    badge: "+120% YoY",
  },
  {
    value: "4.8x",
    label: "Average Conversion Lift",
    sublabel: "Context-aware dynamic routing",
    icon: TrendingUp,
    color: "text-rose-500",
    badge: "A/B Proven",
  },
];

export function MetricsBanner() {
  return (
    <section id="metrics" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-12 sm:py-16 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="group relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-[#FA5D29]/40 hover:shadow-xl hover:shadow-[#FA5D29]/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Top Row: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className={`size-5 ${m.color}`} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
                    {m.badge}
                  </span>
                </div>

                {/* Metric Value */}
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-1 font-mono">
                  {m.value}
                </div>

                {/* Metric Label */}
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {m.label}
                </div>

                {/* Subtitle */}
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {m.sublabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
