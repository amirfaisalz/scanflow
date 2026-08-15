"use client";

import { useState } from "react";
import {
  QrCode,
  Smartphone,
  Laptop,
  Sliders,
  Globe,
  Zap,
  CheckCircle2,
} from "lucide-react";

type DeviceType = "ios" | "android" | "desktop";

const devices: { id: DeviceType; label: string; icon: typeof Smartphone; os: string }[] = [
  { id: "ios", label: "iOS (iPhone / iPad)", icon: Smartphone, os: "iOS 18.0" },
  { id: "android", label: "Android (Pixel / Samsung)", icon: Smartphone, os: "Android 15" },
  { id: "desktop", label: "Desktop Workstation", icon: Laptop, os: "macOS / Windows" },
];

const routeResults: Record<
  DeviceType,
  { rule: string; destination: string; destinationLabel: string; edgeTime: string }
> = {
  ios: {
    rule: 'header["sec-ch-ua-platform"] == "iOS" || userAgent.includes("iPhone")',
    destination: "https://apps.apple.com/app/scanflow-pro/id647890",
    destinationLabel: "Apple App Store (iOS Native)",
    edgeTime: "9.4ms",
  },
  android: {
    rule: 'header["sec-ch-ua-platform"] == "Android" || userAgent.includes("Android")',
    destination: "https://play.google.com/store/apps/details?id=dev.scanflow.app",
    destinationLabel: "Google Play Store (Android APK)",
    edgeTime: "10.1ms",
  },
  desktop: {
    rule: "device_type === 'desktop' || fallback_default",
    destination: "https://app.scanflow.dev/portal/welcome",
    destinationLabel: "Web SaaS Application (Desktop Portal)",
    edgeTime: "8.6ms",
  },
};

export function RoutingVisualizer() {
  const [activeDevice, setActiveDevice] = useState<DeviceType>("ios");
  const result = routeResults[activeDevice];

  return (
    <section id="routing" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FA5D29]/25 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 px-3.5 py-1 text-xs font-semibold text-[#FA5D29] mb-4">
            <Sliders className="size-3.5" />
            <span>Smart Routing Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Deterministic Edge Routing in &lt; 12ms
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Eliminate friction by sending visitors to the exact app store, language variant, or promotion tailored for their device.
          </p>
        </div>

        {/* Interactive Visualizer Card */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xl">
          {/* Device Selector Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
            {devices.map((d) => {
              const Icon = d.icon;
              const isSelected = activeDevice === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDevice(d.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-[#FA5D29] text-white shadow-md shadow-[#FA5D29]/25 scale-[1.02]"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Step 1: Scan Source */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FA5D29] font-bold">STEP 01</span>
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <QrCode className="size-4 text-[#FA5D29]" />
                <span>Physical QR Scan</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-900 p-2 rounded-md">
                GET /r/launch-2026
              </div>
              <div className="text-[11px] text-zinc-500">
                Visitor scanned via {activeDevice.toUpperCase()} camera
              </div>
            </div>

            {/* Step 2: Edge Evaluation */}
            <div className="rounded-xl border border-[#FA5D29]/40 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FA5D29] font-bold">STEP 02 (EDGE)</span>
                <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-[#FA5D29]/10 px-2 py-0.5 rounded-full font-bold">
                  ⚡ {result.edgeTime}
                </span>
              </div>
              <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="size-4 text-[#FA5D29]" />
                <span>Rule Evaluator</span>
              </div>
              <div className="text-xs text-zinc-700 dark:text-zinc-300 font-mono bg-white dark:bg-zinc-950 p-2 rounded-md border border-[#FA5D29]/20 break-all">
                {result.rule}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                <span>Rule matched with high priority</span>
              </div>
            </div>

            {/* Step 3: Resolved Destination */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-500 font-bold">STEP 03 (307)</span>
                <span className="text-[11px] font-mono text-emerald-500 font-semibold">SUCCESS</span>
              </div>
              <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Globe className="size-4 text-emerald-500" />
                <span>{result.destinationLabel}</span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-md border border-emerald-500/20 truncate">
                {result.destination}
              </div>
              <div className="text-[11px] text-zinc-500">
                Visitor seamlessly redirected without landing page delay
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
