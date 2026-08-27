---
name: Rial Scope
description: Jet-Age Ticket Ledger & Swiss Neo-Brutalist Currency Observatory
colors:
  primary: "#0f172a"
  on-primary: "#ffffff"
  secondary: "#2563eb"
  on-secondary: "#ffffff"
  background: "#0f172a"
  cardstock: "#f8fafc"
  surface-inner: "#ffffff"
  surface-alt: "#f1f5f9"
  surface-muted: "#e2e8f0"
  on-surface: "#0f172a"
  on-surface-variant: "#475569"
  border: "#0f172a"
  border-subtle: "#cbd5e1"
  stamp-red: "#dc2626"
  stamp-red-bg: "#fef2f2"
  stamp-green: "#16a34a"
  stamp-green-bg: "#f0fdf4"
  stamp-amber: "#d97706"
  stamp-amber-bg: "#fffbeb"
typography:
  display-lg:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  display:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline-sm:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 800
    lineHeight: 1.25
  title:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "0.04em"
  body:
    fontFamily: "'Work Sans', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "'Work Sans', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
  label:
    fontFamily: "'Work Sans', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  label-xs:
    fontFamily: "'Work Sans', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  label-xxs:
    fontFamily: "'Work Sans', -apple-system, 'Segoe UI', Tahoma, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 800
  mono:
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: "1.05rem"
    fontWeight: 700
  mono-sm:
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 700
  mono-xs:
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: "0.65rem"
    fontWeight: 800
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
  tab: "6px"
  lg: "8px"
  notch: "28px"
  full: "9999px"
spacing:
  xs: "0.35rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1.75rem"
  button-secondary:
    backgroundColor: "{colors.surface-inner}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1.75rem"
  card:
    backgroundColor: "{colors.cardstock}"
    rounded: "{rounded.md}"
    padding: "2.25rem 2.5rem"
---

# Design System: Rial Scope

## Overview

**Creative North Star: "The Jet-Age Ticket Ledger & Swiss Neo-Brutalist Observatory"**

Rial Scope marries the tactile discipline of vintage airline coupon wallets and carbon-copy transit manifests with the unapologetic structural rigor of Swiss Neo-Brutalism. Designed for an offline-first local deployment, the interface presents financial conversions, 75-year historical exchange rate trajectories, and purchasing power deltas as verified flight coupons and official stamped registers.

**Key Characteristics:**
- **Aviation Navy Mesh**: Deep navy desktop background (`#0f172a`) with subtle radial coordinates.
- **Perforated Ticket Coupons**: Multi-leg ticket wallet structure with top tear-off tabs (`CPN 01` through `CPN 04`) and semicircle punch notch cutouts (`28px`).
- **Architectural Ink Borders**: Heavy 2px to 3px solid ink borders (`#0f172a`) and hard 6px offset shadows (`6px 6px 0 #000000`).
- **Official Stamped Seals**: Red (`#dc2626`) and green (`#16a34a`) validation marks indicating trading-day fallback status and rate deltas.
- **Tabular Carbon-Copy Alignment**: Strict monospace data columns (`JetBrains Mono`) for all financial rates, dates, and amounts.

## Colors

The palette establishes high typographic contrast between crisp cardstock surfaces, carbon-copy deep ink, and vibrant stamped validation marks.

### Primary
- **Deep Navy Ink** (`#0f172a`): Primary brand color used for structural borders, buttons, display titles, and active ticket tabs.

### Secondary
- **Carbon Blue Ink** (`#2563eb`): Secondary accent for interactive link focus rings, coupon codes, and Toman sub-indicators.

### Neutral
- **Aviation Navy Ground** (`#0f172a`): Page background canvas with subtle coordinate mesh.
- **Crisp Cardstock White** (`#f8fafc`): Ticket booklet body, coupon base, and header container.
- **Pure Surface Inner** (`#ffffff`): Inner calculation field backgrounds and chart canvas.
- **Carbon Card Alt** (`#f1f5f9`): Tabular header strips, price group fieldsets, and result card backgrounds.
- **Muted Ink** (`#475569`): Field labels, chart axes, and secondary metadata descriptions.
- **Subtle Hairline Border** (`#cbd5e1`): Interior table rules and dashed form dividers.

### Semantic
- **Stamped Crimson** (`#dc2626`): Fallback date resolution warning stamps, negative dollar deltas, and error banners.
- **Stamped Forest Green** (`#16a34a`): Live dispatch status pill, positive dollar gains, and valid coupon badges.
- **Stamped Amber** (`#d97706`): Historical data discontinuity notice banners.

### Named Rules
**The Ink-and-Stamp Rule.** Color is never applied as decorative ambient glows or soft pastels. Color exists strictly as solid structural ink (`#0f172a`), carbon-copy lines (`#2563eb`), or official pressed rubber stamps (`#dc2626`, `#16a34a`).

## Typography

**Display Font:** Manrope (with `-apple-system`, `Segoe UI`, `Tahoma` fallbacks)
**Body Font:** Work Sans (with `-apple-system`, `Segoe UI`, `Tahoma` fallbacks)
**Label/Mono Font:** JetBrains Mono (with `SFMono-Regular`, `Menlo`, `Consolas` fallbacks)

