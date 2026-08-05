---
name: Rial Scope
description: Precision Finance USD/IRR Exchange Explorer & Purchasing Power Observatory
colors:
  primary: "#6f2e19"
  primary-container: "#8c442e"
  on-primary: "#ffffff"
  on-primary-container: "#ffc2b0"
  secondary: "#88511b"
  secondary-container: "#fdb475"
  on-secondary-container: "#78440e"
  background: "#fff8f6"
  surface-lowest: "#ffffff"
  surface-low: "#fdf1ee"
  surface-container: "#f7ebe8"
  surface-high: "#f1e6e3"
  surface-highest: "#ebe0dd"
  on-surface: "#201a19"
  on-surface-variant: "#54433e"
  outline: "#87736d"
  outline-variant: "#dac1bb"
  success: "#46600f"
  success-container: "#e3ecc9"
  error: "#ba1a1a"
  error-container: "#ffdad6"
typography:
  display:
    fontFamily: "'Manrope', -apple-system, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Manrope', -apple-system, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline-mobile:
    fontFamily: "'Manrope', -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  value-md:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "1.55rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  value-sm:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "1.05rem"
    fontWeight: 700
  title:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  summary:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.95rem"
    lineHeight: 1.6
  date:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.9rem"
  caption:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.85rem"
    lineHeight: 1.6
  subtext:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.8rem"
  tab:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  label:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  badge:
    fontFamily: "'Work Sans', -apple-system, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 700
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.4rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.85rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.85rem"
  card:
    backgroundColor: "{colors.surface-lowest}"
    rounded: "{rounded.xl}"
    padding: "2rem"
---

# Design System: Rial Scope

## Overview

**Creative North Star: "The Precision Observatory"**

Rial Scope employs a warm, high-trust financial aesthetic built upon a warm terracotta and amber palette, structured tonal surfaces, disciplined typography, and log-scale historical clarity. Designed for offline-first local deployment, the interface prioritizes legibility, responsive card alignment, and subtle state transitions without superficial AI slop or unnecessary decorative overlays.

**Key Characteristics:**
- **Warm Terracotta Base**: Warm rose-tinted neutral backgrounds (`#fff8f6`) paired with deep terracotta accents (`#6f2e19`).
- **Disciplined Monospace Data**: Financial values, rates, and ISO dates are rendered in JetBrains Mono for rapid scanability.
- **Tonal Layering**: Surface depth is expressed through subtle tonal elevation (`#ffffff`, `#fdf1ee`, `#f7ebe8`) and soft directional shadows rather than heavy borders or halos.
- **Bilingual Fluidity**: Native LTR (English) and RTL (Persian) support with seamless structural symmetry.

## Colors

The palette balances warm terracotta brand accents with harmonized semantic status tones and warm paper neutrals.

### Primary
- **Deep Terracotta** (`#6f2e19`): Main brand color used for key headings, active tab borders, primary action buttons, and active text states.
- **Terracotta Container** (`#8c442e`): Hover states for primary buttons and chart series stroke lines.

### Secondary
- **Warm Amber** (`#88511b`): Secondary accent for financial highlights and secondary callouts.

### Neutral
- **Warm Rose White** (`#fff8f6`): Global body background and primary page surface.
- **Surface Lowest** (`#ffffff`): Card containers, price group fieldsets, and header bar surface.
- **Surface Low** (`#fdf1ee`): Input field rest states and default result card backgrounds.
- **Surface Container** (`#f7ebe8`): Input hover states and summary box backgrounds.
- **Surface High** (`#f1e6e3`): Active badges, today's rate pill, and delta summary containers.
- **On Surface** (`#201a19`): High-contrast body text and primary numerical values.
- **On Surface Variant** (`#54433e`): Secondary captions, field labels, and chart gridlines.
- **Outline Variant** (`#dac1bb`): Card borders, tab dividers, and subtle field outlines.

### Semantic
- **Warm Forest Green** (`#46600f`): Gain indicators, positive dollar deltas, and success badges.
- **Warm Crimson** (`#ba1a1a`): Loss indicators, negative dollar deltas, and error banners.

### Named Rules
**The Tonal Layering Rule.** Depth is established through stepped surface container tones (`#ffffff` → `#fdf1ee` → `#f7ebe8` → `#f1e6e3`). Hard dark borders and pure black outlines are strictly forbidden.

## Typography

**Display Font:** Manrope (with `-apple-system`, `Segoe UI`, `Tahoma` fallbacks)
**Body Font:** Work Sans (with `-apple-system`, `Segoe UI`, `Tahoma` fallbacks)
**Label/Mono Font:** JetBrains Mono (with `SFMono-Regular`, `Menlo`, `Consolas` fallbacks)

