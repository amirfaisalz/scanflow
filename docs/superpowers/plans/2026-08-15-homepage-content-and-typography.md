# Homepage Content, Conversion Copy & Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the ScanFlow landing page copy for maximum conversion, refine font size hierarchy and readability across all viewports, and replace all literal flame icons with semantic product icons.

**Architecture:** Component-based updates in `components/home/` with corresponding unit and integration tests in `tests/home/`, preserving existing responsive styling, dark/light theme tokens, and interactive playground state machines.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Lucide React, Vitest, React Testing Library.

## Global Constraints

- **Theme & Palette**: Retain the `#FA5D29` (`--color-fire`) brand color tokens, but eliminate literal `Flame` icon instances in favor of semantic icons (`Zap`, `Sparkles`, `Download`, `Activity`, `TrendingUp`, `CheckCircle2`).
- **Typography & Scale**: Primary body text on cards and visualizers must be `text-sm` (14px) with `leading-relaxed` (not cramped `text-xs`). Hero title must use `text-3.5xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight`.
- **Testing**: All component tests in `tests/home/` must pass (`npm test -- --run`) with zero lint regressions.
- **No Placeholders**: All copy and component code must be complete with no "TODO" or placeholder text.

---

### Task 1: Update Hero Playground Copy, Font Sizing, CTAs, and Semantic Icons

**Files:**
- Modify: `components/home/hero-playground.tsx`
- Modify: `tests/home/hero-playground.test.tsx`

**Interfaces:**
- Consumes: `@/components/ui/button`, `lucide-react` (`Sparkles`, `Zap`, `Download`, `Activity`, `ArrowRight`, `QrCode`, `Sliders`, `Split`, `Layers`, `Copy`, `Check`, `RotateCw`, `Globe`, `Smartphone`, `Laptop`)
- Produces: `export function HeroPlayground({ user }: HeroPlaygroundProps)`

- [ ] **Step 1: Update the unit test in `tests/home/hero-playground.test.tsx` for new headline and CTAs**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroPlayground } from "@/components/home/hero-playground";

