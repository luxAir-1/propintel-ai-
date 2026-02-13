# PropIntel AI - Design System

## 🎨 Aesthetic Direction

**Refined Data Intelligence + Luxury Finance**

PropIntel's design reflects the sophistication of professional real estate investing. The visual language prioritizes clarity, precision, and subtle luxury—avoiding generic SaaS aesthetics in favor of an investment-grade interface.

---

## Color Palette

### Primary Colors

| Color | RGB | Usage |
|-------|-----|-------|
| **Slate 950** | #0f172a | Background (dark mode primary) |
| **Slate 900** | #1e293b | Cards, surfaces |
| **Slate 700** | #334155 | Borders, dividers |

### Accent Colors

| Color | RGB | Usage |
|-------|-----|-------|
| **Teal 500** | #06b6d4 | Primary CTA, interactive elements |
| **Teal 600** | #0891b2 | Hover states, focus |
| **Amber 500** | #f59e0b | Investment signals, highlights |
| **Emerald 500** | #10b981 | Positive metrics, success states |

### Semantic Colors

```css
--success: #10b981 (emerald)    /* Excellent deals, positive metrics */
--warning: #f59e0b (amber)      /* Moderate ROI, caution */
--danger: #ef4444 (red)         /* Poor deals, errors */
--info: #06b6d4 (teal)          /* Neutral information */
```

---

## Typography

### Font Selection

**Display Font**: Playfair Display
- Serif, elegant, refined
- Used for: H1, H2, H3, branded text
- Weight: 400, 500, 600, 700

**Body Font**: Inter
- Clean, readable, modern
- Used for: Body text, UI labels, buttons
- Weight: 400, 500, 600

### Typographic Scale

```
H1: 48px / 3rem (md: 64px / 4rem)
H2: 36px / 2.25rem (md: 48px / 3rem)
H3: 30px / 1.875rem
H4: 24px / 1.5rem
Body: 16px / 1rem
Small: 14px / 0.875rem
Tiny: 12px / 0.75rem
```

### Line Heights

- Display (H1-H2): 1.2
- Headings (H3-H4): 1.3
- Body: 1.5
- Compact: 1.4

---

## Spacing System

```
Base unit: 4px

0.5rem (8px)
1rem (16px)
1.5rem (24px)
2rem (32px)
3rem (48px)
4rem (64px)
6rem (96px)
8rem (128px)
```

### Component Padding

- **Buttons**: 12px 24px (py-3 px-6)
- **Cards**: 24px (p-6)
- **Sections**: 80px vertical (py-20 md:py-32)
- **Containers**: 16px (px-4 sm:px-6 lg:px-8)

---

## Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Start Free Trial
</button>
```
- Background: Teal 500
- Hover: Teal 600
- Padding: py-3 px-6
- Border radius: lg (8px)
- Font weight: medium

#### Secondary Button
```tsx
<button className="btn-secondary">
  Learn More
</button>
```
- Background: Slate 800
- Border: 1px Slate 700
- Hover: Slate 700

### Cards

#### Data Card (Glass Effect)
```tsx
<div className="data-card">
  {/* Content */}
</div>
```
- Background: Slate 900/40 with backdrop blur
- Border: 1px Slate 700/50
- Padding: 24px (p-6)
- Border radius: xl (12px)
- Hover: Border teal with shadow

### Badges

#### Score Badge
```tsx
<ScoreBadge score={87} />
```
- Size: 96px (w-24 h-24)
- Animation: Soft pulse
- Font: Bold, centered
- Label: Score-based color gradient

#### Status Badge
```tsx
<span className="inline-block px-3 py-1 rounded bg-teal-500/10 text-teal-400 text-xs font-bold">
  Excellent
</span>
```

### Forms

#### Input Fields
```tsx
<input
  type="email"
  className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
