"use client";

import {
  Activity,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Download,
  Flame,
  Globe,
  Laptop,
  Layers,
  QrCode,
  RotateCw,
  Sliders,
  Smartphone,
  Split,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroPlaygroundProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

type ModeType = "routing" | "ab" | "customizer" | "journey" | "analytics";
type OutputView = "trace" | "json" | "code";

const PRESET_CAMPAIGNS = [
  {
    label: "📱 App Launch (iOS/Android)",
    mode: "routing" as ModeType,
    url: "https://scanflow.dev/r/mobile-app",
  },
  {
    label: "🌍 Global Geo-Redirect",
    mode: "routing" as ModeType,
    url: "https://scanflow.dev/r/global-sale",
  },
  {
    label: "🧪 50/50 A/B Test",
    mode: "ab" as ModeType,
    url: "https://scanflow.dev/r/pricing-v2",
  },
  {
    label: "☕ Restaurant Menu (Hour-based)",
    mode: "routing" as ModeType,
    url: "https://scanflow.dev/r/bistro-menu",
  },
];

export function HeroPlayground({}: HeroPlaygroundProps = {}) {
  const [activeMode, setActiveMode] = useState<ModeType>("routing");
  const [targetUrl, setTargetUrl] = useState(
    "https://scanflow.dev/r/mobile-app",
  );
  const [outputView, setOutputView] = useState<OutputView>("trace");
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [executionTime, setExecutionTime] = useState(11);
  const [selectedDevice, setSelectedDevice] = useState<
    "ios" | "android" | "desktop"
  >("ios");
  const [selectedCountry] = useState("US");

  // QR Customizer States
  const [qrColor, setQrColor] = useState("#09090b");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [traceTimestamp, setTraceTimestamp] = useState("2026-08-15T12:00:00.000Z");

  // Generate real QR code when URL or color changes
  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(
          targetUrl || "https://scanflow.dev",
          {
            width: 260,
            margin: 1.5,
            color: {
              dark: qrColor,
              light: "#ffffff",
            },
            errorCorrectionLevel: "M",
          },
        );
        if (isMounted) setQrDataUrl(url);
      } catch {
        // fallback
      }
    };
    generate();
    return () => {
      isMounted = false;
    };
  }, [targetUrl, qrColor]);
  const copyOutput = () => {
    navigator.clipboard.writeText(getOutputContent());
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleSimulateScan = (
    device: "ios" | "android" | "desktop" = selectedDevice,
  ) => {
    setSelectedDevice(device);
    setIsLoading(true);
    setLoadingStep("1/3 Dispatching to Edge Node (SFO-1)...");

    setTimeout(() => {
      setLoadingStep("2/3 Evaluating context & matching prioritized rules...");
    }, 350);

    setTimeout(() => {
      setLoadingStep(
        "3/3 Deterministic rule matched. Emitting HTTP 307 & async telemetry...",
      );
    }, 700);

    setTimeout(() => {
      setIsLoading(false);
      setLoadingStep("");
      setExecutionTime(Math.floor(Math.random() * 4 + 9));
      setTraceTimestamp(new Date().toISOString());
    }, 1050);
  };

  // Generate realistic output based on mode & device
  const getTraceOutput = () => {
    if (activeMode === "ab") {
      return `[SCANFLOW EDGE ROUTING ENGINE - A/B TRAFFIC SPLIT]
-------------------------------------------------------------
Edge Region:   iad1 (Ashburn, VA, US)
Incoming Path: GET /r/pricing-v2
Timestamp:     ${traceTimestamp}
Status:        HTTP 307 Temporary Redirect (11.2ms)
Distribution:  Weighted 50:50 Hash Split

[VISITOR CONTEXT]
├── IP Address:   198.51.100.42 (Hashed: sha256:8f4b2...)
├── User-Agent:   Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15
├── Device Type:  Mobile Phone
├── Geo Location: ${selectedCountry}, North America
└── Session ID:   sess_9a82f1b4c802

[SPLIT TEST EVALUATION]
├── Experiment:   "Summer Pricing Page Split Test" (Equal Weight Hash Bucket)
├── Hashing Seed: sha256(sess_9a82f1b4c802 + experiment_salt)
├── Target Bucket: Variant B (Annual Discount Focus)
└── Destination:  https://scanflow.dev/pricing-b?utm_variant=B&utm_qr=pricing-v2

[ASYNC TELEMETRY DISPATCHED]
└── Event ID: evt_6619e0b82f (Stored to analytical warehouse with 0ms latency impact)`;
    }

    if (activeMode === "journey") {
      return `[SCANFLOW VISITOR JOURNEY STITCHING TRACE]
-------------------------------------------------------------
Visitor ID:   usr_8829f0a2
Device:       ${selectedDevice.toUpperCase()} (${selectedCountry})
Total Touchpoints: 4 interactions stitched across 14 minutes

[TIMELINE TRACE]
14:10:02 🟢 [1. PHYSICAL SCAN]
   └── QR Code: "Billboard West Coast #04" (/r/summer-promo)
   └── Edge Node: sfo1 (San Francisco) • Latency: 9.8ms
   └── Resolved: https://scanflow.dev/app/download?ref=billboard_la

14:10:18 📱 [2. APP STORE LANDING]
   └── App Store Redirect confirmed via deep-link fallback

14:18:42 🚀 [3. IN-APP SESSION BINDING]
   └── SDK Telemetry: Anonymous scan linked to Registered User "sarah@acme.com"

14:24:11 🎯 [4. CONVERSION EVENT TRIGGERED]
   └── Completed: "Pro Annual Plan Checkout ($288.00)"
   └── Campaign Attribution: "West Coast Billboard Q3" (100% Attribution Weight)`;
    }

    if (activeMode === "analytics") {
      return `[SCANFLOW REAL-TIME TELEMETRY SNAPSHOT]
-------------------------------------------------------------
Campaign:    "Global Multi-Channel Launch"
Active QRs:  12 Codes | Total Scans Today: 48,290 | Lift: +4.8x

[DEVICE BREAKDOWN]
├── iOS / iPhone:       64.2% (31,002 scans)
├── Android / Pixel:    29.4% (14,197 scans)
└── Desktop / macOS:     6.4% (3,091 scans)

[TOP GEO REGIONS]
├── 🇺🇸 United States:    42.1% (20,330)
├── 🇩🇪 Germany:          18.6% (8,981)
├── 🇬🇧 United Kingdom:   15.2% (7,340)
├── 🇯🇵 Japan:            12.8% (6,181)
└── 🌍 Others:           11.3% (5,458)

[EDGE PERFORMANCE METRICS]
├── P50 Redirect Latency: 9.2ms
├── P95 Redirect Latency: 14.1ms
├── P99 Redirect Latency: 18.6ms
└── Uptime SLA: 100.00% (Zero dropped scan packets)`;
    }

    // Default Smart Routing Trace
    const destination =
      selectedDevice === "ios"
        ? "https://apps.apple.com/app/scanflow"
        : selectedDevice === "android"
          ? "https://play.google.com/store/apps/details?id=scanflow"
          : "https://app.scanflow.dev/desktop-dashboard";

    return `[SCANFLOW DETERMINISTIC ROUTING ENGINE]
-------------------------------------------------------------
Edge Region:   sfo1 (San Francisco, CA, US)
Incoming Path: GET ${targetUrl.replace("https://scanflow.dev", "")}
Timestamp:     ${traceTimestamp}
Status:        HTTP 307 Temporary Redirect (${executionTime}ms)

[REAL-TIME SCAN RESOLUTION]
├── Edge Routing Decision: Deterministic priority rules applied
├── Detected OS:     ${selectedDevice.toUpperCase()}
├── Device Category: ${selectedDevice === "desktop" ? "Desktop Workstation" : "Mobile Smartphone"}
├── Geo Location:    ${selectedCountry} (Matched via MaxMind GeoIP2 Edge Cache)
└── Headers:         sec-ch-ua-platform="${selectedDevice}", accept-language="en-US"

[RULE MATCHING PIPELINE]
├── Rule #1: [OS == "iOS"]       -> ${selectedDevice === "ios" ? "MATCHED (Priority 1)" : "Skipped"}
├── Rule #2: [OS == "Android"]   -> ${selectedDevice === "android" ? "MATCHED (Priority 2)" : "Skipped"}
└── Fallback: Default Web URL    -> ${selectedDevice === "desktop" ? "APPLIED (No Mobile Match)" : "Skipped"}

[FINAL DISPATCH DESTINATION]
==> ${destination}

[EDGE TELEMETRY]
└── Async Event Emitted: evt_8192a0 (Database write scheduled with 0ms edge redirect penalty)`;
  };

  const getJsonOutput = () => {
    return JSON.stringify(
      {
        status: 307,
        statusText: "Temporary Redirect",
        edge_region: "sfo1",
        execution_time_ms: executionTime,
        visitor: {
          device: selectedDevice,
          country: selectedCountry,
          session_id: "sess_4829fa01",
          ip_hash: "sha256:d82e817...",
        },
        matched_rule: {
          id: `rule_${selectedDevice}`,
          condition: `os_platform === "${selectedDevice.toUpperCase()}"`,
          priority: 1,
        },
        redirect_url:
          selectedDevice === "ios"
            ? "https://apps.apple.com/app/scanflow"
            : selectedDevice === "android"
              ? "https://play.google.com/store/apps/details?id=scanflow"
              : "https://app.scanflow.dev/desktop",
        telemetry: {
          async_persisted: true,
          campaign: "Mobile Launch",
          conversion_funnel: "active",
        },
      },
      null,
      2,
    );
  };

  const getSdkCode = () => {
    return `// ScanFlow Edge API - Generate Dynamic QR Programmatically
import { ScanFlow } from '@scanflow/sdk';

const scanflow = new ScanFlow({
  apiKey: process.env.SCANFLOW_API_KEY || 'sf_live_abc123'
});

async function main() {
  const qr = await scanflow.qr.create({
    name: 'Smart Multi-Platform Campaign',
    slug: '${targetUrl.split("/").pop() || "my-qr"}',
    fallbackUrl: 'https://scanflow.dev',
    rules: [
      {
        priority: 1,
        condition: { os: 'ios' },
        destination: 'https://apps.apple.com/app/scanflow'
      },
      {
        priority: 2,
        condition: { os: 'android' },
        destination: 'https://play.google.com/store/apps/details?id=scanflow'
      }
    ],
    customization: {
      darkColor: '${qrColor}',
      errorCorrection: 'M',
      format: 'svg'
    }
  });

  console.log("Edge Redirect URL:", qr.shortUrl);
  console.log("SVG Image Data:", qr.qrCodeSvg);
}

main();`;
  };

  const getOutputContent = () => {
    if (outputView === "json") return getJsonOutput();
    if (outputView === "code") return getSdkCode();
    return getTraceOutput();
  };

  const colorPalette = [
    { name: "Obsidian", value: "#09090b", bg: "bg-zinc-900" },
    { name: "Fiery Orange", value: "#FA5D29", bg: "bg-[#FA5D29]" },
    { name: "Indigo Tech", value: "#4f46e5", bg: "bg-indigo-600" },
    { name: "Emerald Pro", value: "#059669", bg: "bg-emerald-600" },
  ];

  return (
    <section
      id="playground"
      className="relative pt-8 pb-20 sm:pt-14 sm:pb-28 overflow-hidden bg-dot-pattern"
    >
      {/* Background ambient fiery glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[1000px] h-[400px] bg-gradient-to-b from-[#FA5D29]/15 via-[#FA5D29]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Hero Text */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto mb-12 sm:mb-16">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FA5D29]/25 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#FA5D29] shadow-xs backdrop-blur-sm hover:border-[#FA5D29]/40 transition-colors">
            <span className="flex size-2 rounded-full bg-[#FA5D29] animate-ping" />
            <span>The Programmable QR &amp; Traffic Routing Engine</span>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
              Live QR Engine
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.18] sm:leading-[1.14] text-balance pb-1">
            Turn static QR codes into{" "}
            <span className="relative inline-block pt-0.5 pb-1.5 sm:pb-2.5 text-transparent bg-clip-text bg-gradient-to-r from-[#FA5D29] via-[#FF6B35] to-[#E04818]">
              programmable entry points
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal mt-4 sm:mt-5">
            Route scans dynamically by device OS, geo-location, and time of day.
            Track sub-millisecond edge redirects, visitor journeys, and
            multi-variant A/B experiments with a single platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-base font-semibold bg-[#FA5D29] hover:bg-[#E04818] text-white shadow-lg shadow-[#FA5D29]/25 hover:shadow-xl hover:shadow-[#FA5D29]/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
              >
                <span>Start Building Free</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#routing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-6 text-base font-medium border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all gap-2"
              >
                <Code2 className="size-4 text-[#FA5D29]" />
                <span>Explore Smart Routing</span>
              </Button>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE SIGNATURE FIRECRAWL-STYLE INTERACTIVE SCANFLOW PLAYGROUND */}
        {/* ========================================================================= */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-300">
          {/* Top Bar - Modes & Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                {
                  id: "routing" as ModeType,
                  label: "Smart Routing",
                  icon: Sliders,
                },
                { id: "ab" as ModeType, label: "A/B Split", icon: Split },
                {
                  id: "customizer" as ModeType,
                  label: "QR Studio",
                  icon: QrCode,
                },
                {
                  id: "journey" as ModeType,
                  label: "Visitor Journey",
                  icon: Layers,
                },
                {
                  id: "analytics" as ModeType,
                  label: "Telemetry",
                  icon: Activity,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                      ? "bg-[#FA5D29] text-white shadow-sm shadow-[#FA5D29]/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                      }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Edge Node Status */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Node: Active (sfo1)</span>
            </div>
          </div>

          {/* Interactive URL & Context Input Bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                  <Globe className="size-4" />
                </div>
                <Input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="Enter target URL or campaign slug..."
                  className="pl-9 h-11 text-sm font-mono bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-700 focus-visible:ring-[#FA5D29]"
                />
              </div>
              <Button
                type="button"
                onClick={() => handleSimulateScan(selectedDevice)}
                disabled={isLoading}
                className="h-11 px-6 font-semibold bg-[#FA5D29] hover:bg-[#E04818] text-white shadow-md shadow-[#FA5D29]/20 transition-all gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="size-4 animate-spin" />
                    <span>Resolving Edge...</span>
                  </>
                ) : (
                  <>
                    <Flame className="size-4 fill-white" />
                    <span>Simulate Scan</span>
                  </>
                )}
              </Button>
            </div>

            {/* URL / Campaign Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Presets:
              </span>
              {PRESET_CAMPAIGNS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTargetUrl(preset.url);
                    setActiveMode(preset.mode);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${targetUrl === preset.url
                    ? "border-[#FA5D29]/40 bg-[#FA5D29]/10 text-[#FA5D29] font-medium"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* If A/B mode is selected, show split pill indicator */}
            {activeMode === "ab" && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#FA5D29] bg-[#FA5D29]/10 p-2 rounded-lg border border-[#FA5D29]/20">
                <Split className="size-3.5" />
                <span className="font-semibold">
                  50% / 50% Traffic Allocation Active
                </span>
              </div>
            )}

            {/* Interactive Visitor Context Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-900">
              {/* Simulate Device Selector */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Simulate Device:</span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSimulateScan("ios")}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${selectedDevice === "ios"
                      ? "bg-[#FA5D29] text-white font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                  >
                    <Smartphone className="size-3" />
                    <span>iOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateScan("android")}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${selectedDevice === "android"
                      ? "bg-[#FA5D29] text-white font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                  >
                    <Smartphone className="size-3" />
                    <span>Android</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateScan("desktop")}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${selectedDevice === "desktop"
                      ? "bg-[#FA5D29] text-white font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                  >
                    <Laptop className="size-3" />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              {/* QR Color Pickers */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">QR Theme:</span>
                <div className="flex items-center gap-1.5">
                  {colorPalette.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setQrColor(c.value)}
                      className={`size-5 rounded-full ${c.bg} transition-transform ${qrColor === c.value
                        ? "ring-2 ring-[#FA5D29] ring-offset-2 scale-110"
                        : "hover:scale-105 opacity-80"
                        }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Split Grid: Live QR on Left + Terminal Trace on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-[#0D0E11] text-zinc-100 font-mono text-xs">
            {/* Left QR Visual Card */}
            <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-[#121316]/50 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative p-3 bg-white rounded-xl shadow-lg border border-zinc-200">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Live Generated QR Code"
                    className="size-40 sm:size-44 object-contain rounded-md"
                  />
                ) : (
                  <div className="size-40 sm:size-44 flex items-center justify-center">
                    <RotateCw className="size-6 animate-spin text-zinc-400" />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#FA5D29] text-white shadow-sm">
                  <Flame className="size-3.5 fill-white" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-zinc-200 text-xs flex items-center justify-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span>Dynamic Edge Endpoint</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono break-all max-w-[200px]">
                  {targetUrl}
                </div>
              </div>

              {/* Download / Share */}
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download="scanflow-qr.png"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FA5D29] hover:text-[#FF8C42] transition-colors font-sans font-medium"
                >
                  <Download className="size-3.5" />
                  <span>Download High-Res PNG</span>
                </a>
              )}
            </div>

            {/* Right Output Terminal */}
            <div className="md:col-span-8 flex flex-col">
              {/* Terminal Header */}
              <div className="border-b border-zinc-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-[#121316]">
                {/* Left View Switcher */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="flex items-center rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setOutputView("trace")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${outputView === "trace"
                        ? "bg-[#FA5D29] text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                      ⚡ Edge Trace
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputView("json")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${outputView === "json"
                        ? "bg-[#FA5D29] text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                      🧩 JSON Telemetry
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputView("code")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${outputView === "code"
                        ? "bg-[#FA5D29] text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                      💻 SDK Code
                    </button>
                  </div>
                </div>

                {/* Right Status & Copy */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="hidden sm:flex items-center gap-2 text-zinc-400">
                    <span className="text-emerald-400 font-semibold">
                      307 Redirect
                    </span>
                    <span>•</span>
                    <span>⚡ {executionTime}.2ms</span>
                    <span>•</span>
                    <span className="text-amber-300 font-medium">
                      Deterministic
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyOutput}
                    className="flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-zinc-300 hover:text-white transition-colors"
                  >
                    {copiedOutput ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="relative p-4 sm:p-5 min-h-[300px] max-h-[380px] overflow-y-auto code-scroll leading-relaxed">
                {isLoading ? (
                  <div className="absolute inset-0 bg-[#0D0E11]/90 flex flex-col items-center justify-center space-y-4 z-10">
                    <div className="relative flex size-12 items-center justify-center rounded-xl bg-[#FA5D29]/20 text-[#FA5D29]">
                      <Flame className="size-6 animate-pulse" />
                      <span className="absolute inset-0 rounded-xl border border-[#FA5D29] animate-ping opacity-30" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-white">
                        {loadingStep}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        Real-time Scan Resolution &amp; Edge Routing Decision
                      </p>
                    </div>
                  </div>
                ) : (
                  <pre className="text-zinc-200 text-xs sm:text-[13px] font-mono whitespace-pre-wrap selection:bg-[#FA5D29]/30">
                    {getOutputContent()}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