**Character:** Technical, crisp, and high-trust. Display titles carry tight tracking for authority, while numerical data relies on tabular monospace alignment.

### Hierarchy
- **Display** (Bold 700, 1.85rem, 1.2 line-height, -0.02em tracking): Section headings (`<h2>`).
- **Headline** (Bold 700, 1.35rem, 1.25 line-height, -0.01em tracking): Application header title (`<h1>`).
- **Title** (Bold 700, 1rem, 1.4 line-height): Form section legends and field group titles.
- **Body** (Regular 400 / SemiBold 600, 1rem, 1.5 line-height): Explanatory intros, summary descriptions, and form inputs.
- **Label** (SemiBold 600 / Bold 700, 0.72rem, 0.05em tracking, uppercase): Input labels, card headers, and status badges.

### Named Rules
**The Tabular Metric Rule.** Every currency value, exchange rate, and date string must be rendered using `--font-mono` (JetBrains Mono) to guarantee vertical alignment across data cards.

## Layout

- **Max Width:** Main application container is capped at 1200px and horizontally centered.
- **Grid Systems:**
  - Responsive inputs use 2-column grid (`grid-template-columns: 1fr 1fr`, collapsing to `1fr` on viewports ≤640px).
  - Results use fluid auto-fit grids (`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`) to adapt dynamically between 2-card and 3-card outputs.
- **Spacing Rhythm:** Standard spacing steps are 0.4rem (xs), 0.75rem (sm), 1.25rem (md), 2rem (lg), 2.5rem (xl).

## Elevation & Depth

Rial Scope uses a flat-by-default, soft-tonal depth philosophy. Surfaces rest flat against warm backgrounds with subtle 1px border outlines (`#dac1bb`).

### Shadow Vocabulary
- **Tonal Card Elevation** (`box-shadow: 0 4px 16px rgba(111, 46, 25, 0.08)`): Main calculation cards (`.calc-card`) and float banners.
- **Button Shadow** (`box-shadow: 0 4px 12px rgba(111, 46, 25, 0.25)`): Primary action buttons at rest.

### Named Rules
**The Soft Shadow Rule.** Shadows must always carry a warm tint derived from `--color-primary` (`rgba(111, 46, 25, ...)`). Neutral gray or pure black shadows are prohibited.

## Shapes

- **Base Radius:** Inputs and buttons use `--radius` (0.5rem / 8px).
- **Container Radius:** Result cards and fieldsets use `--radius-lg` (0.75rem / 12px) and `.calc-card` uses `--radius-xl` (1rem / 16px).
- **Pill Radius:** Today's rate widget, status chips, and fallback badges use `--radius-full` (9999px).

## Components

### Navigation Tabs
- **Style:** Horizontal flex list with 1.75rem gap, 0.78rem uppercase labels, 0.05em letter spacing.
- **Active State:** Deep terracotta text color (`#6f2e19`) with 2px bottom accent border.
- **Focus:** 2px solid focus ring with 4px outline offset.

### Buttons
- **Primary:** Deep terracotta background (`#6f2e19`), white text, 0.9rem 1.85rem padding, 8px radius, subtle warm drop shadow.
- **Hover/Active:** Darker terracotta container (`#8c442e`) on hover; scale down to 0.97 on active press.
- **Secondary:** Transparent background, 1px border (`#dac1bb`), deep terracotta text.

### Inputs & Date Fields
- **Style:** Low surface container background (`#fdf1ee`), 1px transparent border, 8px radius, Work Sans bold text.
- **Hover:** Darkens slightly to `#f7ebe8`.
- **Focus:** White background (`#ffffff`), 3px warm focus ring (`rgba(111, 46, 25, 0.18)`).

### Result Cards
- **Structure:** Vertical flex container with 0.72rem uppercase label, mono date, mono numerical value, and descriptive caption.
- **Delta Cards:** High surface background (`#f1e6e3`) with dynamic green (`#e3ecc9`) or red (`#ffdad6`) tinting based on financial delta.

## Do's and Don'ts

### Do:
- **Do** use `repeat(auto-fit, minmax(240px, 1fr))` for card layouts to maintain visual balance regardless of card counts.
- **Do** preserve visible keyboard focus rings (`:focus-visible`) with 2-4px outline offsets on all interactive elements.
- **Do** use JetBrains Mono for all numeric values, dates, and rates.

### Don't:
- **Don't** use decorative 4px top stripes or side-tab accent lines on cards or callouts.
- **Don't** draw linear interpolation lines across unpopulated historical coverage gaps (e.g. 2010–2011).
- **Don't** use hard black (`#000000`) for text or borders; use `--color-on-surface` (`#201a19`) and `--color-outline-variant` (`#dac1bb`).
