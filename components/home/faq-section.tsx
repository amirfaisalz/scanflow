"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is a Dynamic QR Code and how does it work?",
    answer:
      "Unlike static QR codes that hardcode a permanent destination URL into the barcode matrix, ScanFlow creates a lightweight edge shortlink (`/r/:code`). When scanned, our global edge engine intercepts the request, evaluates contextual rules (OS, device, location, time), and immediately emits an HTTP 307 redirect to the desired destination in under 12 milliseconds.",
  },
  {
    question: "Can I update the destination URL after the QR code is printed on physical billboards?",
    answer:
      "Yes, 100%. Because the printed QR code points to your permanent ScanFlow edge shortlink, you can change the destination URL, modify routing rules, or launch A/B split tests at any time in the dashboard or via API without needing to reprint anything.",
  },
  {
    question: "How does device and OS-based smart routing work?",
    answer:
      "When a smartphone scans the QR code, its browser sends standard HTTP Client Hints and User-Agent headers. ScanFlow’s edge runtime inspects these in sub-millisecond memory to determine whether the device is iOS (iPhone/iPad), Android, or Desktop, routing each visitor to their native App Store or localized web portal.",
  },
  {
    question: "What kind of redirect latency can I expect?",
    answer:
      "Our edge redirects resolve in under 12ms globally. All analytical telemetry (geolocation, device category, UTM parameters) is queued and persisted asynchronously to PostgreSQL in the background, ensuring visitors never experience redirect lag.",
  },
  {
    question: "Can I connect my own custom domain (e.g. qr.mybrand.com)?",
    answer:
      "Yes! On Growth Pro and Enterprise tiers, you can bind custom domains with automatic SSL provisioning, ensuring all QR codes and shortlinks display your brand name.",
  },
  {
    question: "Is ScanFlow open source and self-hostable?",
    answer:
      "Yes. ScanFlow is built with Next.js, Drizzle ORM, Better Auth, and PostgreSQL. You can run the entire stack locally with Docker or deploy to your own cloud infrastructure.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/25 bg-fire/5 dark:bg-fire/10 px-3.5 py-1 text-xs font-semibold text-fire mb-4">
            <HelpCircle className="size-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Everything You Need to Know
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Quick answers to common questions about dynamic QR routing, edge redirects, and telemetry.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                    ? "border-fire/40 bg-zinc-50/80 dark:bg-zinc-900/70 shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-900 dark:text-white select-none"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 bg-fire/10 text-fire" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      }`}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
