# Dashboard Fire Primary Theme Design

## 1. Overview
This document specifies the unification of the primary design tokens to use the signature **Fire** brand color (`#FA5D29` / `oklch(0.65 0.22 37.5)`) across the dashboard and all sub-pages in ScanFlow.

## 2. Design Tokens
The design tokens in `app/globals.css` are updated to map the primary and sidebar-primary tokens directly to the Fire palette:

### Light Mode (`:root`)
- `--primary`: `#FA5D29` (oklch(0.65 0.22 37.5))
- `--primary-foreground`: `#ffffff`
- `--ring`: rgba(250, 93, 41, 0.4)
- `--sidebar-primary`: `#FA5D29`
- `--sidebar-primary-foreground`: `#ffffff`
- `--sidebar-ring`: rgba(250, 93, 41, 0.4)

### Dark Mode (`.dark`)
- `--primary`: `#FA5D29`
- `--primary-foreground`: `#ffffff`
- `--ring`: rgba(250, 93, 41, 0.5)
- `--sidebar-primary`: `#FA5D29`
- `--sidebar-primary-foreground`: `#ffffff`
- `--sidebar-ring`: rgba(250, 93, 41, 0.5)

## 3. Scope & Subpages Covered
All pages and UI components under the dashboard hierarchy will inherit the fiery primary theme:
- `/dashboard` — Overview telemetry, KPI cards, interactive area charts, dynamic QR code table
- `/dashboard/qr-codes` — Dynamic QR management, builder modals, export dialogs
- `/dashboard/journeys` — Scan journeys explorer and detail drawers
- `/dashboard/campaigns` — Multi-channel campaign cards and modal workflows
- `/dashboard/conversions` — Conversion goals tracker and snippet dialogs
- `/dashboard/analytics` — Deep telemetry breakdowns, period filters, and time series charts
- `/dashboard/experiments` — A/B testing splits and variant traffic controllers

## 4. UI Components Impacted
- **Buttons (`Button variant="default"`)**: Solid `#FA5D29` background with white typography and smooth `#E04818` / opacity hover transitions.
- **Badges (`Badge variant="default"`)**: High-visibility fiery background with crisp white text.
- **Sidebar & Navigation (`NavMain`, `AppSidebar`)**: Primary action button ("Create Dynamic QR") styled in Fire theme; brand flame logo iconography matches primary theme.
- **Charts & Telemetry (`ChartAreaInteractive`, `AnalyticsTrendChart`)**: Time series visualizers referencing `var(--primary)` render with fire-gradient fills.
- **Focus Rings**: Form inputs, buttons, and selectable items pulse with subtle fire ring glows on focus.

## 5. Verification Plan
- Verify `app/globals.css` token definitions for light and dark themes.
- Verify primary button contrast against WCAG AA standards (white text on `#FA5D29` yields high readability).
- Run test suite / build checks to ensure no regressions in styling or layout.