**Character:** Severe, structured, and authoritative. Display typography is set with heavy 800 weights and uppercase tracking, while financial data relies strictly on tabular monospace alignment.

### Hierarchy
- **Display** (ExtraBold 800, 1.75rem, 1.2 line-height, -0.02em tracking): Main section headings (`<h2>`).
- **Headline** (ExtraBold 800, 1.6rem, 1.25 line-height, -0.02em tracking): Application header title (`<h1>`).
- **Title** (ExtraBold 800, 0.82rem, 1.4 line-height, 0.04em tracking, uppercase): Tab coupon titles and field group legends.
- **Body** (Regular 400 / SemiBold 600, 0.95rem, 1.5 line-height): Explanatory summaries, notes, and calculation descriptions.
- **Label** (ExtraBold 800, 0.72rem, 0.06em tracking, uppercase): Form input labels, today's rate labels, and coupon codes.
- **Mono** (Bold 700 / ExtraBold 800, 1.05rem to 1.85rem): All currency numbers, exchange rates, dates, and stamped badge texts.

### Named Rules
**The Tabular Metric Rule.** Every currency rate, historical date, and financial delta string must be rendered using `--font-mono` (JetBrains Mono) with tabular numeral alignment.

## Layout

- **Max Width:** Main application container is capped at 1200px and horizontally centered.
- **Booklet Grid:**
  - Header data strip uses responsive auto-fit grid (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`).
  - Inputs use 2-column grid (`grid-template-columns: 1fr 1fr`, collapsing to `1fr` on viewports ≤768px).
  - Results use fluid auto-fit grids (`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`).
- **Spacing Rhythm:** Standard spacing steps are 0.35rem (xs), 0.75rem (sm), 1.25rem (md), 2rem (lg), 2.5rem (xl).

## Elevation & Depth

Rial Scope utilizes Swiss Neo-Brutalist hard-offset drop shadows and physical ticket cutouts rather than soft diffuse blurs.

### Shadow Vocabulary
- **Brutalist Monolith Shadow** (`box-shadow: 6px 6px 0px #000000`): Main ticket booklet container and app header.
- **Brutalist Button Shadow** (`box-shadow: 4px 4px 0px #0f172a`): Primary and secondary action buttons at rest.
- **Active Button Shadow** (`box-shadow: 1px 1px 0px #0f172a`): Buttons in pressed active state (`transform: translate(3px, 3px)`).
- **Subtle Card Shadow** (`box-shadow: 3px 3px 0px rgba(15, 23, 42, 0.15)`): Interior result cards.

### Named Rules
**The Hard Offset Rule.** All shadows must use 0px blur radius with crisp directional offsets. Diffuse or gradient drop shadows are strictly prohibited.

## Shapes

- **Base Radius:** 2px (`--radius-sm`) for inputs, buttons, badges, and interior cards.
- **Container Radius:** 4px (`--radius-md`) for header and booklet outer shells.
- **Perforated Ticket Notches:** 28px semicircle cutouts on left and right borders of the ticket body.
- **Tear-Off Tabs:** Rounded top shoulders (6px 6px 0 0) with dashed bottom tear perforations.

## Components

### Ticket Tabs
- **Style:** Horizontal flex deck of tabbed coupons with coupon index (`CPN 01`), uppercase title, and dashed bottom tear line.
- **Active State:** Off-white cardstock background (`#f8fafc`), solid 2px ink border, lifted by 2px (`transform: translateY(-2px)`).
- **Focus:** 3px solid focus ring with 2px offset.

### Buttons
- **Primary:** Deep navy background (`#0f172a`), white text, 2.5px solid border, 4px hard black drop shadow.
- **Hover/Active:** Darkens to `#1e293b` on hover; translates 3px diagonally with 1px shadow on active press.
- **Secondary:** White background (`#ffffff`), navy text, 2.5px border, 4px shadow.

### Inputs & Date Fields
- **Style:** Carbon-copy entry box with 2px solid `#0f172a` border, white background, bold JetBrains Mono typography.
- **Focus:** 3px solid `#2563eb` focus ring.

### Stamped Badges & Chips
- **Style:** 2px to 2.5px solid border in crimson or green with matching tinted background, uppercase bold monospace typography, and slight rotation (-1.5deg).

### Result Cards
- **Structure:** Carbon-copy card container with label, date, large monospace financial delta, and stamped verification marks.
- **Delta Cards:** Tinted green (`#f0fdf4`) or crimson (`#fef2f2`) based on gain or loss.

## Do's and Don'ts

### Do:
- **Do** use 2px/3px solid black/navy borders (`#0f172a`) and hard 0-blur offset shadows for all structural cards.
- **Do** preserve visible keyboard focus rings (`:focus-visible`) with 2-3px outline offsets.
- **Do** render all currency amounts, rates, and dates in JetBrains Mono.
- **Do** style fallback date notifications as official stamped verification marks (`[FALLBACK: APPLIED ...]`).

### Don't:
- **Don't** use soft pastel gradients, diffuse blurred drop shadows, or generic rounded SaaS cards.
- **Don't** draw linear interpolation lines across unpopulated historical coverage gaps (e.g. 2010–2011).
- **Don't** use low-contrast text colors; always maintain high-contrast WCAG AAA readability.
