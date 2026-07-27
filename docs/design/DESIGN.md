---
name: Precision Finance
colors:
  surface: '#fff8f6'
  surface-dim: '#e3d8d5'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf1ee'
  surface-container: '#f7ebe8'
  surface-container-high: '#f1e6e3'
  surface-container-highest: '#ebe0dd'
  on-surface: '#201a19'
  on-surface-variant: '#54433e'
  inverse-surface: '#352f2d'
  inverse-on-surface: '#faeeeb'
  outline: '#87736d'
  outline-variant: '#dac1bb'
  surface-tint: '#934933'
  primary: '#6f2e19'
  on-primary: '#ffffff'
  primary-container: '#8c442e'
  on-primary-container: '#ffc2b0'
  inverse-primary: '#ffb59f'
  secondary: '#88511b'
  on-secondary: '#ffffff'
  secondary-container: '#fdb475'
  on-secondary-container: '#78440e'
  tertiary: '#46413a'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e5851'
  on-tertiary-container: '#d8cfc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#75331e'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6c3a03'
  tertiary-fixed: '#ebe1d8'
  tertiary-fixed-dim: '#cec5bc'
  on-tertiary-fixed: '#1f1b16'
  on-tertiary-fixed-variant: '#4c463f'
  background: '#fff8f6'
  on-background: '#201a19'
  surface-variant: '#ebe0dd'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.03em
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system moves away from the cold, clinical nature of traditional fintech toward a "Humanist Professional" aesthetic. The brand personality is rooted in high trust and institutional stability, yet it is intentionally approachable and inviting. 

We employ a **Corporate / Modern** style infused with subtle **Tactile** elements to ground the digital experience in something that feels physical and reliable. The emotional response should be one of "calm confidence"—a sense that the user's finances are being handled with precision and care, without the anxiety often associated with money management.

## Colors
This design system utilizes a warm, sun-drenched palette to differentiate itself from the saturated blues of the fintech sector. 

- **Primary (Terracotta):** Used for primary actions and brand-defining moments. It provides a grounded, earth-toned authority.
- **Secondary (Amber):** Used for highlighting data trends, positive growth, and accents that require visibility without the urgency of a warning.
- **Neutral (Taupe/Warm Gray):** A sophisticated range of warm grays replaces standard neutrals. These are used for text and structural borders to maintain a soft but legible interface.
- **Success/Error:** Adjusted to higher-warmth tones (Olive Green and Brick Red) to harmonize with the core palette while maintaining strict WCAG AA accessibility standards for financial data.

## Typography
The typography strategy prioritizes clarity for complex data sets while maintaining a modern, refined character.

- **Headlines:** Manrope provides a contemporary, balanced look that feels both tech-forward and friendly.
- **Body:** Work Sans is selected for its exceptional legibility and neutral, grounded tone, making it ideal for long-form financial statements.
- **Data & Numbers:** JetBrains Mono is used sparingly for tabular data, transaction IDs, and currency amounts to provide a technical, "precise" feel that ensures numbers are easy to scan and compare.
- **Hierarchy:** Use tight letter spacing for large headlines to create a compact, premium feel. Expand letter spacing for uppercase labels to improve readability at small sizes.

## Layout & Spacing
The design system employs a **fixed grid** approach for desktop to convey a sense of structured reliability, transitioning to a **fluid grid** for mobile devices.

- **Grid:** A 12-column grid is used for desktop (1200px max-width). For mobile, a 4-column grid with 16px margins is standard.
- **Rhythm:** An 8px linear scale governs all padding and margin decisions. 
- **Density:** Financial dashboards should utilize "Moderate" density (16px spacing) to allow data to breathe, while transactional lists can use "Compact" density (8px spacing) to maximize information density without clutter.

## Elevation & Depth
To complement the warm palette, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

- **Surface Tiers:** Depth is primarily communicated through color shifts. The main background is the lightest warm-white, while containers and cards use a slightly deeper "Taupe-Tinted" surface.
- **Shadows:** Avoid harsh black shadows. Use soft, diffused shadows with a warm-tinted base (e.g., a dark Umber at 8% opacity). This creates an "organic" lift that feels like paper on a desk.
- **Interactive States:** Buttons and interactive cards should use a subtle 1px inner highlight on the top edge to simulate a tactile, "pressed" or "raised" physical edge.

## Shapes
The shape language is consistently **Rounded**, striking a balance between the rigid "sharp" corners of traditional banking and the overly "bubbly" feel of social apps.

- **Primary Elements:** Buttons, input fields, and standard cards use a 0.5rem (8px) radius.
- **Large Containers:** Dashboard widgets and main content areas use `rounded-xl` (1.5rem / 24px) to create soft, inviting frames for data.
- **Icons:** Use a medium-stroke weight (2px) with rounded caps and joins to match the component geometry.

## Components
- **Buttons:** Primary buttons use the Terracotta fill with white text. Secondary buttons use a Taupe outline with a transparent background. High-action buttons should feature a subtle "squishy" active state (slight scale down to 0.98).
- **Cards:** Use a 1px border in a light Taupe (`#E8E2DE`) rather than heavy shadows to define card boundaries. This keeps the interface clean and document-like.
- **Input Fields:** Fields should have a warm-tinted background (Surface color) to make them feel "filled" rather than empty. Focus states use a 2px Terracotta ring with a soft outer glow.
- **Chips/Badges:** For status indicators (e.g., "Pending", "Cleared"), use high-chroma warm tones with low-opacity backgrounds of the same hue to ensure the text remains the focal point.
- **Data Visuals:** Charts should exclusively use the Primary, Secondary, and Tertiary color scales. Avoid using cold blues or purples even in complex multi-line charts; use varying shades of Amber and Terracotta instead.