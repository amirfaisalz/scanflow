"use client";

import { useState } from "react";
import {
  Layers,
  QrCode,
  Smartphone,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

const journeySteps = [
  {
    step: 1,
    time: "14:10:02",
    title: "1. Physical Scan Event",
    desc: "Visitor scans physical QR code on retail poster. Handled at local edge node in 9.8ms.",
    icon: QrCode,
    badge: "Edge 307",
    color: "border-[#FA5D29] text-[#FA5D29] bg-[#FA5D29]/10",
  },
  {
    step: 2,
    time: "14:10:14",
    title: "2. Contextual Routing & Landing",
    desc: "Deterministic rule matches iOS user agent and redirects to localized checkout page.",
    icon: Smartphone,
    badge: "iOS Matched",
    color: "border-blue-500 text-blue-500 bg-blue-500/10",
  },
  {
    step: 3,
    time: "14:18:30",
    title: "3. Session & User Binding",
    desc: "Anonymous scan session stitched to user account when visitor signs in via Better Auth.",
    icon: UserCheck,
    badge: "Identity Bound",
    color: "border-purple-500 text-purple-500 bg-purple-500/10",
  },
  {
    step: 4,
    time: "14:24:45",
    title: "4. Conversion Attribution",
    desc: "Visitor completes purchase ($129.00). ScanFlow attributes 100% campaign ROI to original QR scan.",
    icon: ShoppingBag,
    badge: "Conversion Won",
    color: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
  },
];

export function JourneyVisualizer() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="journeys" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FA5D29]/25 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 px-3.5 py-1 text-xs font-semibold text-[#FA5D29] mb-4">
            <Layers className="size-3.5" />
            <span>Visitor Journey Analytics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Stitch Physical Scans to Digital Conversions
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Stop losing visibility once a visitor scans. Track the entire lifecycle from initial offline scan to completed checkout.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {journeySteps.map((step) => {
            const Icon = step.icon;
            const isSelected = activeStep === step.step;
            return (
              <div
                key={step.step}
                onClick={() => setActiveStep(step.step)}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-[#FA5D29] bg-white dark:bg-zinc-900 shadow-xl shadow-[#FA5D29]/10 ring-1 ring-[#FA5D29]"
                    : "border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Step Top */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${step.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {step.time}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-[#FA5D29] mb-1">
                  {step.badge}
                </div>

                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
