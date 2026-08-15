# Startup Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the ScanFlow homepage into a modern, high-tech, interactive startup web experience featuring a live QR code playground, animated routing visualizer, scan journey simulator, A/B testing showcase, feature bento grid, pricing matrix, and FAQ.

**Architecture:** Next.js 16 App Router with React 19, Tailwind CSS v4, Lucide Icons, and client-side interactive visualizer widgets with zero heavy animation dependencies for lightning-fast edge performance.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Lucide React, `qrcode` library, TypeScript, Vitest.

## Global Constraints
- Modern obsidian high-tech aesthetic (`#09090b` / zinc palette) with crisp typography, balanced whitespace, and subtle ambient glows.
- Fully responsive across mobile (375px), tablet (768px), and desktop (1280px+).
- All interactive controls (tabs, inputs, modal triggers, accordions) must be accessible and keyboard navigable.
- Zero hydration mismatches between server session state and client UI.

---

### Task 1: Create Navbar and Header Navigation (`components/home/site-nav.tsx`)

**Files:**
- Create: `components/home/site-nav.tsx`
- Test: `tests/home/site-nav.test.tsx`

**Interfaces:**
- Consumes: `user?: { name: string; email: string } | null`
- Produces: `<SiteNav user={user} />` component with sticky glassmorphism, responsive navigation links, auth actions, and mobile drawer.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `SiteNav` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 2: Create Hero Section with Live Interactive QR Playground (`components/home/hero-playground.tsx`)

**Files:**
- Create: `components/home/hero-playground.tsx`
- Test: `tests/home/hero-playground.test.tsx`

**Interfaces:**
- Consumes: `qrcode` package, Lucide icons, `Button`, `Input` UI components
- Produces: `<HeroPlayground user={user} />` featuring headline, dual CTA, live QR generator, dynamic routing presets, and interactive "Simulate Scan" device emulator modal with step-by-step routing logs.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `HeroPlayground` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 3: Create Metrics & Social Proof Banner (`components/home/metrics-banner.tsx`)

**Files:**
- Create: `components/home/metrics-banner.tsx`
- Test: `tests/home/metrics-banner.test.tsx`

**Interfaces:**
- Produces: `<MetricsBanner />` featuring 4 key platform metrics with glowing pulse indicators.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `MetricsBanner` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 4: Create Dynamic Routing Engine Visualizer (`components/home/routing-visualizer.tsx`)

**Files:**
- Create: `components/home/routing-visualizer.tsx`
- Test: `tests/home/routing-visualizer.test.tsx`

**Interfaces:**
- Produces: `<RoutingVisualizer />` with interactive device tabs (iOS, Android, Desktop, Geo Target), animated route decision nodes, and illuminated active path indicators.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `RoutingVisualizer` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 5: Create Chronological Scan Journey Visualizer (`components/home/journey-visualizer.tsx`)

**Files:**
- Create: `components/home/journey-visualizer.tsx`
- Test: `tests/home/journey-visualizer.test.tsx`

**Interfaces:**
- Produces: `<JourneyVisualizer />` showcasing visitor lifecycle from physical QR scan to session initialization, edge redirect, and conversion event.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `JourneyVisualizer` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 6: Create A/B Testing & Split Traffic Showcase (`components/home/ab-testing-showcase.tsx`)

**Files:**
- Create: `components/home/ab-testing-showcase.tsx`
- Test: `tests/home/ab-testing-showcase.test.tsx`

**Interfaces:**
- Produces: `<ABTestingShowcase />` featuring interactive traffic split sliders, live conversion comparison bars, and automated winner selection.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `ABTestingShowcase` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 7: Create Feature Bento Grid (`components/home/feature-bento.tsx`)

**Files:**
- Create: `components/home/feature-bento.tsx`
- Test: `tests/home/feature-bento.test.tsx`

**Interfaces:**
- Produces: `<FeatureBento />` with 6 interactive glass cards detailing Dynamic Rules, Scan Journeys, Multi-Tenant Security, QR Customization, Edge Analytics, and Latency Optimization.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `FeatureBento` component**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 8: Create Interactive Pricing Matrix & FAQ Accordion (`components/home/pricing-section.tsx` & `components/home/faq-section.tsx`)

**Files:**
- Create: `components/home/pricing-section.tsx`
- Create: `components/home/faq-section.tsx`
- Test: `tests/home/pricing-and-faq.test.tsx`

**Interfaces:**
- Produces: `<PricingSection />` with monthly/annual billing toggle and 3 tiers (Starter, Pro, Enterprise), and `<FAQSection />` with smooth collapsible accordion items.

- [ ] **Step 1: Write the failing unit test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `PricingSection` and `FAQSection` components**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 9: Create CTA Banner, Footer, and Assemble Homepage in `app/page.tsx`

**Files:**
- Create: `components/home/cta-banner.tsx`
- Create: `components/home/site-footer.tsx`
- Modify: `app/page.tsx`
- Test: `tests/home/page.test.tsx`

**Interfaces:**
- Produces: Fully integrated `app/page.tsx` orchestrating all sections with user authentication state.

- [ ] **Step 1: Write test for home page assembly**
- [ ] **Step 2: Implement `CtaBanner`, `SiteFooter`, and assemble `app/page.tsx`**
- [ ] **Step 3: Run all unit and integration tests**
- [ ] **Step 4: Run build check (`npm run build`)**
- [ ] **Step 5: Commit all changes**
