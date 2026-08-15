"use client";

import { Check, X, Flame } from "lucide-react";

const comparisonRows = [
  {
    feature: "Update Destination After Physical Print",
    static: false,
    bitly: true,
    scanflow: true,
  },
  {
    feature: "Context-Aware OS & Device Routing (iOS/Android)",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "Sub-12ms Global Edge Redirect Engine",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "End-to-End Scan-to-Conversion Journey Stitching",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "Hash-Based Multi-Variant A/B Split Testing",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "Custom QR Palette Studio & Vector SVG Export",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "Enterprise Multi-Tenancy & Drizzle PostgreSQL Schema",
    static: false,
    bitly: false,
    scanflow: true,
  },
  {
    feature: "Developer SDKs in TypeScript, Python & Go",
    static: false,
    bitly: false,
    scanflow: true,
  },
];

export function ComparisonMatrix() {
  return (
    <section id="comparison" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FA5D29]/25 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 px-3.5 py-1 text-xs font-semibold text-[#FA5D29] mb-4">
            <span>Why Developers Choose ScanFlow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Engineered for High-Performance Growth
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            See how ScanFlow compares to legacy link shorteners and static QR tools.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto max-w-5xl overflow-x-auto code-scroll pb-2">
          <table className="w-full min-w-[580px] text-left border-collapse rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xl">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="p-4 sm:p-5 text-sm font-bold text-zinc-900 dark:text-white">
                  Capability / Feature
                </th>
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-semibold text-zinc-500 text-center">
                  Static QR Codes
                </th>
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-semibold text-zinc-500 text-center">
                  Legacy Shortlinks
                </th>
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold text-[#FA5D29] bg-[#FA5D29]/10 text-center rounded-t-xl border-x border-[#FA5D29]/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <Flame className="size-4 fill-[#FA5D29]" />
                    <span>ScanFlow</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-zinc-50/40 dark:bg-zinc-900/30"
                    }`}
                >
                  <td className="p-4 sm:p-5 font-medium text-zinc-800 dark:text-zinc-200">
                    {row.feature}
                  </td>
                  <td className="p-4 sm:p-5 text-center text-zinc-400">
                    {row.static ? (
                      <Check className="size-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="size-5 text-zinc-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center text-zinc-400">
                    {row.bitly ? (
                      <Check className="size-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="size-5 text-zinc-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center bg-[#FA5D29]/5 border-x border-[#FA5D29]/20 font-bold text-zinc-900 dark:text-white">
                    <div className="flex items-center justify-center text-[#FA5D29]">
                      <Check className="size-5 stroke-[2.5]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
