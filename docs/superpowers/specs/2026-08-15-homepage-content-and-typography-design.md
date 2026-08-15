# Homepage Content, Conversion Copy & Typography Design Spec

- **Date**: 2026-08-15
- **Status**: Approved
- **Target Topic**: Homepage Copywriting, Conversion Rate Optimization (CRO), Font Size Hierarchy & Semantic Icon Polish

---

## 1. Objectives & Overview

The goal is to elevate the ScanFlow landing page to achieve maximum conversion rates (CRO), improve legibility and typographic rhythm, and modernize icons across all components.

### Core Problems Addressed:
1. **Developer-heavy copy**: Former copy emphasized internal mechanisms over business outcomes. The updated copy leads with high-converting benefits ("Never send users to a broken link", "Change destinations anytime without reprinting", "Route by iOS vs Android in <12ms").
2. **Font Size & Readability**: Several cards and telemetry blocks used `text-xs` (12px) for primary descriptive text. Upgrading body text to `text-sm` (14px) and adjusting mobile hero typography scales improves accessibility and scanability.
3. **Literal Fire Icon Overuse**: Replace literal `Flame` icons with semantic product icons (`Zap` for fast edge execution, `Download` for vector asset export, `Activity`/`Cpu` for real-time telemetry, `Sparkles` for smart features/badges, `TrendingUp` for ROI).

---

## 2. Section-by-Section Specification

### 2.1 Site Navigation ([`components/home/site-nav.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/site-nav.tsx))
- **Brand Emblem**: Retain the vibrant gradient QR icon emblem.
- **CTA Button**: Change label from generic "Get Started" to `"Create Free QR"` with `<ArrowRight className="size-3.5" />` to trigger immediate action.
- **Font Sizes**: Navigation items `text-sm font-medium`, brand logo `text-xl font-extrabold`.

---

### 2.2 Hero Playground ([`components/home/hero-playground.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/hero-playground.tsx))
- **Top Pill**:
  - Icon: `<Sparkles className="size-3.5 text-fire" />`
  - Text: `The Intelligent Dynamic QR & Traffic Routing Platform` | `Live Sandbox`
- **Hero Title**:
  - Copy:
    ```tsx
    <h1 className="text-3.5xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12] text-balance pb-1">
      Smart QR codes that{" "}
      <span className="relative inline-block pt-0.5 pb-1.5 sm:pb-2.5 text-transparent bg-clip-text bg-linear-to-r from-fire via-[#FF6B35] to-fire-hover">
        route, test, and convert.
      </span>
    </h1>
    ```
- **Hero Subtitle**:
  - Copy: `"Direct visitors dynamically by device (iOS vs Android), location, and time. Change destinations anytime without reprinting, A/B test landing pages, and track full-funnel scan ROI in sub-12ms."`
  - Typography: `text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-5`
- **Hero CTAs**:
  - Primary: `"Create Free Dynamic QR"` (`h-12 px-7 text-base font-semibold bg-fire hover:bg-fire-hover text-white shadow-lg shadow-fire/25`)
  - Secondary: `"Explore Live Sandbox"` with `<Zap className="size-4 text-fire" />`
  - Trust Badges under CTA: `"No credit card required • 60-second setup • Free forever tier"` (`text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 pt-1 flex items-center justify-center gap-3`)
- **Interactive Sandbox Updates**:
  - Replace `Flame` icon on `"Simulate Scan & Trace"` with `<Zap className="size-4 text-white" />`
  - Replace `Flame` icon on `"Export High-Res SVG"` with `<Download className="size-3.5 text-white" />`
  - Replace `Flame` icon in live trace execution step with `<Activity className="size-5 text-fire animate-pulse" />`

---

### 2.3 Key Metrics Banner ([`components/home/metrics-banner.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/metrics-banner.tsx))
- **Card 1**: Value `< 12ms` | Label `Global Edge Redirects` | Sublabel `Instant sub-millisecond rule evaluation` | Badge `307 FastPath` | Icon `Zap`
- **Card 2**: Value `99.99%` | Label `Zero-Downtime SLA` | Sublabel `Multi-region global fallback cluster` | Badge `Always Online` | Icon `ShieldCheck`
- **Card 3**: Value `50M+` | Label `Scans Delivered` | Sublabel `Real-time analytics and geo-telemetry` | Badge `Enterprise Scale` | Icon `TrendingUp`
- **Card 4**: Value `4.8x` | Label `Average Conversion Lift` | Sublabel `Smart OS routing & A/B testing` | Badge `Proven ROI` | Icon `Sparkles`
- **Typography**: Values `text-3xl sm:text-4xl font-extrabold font-mono`, Labels `text-sm font-semibold`, Sublabels `text-xs sm:text-sm text-zinc-500 dark:text-zinc-400`.

---

### 2.4 Core Capabilities Bento ([`components/home/feature-bento.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/feature-bento.tsx))
- **Section Header**:
  - Badge: `<Sparkles className="size-3.5" /> Core Capabilities`
  - Headline: `Everything You Need to Maximize Every Single QR Scan`
  - Subtitle: `A high-performance dynamic QR engine built for zero latency, bulletproof routing, and revenue attribution.`