/>
```
- Background: Slate 900
- Border: Slate 700
- Focus: Teal border + ring
- Padding: py-3 px-4

---

## Animations & Motion

### Micro-interactions

#### Page Load Reveal
```css
@keyframes metric-reveal {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

animation: metric-reveal 0.6s ease-out forwards;
```

#### Score Badge Pulse
```css
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

animation: pulse-soft 2s infinite;
```

#### Hover Lift
```tsx
hover:shadow-lg hover:scale-105 transition-all
```

### Staggered List Animations
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }}
>
  {items.map((item) => (
    <motion.div variants={itemVariants}>{item}</motion.div>
  ))}
</motion.div>
```

### Transition Timing

- Quick interactions: 150ms
- Micro-animations: 300ms
- Page transitions: 500-600ms
- Complex animations: 800ms+

---

## Layouts

### Grid System

```
Mobile: 1 column
Tablet (md): 2 columns
Desktop (lg): 3+ columns
```

### Container Widths

```
max-w-sm  (384px)
max-w-md  (448px)
max-w-lg  (512px)
max-w-2xl (672px)   /* Default */
max-w-4xl (896px)   /* Content */
max-w-7xl (1280px)  /* Full */
```

### Spacing Between Sections

```
Hero → Features: 64px (py-16)
Features → Pricing: 80px (py-20 md:py-32)
Pricing → CTA: 80px
CTA → Footer: Automatic
```

---

## Accessibility

### Color Contrast

- Normal text: 4.5:1 (WCAG AA)
- Large text: 3:1 (WCAG AA)
- Focus indicators: 3:1 minimum

### Focus States

```css
focus-visible:outline-2
focus-visible:outline-offset-2
focus-visible:outline-teal-500
```

### Keyboard Navigation

- Tab order logical (left-to-right, top-to-bottom)
- Skip links for navigation
- Modal focus trapping
- Escape key closes dialogs

### Screen Reader

- Semantic HTML (header, main, nav, section)
- ARIA labels for icons
- Form labels associated with inputs
- Alt text for images

---

## Dark Mode (Default)

PropIntel uses dark mode as the primary theme:

```css
html {
  color-scheme: dark;
}

body {
  @apply bg-slate-950 text-slate-100;
}
```

### Override for Light Mode (Future)

```css
html:not(.dark) {
  color-scheme: light;
  @apply bg-white text-slate-950;
}
```

---

## Using the Design System

### Tailwind Classes

```tsx
// Colors
text-teal-500       /* Text */
bg-slate-900        /* Background */
border-slate-700    /* Border */

// Spacing
p-6                 /* Padding */
px-4 py-3           /* X/Y padding */
mb-4                /* Margin bottom */
gap-8               /* Grid/flex gap */

// Typography
font-display        /* Playfair Display */
text-2xl            /* Size */
font-bold           /* Weight */
tracking-widest     /* Letter spacing */

// Layout
grid-cols-3         /* Grid columns */
max-w-7xl           /* Container */
mx-auto             /* Center */

// Interactive
hover:bg-slate-700
focus:border-teal-500
transition-all
```

### Custom Utilities

```css
/* glass-effect: Frosted glass backdrop */
.glass-effect {
  @apply bg-slate-900/40 backdrop-blur-md border border-slate-700/50;
}

/* luxury-gradient: Background gradient */
.luxury-gradient {
  @apply bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950;
}

/* data-card: Standard card container */
.data-card {
  @apply glass-effect rounded-xl p-6 hover:border-teal-500/30 transition-all;
}

/* score-badge: Deal score display */
.score-badge {
  @apply inline-flex items-center justify-center w-16 h-16 rounded-full;
  @apply font-bold text-lg bg-gradient-to-br from-amber-500 to-amber-600;
  @apply text-slate-950 shadow-lg;
}
```

---

## Responsive Design

### Breakpoints

```
Default (mobile):    0px
sm (small):         640px
md (medium):        768px
lg (large):        1024px
xl (extra large):  1280px
2xl (2x large):    1536px
```

### Mobile-First Approach

```tsx
// Default is mobile
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3">
  {/* Stacks on mobile, row on tablet, 3-col grid on desktop */}
</div>
```

---

## Performance Guidelines

### CSS

- Minimal custom CSS (rely on Tailwind)
- CSS variables for theme (future)
- Avoid deep nesting

### Images

- Use Next.js `<Image>` component
- Responsive sizing (sizes prop)
- Lazy load (default)
- WebP format

### Animations

- Prefer CSS animations
- Use GPU-accelerated transforms
- Limit to 60fps (duration < 1s for complex)
- Prefers-reduced-motion support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Component Library

### Built Components

- **ScoreBadge**: Investment score display with color coding
- **DealCard**: Property listing card with metrics
- **Navigation**: Header with mobile menu
- **Hero**: Page hero section with animated metrics
- **Features**: Feature grid showcase
- **Pricing**: Subscription plan cards
- **CTA**: Call-to-action sections
- **Footer**: Site footer

### To Build

- Modal/Dialog
- Dropdown Menu
- Tooltip
- Toast Notifications
- Tabs
- Accordion
- Breadcrumbs
- Pagination
- Search/Filter
- Charts (Recharts integration)

---

## Brand Voice

### Visual Tone

- **Professional**: Investor-grade, trustworthy
- **Modern**: Clean, not outdated
- **Sophisticated**: Refined luxury, not flashy
- **Data-Driven**: Focus on clarity and precision

### Do's

✅ Use generous whitespace
✅ Prioritize readability
✅ Show real data clearly
✅ Use animation purposefully
✅ Maintain consistency

### Don'ts

❌ Don't use generic purple/blue gradient
❌ Don't overcomplicate layouts
❌ Don't add unnecessary animations
❌ Don't use stock imagery
❌ Don't sacrifice performance for aesthetics

---

## Future Enhancements

- [ ] Light mode toggle
- [ ] Custom theme colors (per user)
- [ ] Accessibility audit (WCAG AAA)
- [ ] Design tokens (CSS variables)
- [ ] Storybook component catalog
- [ ] Dark mode variants for all components
- [ ] Figma design tokens sync
