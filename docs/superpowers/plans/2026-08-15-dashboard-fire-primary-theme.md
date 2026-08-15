# Dashboard Fire Primary Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the ScanFlow design tokens and theme so that the dashboard and all pages under the dashboard use the Fire color (`#FA5D29` / `oklch(0.65 0.22 37.5)`) as the primary color across components, buttons, active indicators, and charts.

**Architecture:** Update CSS custom properties in `app/globals.css` for light mode (`:root`) and dark mode (`.dark`) to assign `--primary`, `--sidebar-primary`, and focus `--ring` tokens to the signature `#FA5D29` fire palette with high-contrast `#ffffff` text, ensuring all standard shadcn and custom dashboard UI components inherit the brand theme automatically.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui tokens, React 19, Lucide React, Recharts.

## Global Constraints
- Primary color value: `#FA5D29` (oklch(0.65 0.22 37.5))
- Primary text color: `#ffffff`
- Ring focus color: `rgba(250, 93, 41, 0.4)` (light) / `rgba(250, 93, 41, 0.5)` (dark)
- Dark mode primary: `#FA5D29` (with white text for optimal contrast)
- Maintain full accessibility and WCAG AA contrast standards.

---

### Task 1: Update Primary & Sidebar Theme Variables in `app/globals.css`

**Files:**
- Modify: `app/globals.css:59-135`

**Interfaces:**
- Consumes: `@theme inline` definitions for `--color-primary`, `--color-sidebar-primary`, etc.
- Produces: Updated CSS variables for `--primary`, `--primary-foreground`, `--ring`, `--sidebar-primary`, `--sidebar-primary-foreground`, and `--sidebar-ring`.

- [ ] **Step 1: Update `:root` variables in `app/globals.css`**

Set `--primary: #FA5D29`, `--primary-foreground: #ffffff`, `--sidebar-primary: #FA5D29`, `--sidebar-primary-foreground: #ffffff`, and fiery `--ring` and `--sidebar-ring` values in `:root`.

- [ ] **Step 2: Update `.dark` variables in `app/globals.css`**

Set `--primary: #FA5D29`, `--primary-foreground: #ffffff`, `--sidebar-primary: #FA5D29`, `--sidebar-primary-foreground: #ffffff`, and fiery `--ring` and `--sidebar-ring` values in `.dark`.

- [ ] **Step 3: Verify CSS compilation and token consistency**

Verify that all Tailwind utilities (`bg-primary`, `text-primary`, `hover:bg-primary/80`, `border-primary`, `ring-primary`) correctly resolve to `#FA5D29`.

---

### Task 2: Validate & Fine-Tune Dashboard Component Renderings

**Files:**
- Modify: `components/chart-area-interactive.tsx` (if needed for telemetry colors)
- Modify: `components/nav-main.tsx` (verify quick action button and active states)
- Modify: `components/dashboard-header.tsx` (if needed)

**Interfaces:**
- Consumes: `var(--primary)` and `var(--primary-foreground)` from `globals.css`
- Produces: Polished dashboard interactive components matching the Fire aesthetic

- [ ] **Step 1: Verify Quick Action & Action Buttons**

Ensure buttons in `components/nav-main.tsx` ("Create Dynamic QR"), `app/dashboard/page.tsx` ("Manage Dynamic QR Codes"), and subpage CTA buttons display in fire orange with white text.

- [ ] **Step 2: Verify Interactive Area Chart Telemetry**

Verify that `components/chart-area-interactive.tsx` correctly visualizes scan volume with fire primary tones.

- [ ] **Step 3: Verify Sub-page UI components**

Check `/dashboard/qr-codes`, `/dashboard/campaigns`, `/dashboard/conversions`, `/dashboard/analytics`, `/dashboard/experiments`, and `/dashboard/journeys` for visual consistency.

---

### Task 3: Automated Verification & Test Suite

**Files:**
- Test: `tests/` (run existing vitest tests and next build)

- [ ] **Step 1: Run unit tests**

Run: `npm test` or `npx vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run Next.js build validation**

Run: `npm run build` or `npx next build`
Expected: Build succeeds with 0 errors.