- **Bento Items**:
  1. `Zero-Friction OS Routing` (Badge: `Edge Native`, Icon: `Sliders`): Direct iOS users to the App Store, Android to Google Play, and desktop to your web app seamlessly.
  2. `Full-Funnel Scan Attribution` (Badge: `Lifecycle Tracking`, Icon: `Layers`): Track the complete customer journey from physical QR poster scan to account creation and checkout.
  3. `Automated A/B Split Testing` (Badge: `Conversion Boost`, Icon: `Split`): Distribute incoming traffic across multiple landing page variants with deterministic hash splits.
  4. `Custom Vector QR Studio` (Badge: `Brand Ready`, Icon: `Palette`): Customize brand colors, high error-correction levels, and logos. Export print-ready crisp SVG & PNG assets.
  5. `Sub-12ms Instant Edge Redirects` (Badge: `Zero Lag`, Icon: `Zap`): Global HTTP 307 fast-path redirects executed in memory with non-blocking background telemetry.
  6. `Enterprise Multi-Tenancy & Security` (Badge: `PostgreSQL & Auth`, Icon: `ShieldCheck`): Organization workspaces, role-based access control (RBAC), and encrypted analytics logs.
- **Typography**: Card titles `text-lg font-bold`, descriptions `text-sm leading-relaxed text-zinc-600 dark:text-zinc-400`.

---

### 2.5 Smart Routing Visualizer ([`components/home/routing-visualizer.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/routing-visualizer.tsx))
- **Section Header**:
  - Badge: `<Zap className="size-3.5" /> Instant Device Routing`
  - Headline: `Never Send an iPhone User to Google Play Again`
  - Subtitle: `Eliminate download friction by delivering visitors to their native app store, localized language, or active campaign in under 12ms.`
- **Typography & Details**: Step titles `text-sm font-semibold`, rule code and destination labels `text-xs sm:text-sm font-mono`.

---

### 2.6 Visitor Journey Visualizer ([`components/home/journey-visualizer.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/journey-visualizer.tsx))
- **Section Header**:
  - Badge: `<Layers className="size-3.5" /> Attribution Engine`
  - Headline: `Turn Physical Scans into Verified Revenue`
  - Subtitle: `Connect offline billboards, packaging, and store displays directly to digital conversions with end-to-end attribution.`
- **Typography**: Upgrade step descriptions from `text-xs` to `text-sm leading-relaxed text-zinc-600 dark:text-zinc-400`.

---

### 2.7 A/B Split Testing Showcase ([`components/home/ab-testing-showcase.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/ab-testing-showcase.tsx))
- **Section Header**:
  - Badge: `<Split className="size-3.5" /> Traffic Optimization`
  - Headline: `A/B Split Test Your QR Campaigns in Real Time`
  - Subtitle: `Eliminate guesswork by splitting scan traffic across multiple offers or landing pages to double your conversion rate.`
- **Card Descriptions**: Upgrade text to `text-sm`.

---

### 2.8 FAQ Section ([`components/home/faq-section.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/faq-section.tsx))
- **Section Header**:
  - Headline: `Frequently Asked Questions`
  - Subtitle: `Everything you need to know about dynamic QR routing, edge redirects, custom domains, and print safety.`
- **Copy Enhancements**: Refine answers to highlight reliability, never needing to reprint codes, custom domains, and zero redirect latency.

---

### 2.9 Bottom High-Conversion CTA Banner ([`components/home/cta-banner.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/cta-banner.tsx))
- **Top Pill**: `<Sparkles className="size-3.5 text-[#FF8C42]" /> Start Scaling Your Scans` (replace `Flame`)
- **Headline**: `Ready to Turn Every QR Code into a High-Converting Engine?`
- **Subtitle**: `Launch your first dynamic campaign in 60 seconds. Route intelligently, A/B test with ease, and track full-funnel ROI.`
- **CTAs**:
  - Primary: `<Button> Create Your First Dynamic QR <ArrowRight className="size-4" /> </Button>`
  - Secondary: `<Button variant="outline"> Try the Live Sandbox </Button>`
- **Trust Badges**:
  - `<CheckCircle2 className="size-4 text-fire" /> Free forever tier`
  - `<CheckCircle2 className="size-4 text-fire" /> No credit card required`
  - `<CheckCircle2 className="size-4 text-fire" /> Sub-12ms global edge redirects`

---

### 2.10 Other Components Icon Polish
- [`components/home/comparison-matrix.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/comparison-matrix.tsx): Replace `Flame` badge in ScanFlow column header with `<Sparkles className="size-4 text-fire" />`.
- [`components/home/pricing-section.tsx`](file:///home/amirfaisalz/Documents/amir/QR/components/home/pricing-section.tsx): Replace `Flame` in Growth "Most Popular" plan with `<Sparkles className="size-3.5 text-fire" />` and `<Zap className="size-3 fill-white" />`.

---

## 3. Typographic Hierarchy Standards

| Element | Mobile Class | Desktop Class | Weight | Tracking |
|---|---|---|---|---|
| **Hero H1** | `text-3.5xl` (32px) | `sm:text-5xl md:text-6xl lg:text-7xl` | Extrabold (800) | `tracking-tight` (-0.03em) |
| **Section H2** | `text-2.5xl sm:text-3xl` | `md:text-4xl lg:text-5xl` | Extrabold (800) | `tracking-tight` (-0.025em) |
| **Card H3** | `text-base` | `text-lg` | Bold (700) | `tracking-tight` (-0.015em) |
| **Lead Subtitles** | `text-base` (16px) | `sm:text-lg md:text-xl` | Normal / Medium | Normal (leading-relaxed) |
| **Card Body Copy** | `text-sm` (14px) | `text-sm` (14px) | Normal | `leading-relaxed` (22px) |
| **Badges / Monospace** | `text-xs` (12px) | `text-xs` (12px) | Semibold (600) | `font-mono` / `font-sans` |
