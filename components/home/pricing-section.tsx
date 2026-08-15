"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Flame,
} from "lucide-react";

const tiers = [
  {
    name: "Starter Free",
    badge: "Free Forever",
    description: "For developers and indie creators getting started.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "5 dynamic QR codes",
      "2,500 scans per month",
      "Standard edge redirect (< 25ms)",
      "Basic device & OS routing rules",
      "PNG & SVG vector export",
      "Community Discord support",
    ],
    cta: "Start for Free",
    ctaVariant: "outline" as const,
    featured: false,
  },
  {
    name: "Growth Pro",
    badge: "Most Popular",
    description: "For high-converting brands, marketing teams, and growing apps.",
    monthlyPrice: 29,
    annualPrice: 23,
    features: [
      "Unlimited dynamic QR codes",
      "100,000 scans per month",
      "Sub-12ms Edge FastPath redirects",
      "Multi-variant A/B traffic split engine",
      "End-to-end visitor journey stitching",
      "Custom branding & error correction levels",
      "REST API & Webhooks access",
      "Priority email & Slack support",
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "default" as const,
    featured: true,
  },
  {
    name: "Enterprise",
    badge: "Custom SLA",
    description: "For high-volume retail, global brands, and enterprise teams.",
    monthlyPrice: -1,
    annualPrice: -1,
    features: [
      "Unlimited scans & custom rate limits",
      "Dedicated multi-region edge clusters",
      "Custom root domains (e.g. qr.brand.com)",
      "99.99% Enterprise uptime SLA",
      "Multi-team RBAC & SAML / SSO",
      "Dedicated Technical Account Manager",
      "Custom data retention policies",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    featured: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <Flame className="size-3.5 fill-fire" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Simple Plans That Scale with Your Traffic
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Start free, upgrade when you need higher scan capacity, A/B experiments, or custom domain routing.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-semibold ${!isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-fire" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
              Annual Billing
            </span>
            <span className="inline-flex items-center rounded-full bg-fire/10 text-fire border border-fire/20 px-2 py-0.5 text-[11px] font-bold">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {tiers.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-2xl transition-all duration-300 ${tier.featured
                  ? "border-2 border-fire bg-white dark:bg-zinc-900 shadow-2xl shadow-fire/10 ring-1 ring-fire -translate-y-1"
                  : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
              >
                {/* Featured Badge */}
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-fire text-white px-3 py-0.5 text-xs font-bold shadow-md">
                    <Flame className="size-3 fill-white" />
                    <span>{tier.badge}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {tier.name}
                    </h3>
                    {!tier.featured && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 min-h-9 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="my-6">
                    {price === -1 ? (
                      <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                        Custom
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold font-mono text-zinc-900 dark:text-white">
                          ${price}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">/ month</span>
                      </div>
                    )}
                    {price > 0 && isAnnual && (
                      <div className="text-[11px] text-zinc-500 font-medium mt-1">
                        Billed annually (${price * 12}/year)
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-fire shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <Link href="/register">
                    <Button
                      className={`w-full h-11 font-bold text-sm gap-2 transition-all ${tier.featured
                        ? "bg-fire hover:bg-fire-hover text-white shadow-lg shadow-fire/25 hover:scale-[1.02]"
                        : "bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700"
                        }`}
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