describe("HeroPlayground Component", () => {
  it("renders high-converting hero headline, subtitle, and primary call to action", () => {
    render(<HeroPlayground user={null} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /route, test, and convert/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Create Free Dynamic QR/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument();
  });

  it("allows typing custom destination URL and updates the live configurator", () => {
    render(<HeroPlayground user={null} />);

    const input = screen.getByPlaceholderText(/Enter target URL/i);
    fireEvent.change(input, { target: { value: "https://mycoolapp.io" } });
    expect(input).toHaveValue("https://mycoolapp.io");
  });

  it("switches routing presets dynamically", () => {
    render(<HeroPlayground user={null} />);

    const abSplitBtn = screen.getByRole("button", { name: /A\/B Split/i });
    fireEvent.click(abSplitBtn);
    expect(screen.getByText(/50% \/ 50% Traffic Allocation/i)).toBeInTheDocument();
  });

  it("opens scan simulation dialog when clicking Simulate Scan", async () => {
    render(<HeroPlayground user={null} />);

    const simulateBtn = screen.getByRole("button", { name: /Simulate Scan/i });
    fireEvent.click(simulateBtn);

    expect(screen.getByText(/Real-time Scan Resolution/i)).toBeInTheDocument();
    expect(screen.getByText(/Edge Routing Decision/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails on old headline**

Run: `npm test -- tests/home/hero-playground.test.tsx`
Expected: FAIL with headline mismatch

- [ ] **Step 3: Update `components/home/hero-playground.tsx`**

1. Replace `Flame` import with `Sparkles`, `Zap`.
2. Update Top Pill text to `The Intelligent Dynamic QR & Traffic Routing Platform` | `Live Sandbox` with `<Sparkles className="size-3.5 text-fire" />`.
3. Update `<h1>`:
```tsx
<h1 className="text-3.5xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12] sm:leading-[1.10] text-balance pb-1">
  Smart QR codes that{" "}
  <span className="relative inline-block pt-0.5 pb-1.5 sm:pb-2.5 text-transparent bg-clip-text bg-linear-to-r from-fire via-[#FF6B35] to-fire-hover">
    route, test, and convert.
  </span>
</h1>
```
4. Update Subtitle:
```tsx
<p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal mt-4 sm:mt-5">
  Direct visitors dynamically by device (iOS vs Android), location, and time. Change destinations anytime without reprinting, A/B test landing pages, and track full-funnel scan ROI in sub-12ms.
</p>
```
5. Update CTAs and add trust badges:
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto">
  <Link href="/login" className="w-full sm:w-auto">
    <Button
      size="lg"
      className="w-full sm:w-auto h-12 px-7 text-base font-semibold bg-fire hover:bg-fire-hover text-white shadow-lg shadow-fire/25 hover:shadow-xl hover:shadow-fire/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
    >
      <span>Create Free Dynamic QR</span>
      <ArrowRight className="size-4" />
    </Button>
  </Link>
  <a href="#playground" className="w-full sm:w-auto">
    <Button
      variant="outline"
      size="lg"
      className="w-full sm:w-auto h-12 px-6 text-base font-medium border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all gap-2"
    >
      <Zap className="size-4 text-fire" />
      <span>Explore Live Sandbox</span>
    </Button>
  </a>
</div>

<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
  <span className="flex items-center gap-1.5">
    <Check className="size-3.5 text-emerald-500" />
    <span>No credit card required</span>
  </span>
  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
  <span className="flex items-center gap-1.5">
    <Check className="size-3.5 text-emerald-500" />
    <span>Instant 60s setup</span>
  </span>
  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
  <span className="flex items-center gap-1.5">
    <Check className="size-3.5 text-emerald-500" />
    <span>Free forever tier</span>
  </span>
</div>
```
6. Replace `Flame` on simulate button with `<Zap className="size-4 fill-current text-white" />`.
7. Replace `Flame` on export SVG button with `<Download className="size-3.5 text-white" />`.
8. Replace `Flame` in simulation resolution dialog with `<Activity className="size-6 animate-pulse text-fire" />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/home/hero-playground.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add components/home/hero-playground.tsx tests/home/hero-playground.test.tsx
git commit -m "feat: modernize hero copy, typography, CTAs, trust badges and semantic icons"
```

---

### Task 2: Update Site Navigation CTA and Metrics Banner

**Files:**
- Modify: `components/home/site-nav.tsx`
- Modify: `components/home/metrics-banner.tsx`
- Modify: `tests/home/site-nav.test.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Zap`, `ShieldCheck`, `TrendingUp`, `Sparkles`, `ArrowRight`, `LayoutDashboard`)
- Produces: `export function SiteNav({ user }: SiteNavProps)`, `export function MetricsBanner()`

- [ ] **Step 1: Update `tests/home/site-nav.test.tsx` for new "Create Free QR" CTA button**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/home/site-nav";

describe("SiteNav Component", () => {
  it("renders ScanFlow logo and primary navigation links", () => {
    render(<SiteNav user={null} />);

    expect(screen.getByText("ScanFlow")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Routing")).toBeInTheDocument();
    expect(screen.getByText("Journey")).toBeInTheDocument();
    expect(screen.getByText("A/B Testing")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders high-converting Create Free QR CTA button when logged out", () => {
    render(<SiteNav user={null} />);
    expect(screen.getByRole("button", { name: /Create Free QR/i })).toBeInTheDocument();
  });

  it("renders Dashboard CTA button when logged in", () => {
    render(
      <SiteNav
        user={{ id: "user_123", name: "Amir", email: "amir@example.com" }}
      />
    );
    expect(screen.getByRole("button", { name: /Go to Dashboard/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Update `components/home/site-nav.tsx`**

Change button text from `"Get Started"` to `"Create Free QR"`.

- [ ] **Step 3: Update `components/home/metrics-banner.tsx`**

Update metrics data with refined conversion labels, sublabels, and semantic icons:
```tsx
import { ShieldCheck, Zap, TrendingUp, Sparkles } from "lucide-react";

const metrics = [
  {
    value: "< 12ms",
    label: "Global Edge Redirects",
    sublabel: "Instant sub-millisecond rule evaluation",
    icon: Zap,
    color: "text-fire",
    badge: "307 FastPath",
  },
  {
    value: "99.99%",
    label: "Zero-Downtime SLA",
    sublabel: "Multi-region global fallback cluster",
    icon: ShieldCheck,
    color: "text-emerald-500",
    badge: "Always Online",
  },
  {
    value: "50M+",
    label: "Scans Delivered",
    sublabel: "Real-time analytics and geo-telemetry",
    icon: TrendingUp,
    color: "text-amber-500",
    badge: "Enterprise Scale",
  },
  {
    value: "4.8x",
    label: "Average Conversion Lift",
    sublabel: "Smart OS routing & A/B testing",
    icon: Sparkles,
    color: "text-rose-500",
    badge: "Proven ROI",
  },
];
```
Update sublabel typography to `text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/home/site-nav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add components/home/site-nav.tsx components/home/metrics-banner.tsx tests/home/site-nav.test.tsx
git commit -m "feat: enhance navigation CTA and metrics banner conversion copy & icons"
```

---

### Task 3: Update Feature Bento Grid & Smart Routing Visualizer

**Files:**
- Modify: `components/home/feature-bento.tsx`
- Modify: `components/home/routing-visualizer.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Sliders`, `ShieldCheck`, `Palette`, `Zap`, `Split`, `Layers`, `Sparkles`, `Smartphone`, `Laptop`, `QrCode`)
- Produces: `export function FeatureBento()`, `export function RoutingVisualizer()`

- [ ] **Step 1: Update `components/home/feature-bento.tsx`**

1. Section Header:
   - Badge: `<Sparkles className="size-3.5 text-fire" /> <span>Core Capabilities</span>`
   - Headline: `Everything You Need to Maximize Every Single QR Scan`
   - Subtitle: `A high-performance dynamic QR engine built for zero latency, bulletproof routing, and verified revenue attribution.`
2. Feature items list:
   - `Zero-Friction OS Routing` (Badge: `Edge Native`, Icon: `Sliders`): `Direct iOS users to the App Store, Android to Google Play, and desktop to your web app with zero manual intervention.`
   - `Full-Funnel Scan Attribution` (Badge: `Lifecycle Tracking`, Icon: `Layers`): `Track the complete customer journey from initial physical QR scan through session identity binding and completed checkout.`
   - `Automated A/B Split Testing` (Badge: `Conversion Boost`, Icon: `Split`): `Distribute incoming scan traffic across multiple landing page variants with deterministic hash splits to find winning offers.`
   - `Custom Vector QR Studio` (Badge: `Brand Ready`, Icon: `Palette`): `Customize brand colors, error correction levels, and styling with real-time preview. Export print-ready crisp SVG or PNG files.`
   - `Sub-12ms Instant Edge Redirects` (Badge: `Zero Lag`, Icon: `Zap`): `Deterministic HTTP 307 redirects resolved directly in memory at global edge nodes with non-blocking background telemetry.`
   - `Enterprise Multi-Tenancy & Security` (Badge: `PostgreSQL & Auth`, Icon: `ShieldCheck`): `Strict organization workspaces and role-based access control with Better Auth and Drizzle ORM on PostgreSQL.`
3. Card typography: Body text set to `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal`.

- [ ] **Step 2: Update `components/home/routing-visualizer.tsx`**

1. Section Header:
   - Badge: `<Zap className="size-3.5 text-fire" /> <span>Instant Device Routing</span>`
   - Headline: `Never Send an iPhone User to Google Play Again`
   - Subtitle: `Eliminate download friction by automatically delivering visitors to their native app store, localized language, or active campaign in under 12ms.`
2. Card font sizing:
   - Ensure step descriptions, rule code preview, and result labels use readable `text-sm font-medium` and `text-xs sm:text-sm font-mono`.

- [ ] **Step 3: Run home tests**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add components/home/feature-bento.tsx components/home/routing-visualizer.tsx
git commit -m "feat: upgrade feature bento and routing visualizer conversion copy and typography"
```

---

### Task 4: Update Visitor Journey, A/B Testing Showcase, and FAQ Section

**Files:**
- Modify: `components/home/journey-visualizer.tsx`
- Modify: `components/home/ab-testing-showcase.tsx`
- Modify: `components/home/faq-section.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Layers`, `Split`, `QrCode`, `Smartphone`, `ShoppingBag`, `UserCheck`, `Trophy`, `HelpCircle`, `ChevronDown`)
- Produces: `export function JourneyVisualizer()`, `export function ABTestingShowcase()`, `export function FAQSection()`

- [ ] **Step 1: Update `components/home/journey-visualizer.tsx`**

1. Section Header:
   - Headline: `Turn Physical Scans into Verified Revenue`
   - Subtitle: `Connect offline billboards, packaging, and tabletop displays directly to digital conversions with transparent attribution.`
2. Upgrade step descriptions font size from `text-xs` to `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed`.

- [ ] **Step 2: Update `components/home/ab-testing-showcase.tsx`**

1. Section Header:
   - Headline: `A/B Split Test Your QR Campaigns in Real Time`
   - Subtitle: `Eliminate guesswork by splitting scan traffic across multiple landing page variants to double your conversion rate.`
2. Variant card copy:
   - Variant A: `Original Landing Page` (`3.2% Conversion Rate`)
   - Variant B: `Interactive Video Hero Page` (`7.8% Conversion Rate (+143% Lift)`)
3. Body text scale: Ensure `text-sm` for card metadata.

- [ ] **Step 3: Update `components/home/faq-section.tsx`**

1. Section Header:
   - Subtitle: `Everything you need to know about dynamic QR routing, edge redirects, custom domains, and print safety.`
2. Refine FAQ questions & answers for maximum buyer clarity and risk-reduction.

- [ ] **Step 4: Run home tests**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add components/home/journey-visualizer.tsx components/home/ab-testing-showcase.tsx components/home/faq-section.tsx
git commit -m "feat: update journey visualizer, a/b split testing, and faq copy for conversion"
```

---

### Task 5: Update Bottom CTA Banner & Comparison/Pricing Icon Cleanups

**Files:**
- Modify: `components/home/cta-banner.tsx`
- Modify: `components/home/comparison-matrix.tsx`
- Modify: `components/home/pricing-section.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Sparkles`, `Zap`, `CheckCircle2`, `ArrowRight`, `Star`, `Check`, `X`)
- Produces: `export function CtaBanner()`, `export function ComparisonMatrix()`, `export function PricingSection()`

- [ ] **Step 1: Update `components/home/cta-banner.tsx`**

1. Top Pill: Replace `Flame` with `<Sparkles className="size-3.5 text-[#FF8C42]" /> <span>Start Scaling Your Conversions</span>`.
2. Headline: `Ready to Turn Every QR Code into a High-Converting Engine?`
3. Subtitle: `Launch your first dynamic campaign in 60 seconds. Route intelligently, A/B test with ease, and track full-funnel ROI.`
4. CTAs:
   - Primary: `Create Your First Dynamic QR` with `<ArrowRight className="size-4" />`
   - Secondary: `Try the Live Sandbox`
5. Trust Badges:
   - `<CheckCircle2 className="size-4 text-fire" /> Free forever tier`
   - `<CheckCircle2 className="size-4 text-fire" /> No credit card required`
   - `<CheckCircle2 className="size-4 text-fire" /> Sub-12ms global edge redirects`

- [ ] **Step 2: Clean up `comparison-matrix.tsx` and `pricing-section.tsx`**

1. In `comparison-matrix.tsx`: Replace `Flame` import with `Sparkles`; change ScanFlow header badge to `<Sparkles className="size-4 text-fire" />`.
2. In `pricing-section.tsx`: Replace `Flame` import with `Sparkles` and `Zap`; change Growth plan "Most Popular" badge to `<Sparkles className="size-3.5 text-fire" />` and CTA to `<Zap className="size-3 fill-white" />`.

- [ ] **Step 3: Run test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add components/home/cta-banner.tsx components/home/comparison-matrix.tsx components/home/pricing-section.tsx
git commit -m "feat: modernize bottom cta banner and replace flame icons in pricing & comparison"
```

---

### Task 6: Full Verification Test Suite & Build Check

**Files:**
- Test all home components and verify build integrity.

- [ ] **Step 1: Run full unit & component test suite**

Run: `npm test -- --run`
Expected: All tests pass (0 failures)

- [ ] **Step 2: Run Next.js production build check to guarantee no type or JSX errors**

Run: `npm run build`
Expected: Exit code 0 (Build successfully generated)
