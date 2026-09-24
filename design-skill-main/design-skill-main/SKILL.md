---
name: design
description: "Master design meta-skill. Activates all design sub-skills simultaneously: UI/UX intelligence (50+ styles, 161 palettes, 57 font pairings), typography systems, color theory, animation (GSAP, Framer Motion, scroll-driven), layout engineering, brand identity, design systems/tokens, visual style archetypes (minimalist, brutalist, soft/agency-tier, taste-calibrated), banner design, icon design, slides, social media, and redesign/upgrade workflows. Use for any design task: website, landing page, dashboard, mobile app, banner, logo, social media image, presentation, or UI component. Applies all sub-skills in parallel to produce the best possible output."
argument-hint: "[design-type] [context] [style-preference]"
license: MIT
metadata:
  author: compiled-meta-skill
  version: "1.0.0"
  sources:
    - nextlevelbuilder/ui-ux-pro-max-skill
    - greensock/gsap-skills
    - Leonxlnx/taste-skill
    - marcelodesignx.com
    - bwPhD/awesome-notebookLM
---

# Design — Master Meta-Skill

When this skill is activated, apply ALL sub-skills below simultaneously. Do not pick one — synthesize all of them into the best possible output for the user's request.

---

## ACTIVATION PROTOCOL

When the user asks for any design task:

1. **Identify task type** from the request (UI, banner, brand, animation, etc.)
2. **Activate all relevant sub-skills** from the sections below in parallel
3. **Cross-apply rules** — e.g. typography rules from §3 apply inside every UI component from §1
4. **Run the Pre-Delivery Checklist** (§10) before outputting
5. **Never produce generic AI defaults** — enforce all anti-slop rules from §2 and §7

---

## §1 — UI/UX INTELLIGENCE (from ui-ux-pro-max)

Comprehensive design guidance for web and mobile. 50+ styles, 161 color palettes, 57 font pairings, 99 UX guidelines.

### When to Apply
- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components
- Choosing color schemes, typography, spacing, or layout systems
- Reviewing UI for accessibility, visual consistency, or user experience
- Implementing navigation, animations, or responsive behavior

### Design System Workflow

**Step 1 — Analyze Requirements**
Extract: product type, target audience, style keywords, tech stack.

**Step 2 — Generate Design System**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <keywords>" --design-system -p "Project Name"
```
Returns: pattern, style, colors, typography, effects, anti-patterns.

**Step 3 — Supplement with Domain Searches**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>
```

| Domain | Use For |
|--------|---------|
| `product` | Product type recommendations |
| `style` | UI styles, glassmorphism, brutalism, etc. |
| `typography` | Font pairings, Google Fonts |
| `color` | Color palettes by industry |
| `landing` | Page structure, CTA strategies |
| `chart` | Chart types, data visualization |
| `ux` | Best practices, anti-patterns |
| `react` | React/Next.js performance |

### UX Priority Rules (apply in this order)

| Priority | Category | Key Rules |
|----------|----------|-----------|
| 1 | Accessibility | Contrast 4.5:1, alt text, keyboard nav, aria-labels |
| 2 | Touch & Interaction | Min 44×44px targets, 8px+ spacing, loading feedback |
| 3 | Performance | WebP/AVIF, lazy loading, CLS < 0.1 |
| 4 | Style Selection | Match product type, consistency, SVG icons only |
| 5 | Layout & Responsive | Mobile-first, no horizontal scroll, viewport meta |
| 6 | Typography & Color | 16px base, 1.5 line-height, semantic tokens |
| 7 | Animation | 150–300ms micro-interactions, transform/opacity only |
| 8 | Forms & Feedback | Visible labels, inline errors, loading states |
| 9 | Navigation | Predictable back, bottom nav ≤5, deep linking |
| 10 | Charts & Data | Legends, tooltips, accessible colors |

---

## §2 — ANTI-SLOP / AI-TELL ELIMINATION (from taste-skill + redesign-skill)

These rules override all defaults. Enforce them on every output.

### Banned Visual Patterns
- **NO** Inter, Roboto, Arial, Open Sans fonts → use Geist, Outfit, Cabinet Grotesk, Satoshi, Plus Jakarta Sans
- **NO** Lucide/Feather icons as default → use Phosphor (Bold/Fill) or Radix UI Icons
- **NO** pure `#000000` backgrounds → use off-black, zinc-950, charcoal
- **NO** oversaturated accent colors → saturation < 80%
- **NO** purple/blue "AI gradient" aesthetic → use neutral bases + single considered accent
- **NO** `box-shadow` neon/outer glows → use inner borders or tinted shadows
- **NO** excessive gradient text on headers
- **NO** emojis in code, markup, or alt text → replace with SVG icons or Phosphor
- **NO** generic stock placeholder names (John Doe, Acme Corp, SmartFlow)
- **NO** AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer"
- **NO** Lorem Ipsum → write real draft copy

### Banned Layout Patterns
- **NO** 3-column equal card layouts → use 2-col zig-zag, asymmetric grid, or horizontal scroll
- **NO** `height: 100vh` for hero sections → use `min-h-[100dvh]`
- **NO** complex flexbox percentage math → use CSS Grid
- **NO** centered hero/H1 when DESIGN_VARIANCE > 4 → use split-screen or left-aligned

### Banned Motion Patterns
- **NO** `linear` or `ease-in-out` transitions → use custom cubic-bezier
- **NO** animating `top`, `left`, `width`, `height` → use `transform` and `opacity` only
- **NO** `window.addEventListener('scroll')` → use IntersectionObserver or GSAP ScrollTrigger

### Active Baseline (applies globally unless user overrides)
- `DESIGN_VARIANCE: 8` (asymmetric, varied layouts)
- `MOTION_INTENSITY: 6` (fluid CSS + spring physics)
- `VISUAL_DENSITY: 4` (daily app mode, breathable)

---

## §3 — TYPOGRAPHY SYSTEMS

### Font Selection Rules
- **Display/Headlines:** Geist, Outfit, Cabinet Grotesk, Satoshi, Clash Display, PP Editorial New
- **Editorial/Creative Headlines:** Newsreader, Playfair Display, Instrument Serif, Lyon Text
- **Body/UI:** SF Pro Display, Geist Sans, Helvetica Neue, Switzer
- **Monospace/Code:** Geist Mono, SF Mono, JetBrains Mono

### Typography Specs
- Headlines: `text-4xl md:text-6xl tracking-tighter leading-none`
- Body: `text-base leading-relaxed max-w-[65ch]` (line-height 1.5–1.75)
- Line length: 35–60 chars mobile, 60–75 chars desktop
- Body text: never absolute `#000000` → use `#111111` or `#2F3437`
- Secondary text: `#787774`
- Numbers in data tables: use `font-variant-numeric: tabular-nums`
- Negative tracking for large headers, positive tracking for labels/caps
- Use `text-wrap: balance` to fix orphaned words

### Weight Hierarchy
- Headings: 600–700 (Bold/SemiBold)
- Body: 400 (Regular)
- Labels/UI: 500 (Medium)
- Never only Regular + Bold; introduce Medium (500) and SemiBold (600)

### Typographic Archetypes (pick based on project)
| Archetype | Heading Font | Body Font | Use For |
|-----------|-------------|-----------|---------|
| Modern SaaS | Geist | Geist Sans | Dashboards, tools |
| Editorial Luxury | Instrument Serif | Switzer | Agency, lifestyle |
| Technical/Code | JetBrains Mono | Geist | Dev tools, terminals |
| Minimalist | Newsreader | SF Pro Display | Portfolios, docs |
| Brutalist | Neue Haas Grotesk Black | IBM Plex Mono | Data-heavy, portfolios |

---

## §4 — COLOR THEORY & SYSTEMS

### Core Rules
- Max 1 accent color. Saturation < 80%.
- Stick to ONE gray family (all warm OR all cool, never mixed)
- Define semantic tokens: `--color-primary`, `--color-surface`, `--color-on-surface`
- Never hardcode hex in components; always use CSS variables
- Tint shadows to match background hue (not pure black opacity)
- Dark mode: use desaturated/lighter tonal variants, not inverted colors

### Palette Archetypes
**Ethereal Glass (SaaS/AI/Tech):**
- BG: `#050505` (OLED black)
- Cards: vantablack + `backdrop-blur-2xl` + `border border-white/10`
- Accent: single glowing orb color (emerald, electric blue, or deep rose)

**Editorial Luxury (Agency/Lifestyle):**
- BG: `#FDFBF7` warm cream
- Surfaces: `#FFFFFF` or `#F9F9F8`
- Accent: deep espresso tone or muted sage
- Texture: CSS noise/film-grain overlay at `opacity: 0.03`

**Soft Structuralism (Consumer/Health/Portfolio):**
- BG: silver-grey or pure white
- Text: `#111111` headers, `#787774` secondary
- Borders: `1px solid #EAEAEA`
- Shadows: ultra-diffuse, < 0.05 opacity

**Brutalist Industrial (Data/Portfolios):**
Light mode: BG `#F4F4F0`, FG `#050505`, accent `#E61919` only
Dark mode: BG `#0A0A0A`, FG `#EAEAEA`, accent `#E61919` only

**Minimalist Warm Monochrome:**
- BG: `#FFFFFF` or `#F7F6F3`
- Accent pastels: Pale Red `#FDEBEC`, Pale Blue `#E1F3FE`, Pale Green `#EDF3EC`, Pale Yellow `#FBF3DB`
- All sections must have depth: subtle imagery, ambient radial gradients, or noise patterns

### Dark Mode Checklist
- Primary text ≥4.5:1 contrast
- Secondary text ≥3:1 contrast
- Borders/dividers visible in both modes
- Modal scrim: 40–60% black opacity
- Test both themes independently before delivering

---

## §5 — LAYOUT & SPATIAL ENGINEERING

### Core Layout Rules
- Mobile-first: start at 375px, scale to 768/1024/1440
- Container: `max-w-[1400px] mx-auto` or `max-w-7xl`
- Section padding: minimum `py-24`, preferably `py-32`–`py-40` (let it breathe)
- Spacing system: 4pt/8dp increments
- Z-index scale: 0 / 10 / 20 / 40 / 100 / 1000 (never arbitrary `z-9999`)

### Layout Archetypes (choose based on DESIGN_VARIANCE)
**Asymmetric Bento:** CSS Grid, varying `col-span`/`row-span`, masonry feel
**Z-Axis Cascade:** Elements overlap with slight rotations (`-2deg`, `3deg`), physical card depth
**Editorial Split:** Large typography left half, interactive content right half

### Anti-Pattern Fixes
- Broken by 3-equal-columns → use 2-col zig-zag or asymmetric grid
- Centered hero → split screen or left-aligned
- Flat sections → add background imagery at low opacity, ambient gradients, noise textures
- Equal card heights by flexbox → use CSS Grid or allow variable heights
- Overlapping fixed elements → add `padding-bottom` equal to fixed bar height

### Double-Bezel Architecture (for premium cards/containers)
Every major card must use nested enclosures:
```html
<!-- Outer shell -->
<div class="p-1.5 rounded-[2rem] ring-1 ring-black/5 bg-black/5">
  <!-- Inner core -->
  <div class="rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
    <!-- Content -->
  </div>
</div>
```

---

## §6 — ANIMATION & MOTION (from GSAP + Framer Motion + taste-skill)

### Core Animation Rules
- Duration: 150–300ms micro-interactions, complex ≤400ms, never >500ms
- Easing: ease-out for enter, ease-in for exit, never linear
- Always use `transform` and `opacity` — never animate `width`, `height`, `top`, `left`
- All animations must be interruptible
- Respect `prefers-reduced-motion`
- Never block user input during animation

### GSAP Core API
```javascript
// Basic tween
gsap.to(".element", { x: 100, opacity: 1, duration: 0.8, ease: "power3.out" });
gsap.from(".element", { y: 40, opacity: 0, duration: 0.6, ease: "power2.out" });
gsap.fromTo(".element", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });

// Stagger (never mount all at once)
gsap.to(".item", { opacity: 1, y: 0, stagger: 0.08, ease: "power2.out" });

// Key eases
ease: "power1.out"        // default
ease: "power3.inOut"      // smooth emphasis
ease: "back.out(1.7)"     // overshoot
ease: "elastic.out(1, 0.3)" // spring feel
```

### GSAP ScrollTrigger (Scroll-Driven Animation)
```javascript
gsap.to(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",
    end: "bottom 20%",
    scrub: true,
    toggleActions: "play none none reverse"
  },
  opacity: 1,
  y: 0
});
```

### GSAP Timeline (Sequenced Animation)
```javascript
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 } });
tl.from(".hero-title", { y: 60, opacity: 0 })
  .from(".hero-subtitle", { y: 40, opacity: 0 }, "-=0.3")
  .from(".hero-cta", { y: 20, opacity: 0 }, "-=0.2");
```

### GSAP React Pattern
```javascript
// Always use useGSAP() hook, never bare useEffect
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

function Component() {
  const containerRef = useRef(null);
  useGSAP(() => {
    gsap.from(".item", { y: 30, opacity: 0, stagger: 0.1 });
  }, { scope: containerRef });
  return <div ref={containerRef}>...</div>;
}
```

### Framer Motion (React UI Animations)
```javascript
// Spring physics — always prefer over linear
const springConfig = { type: "spring", stiffness: 100, damping: 20 };

// Stagger orchestration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Magnetic button (use MotionValue, never useState for hover)
const x = useMotionValue(0);
const y = useMotionValue(0);
```

### Motion Archetypes by Context
| Context | Library | Technique |
|---------|---------|-----------|
| Scroll-driven storytelling | GSAP + ScrollTrigger | Parallax, scrub, pin |
| UI state transitions | Framer Motion | Layout, layoutId, AnimatePresence |
| 3D / Canvas backgrounds | Three.js + useEffect | Isolated, strict cleanup |
| Simple hover/enter | CSS + cubic-bezier | transform + opacity only |

**CRITICAL:** Never mix GSAP and Framer Motion in the same component. Use GSAP exclusively for scroll/canvas, Framer Motion for UI interactions.

### Premium Motion Patterns
- **Staggered reveal:** `animation-delay: calc(var(--index) * 80ms)` via CSS cascade
- **Magnetic button:** mouse-tracking translate via `useMotionValue`
- **Scroll progress SVG path:** draw on SVG as user scrolls
- **Liquid Glass:** `backdrop-blur` + `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- **Exit faster than enter:** exit animations at 60–70% of enter duration
- **Scale feedback on press:** `active:scale-[0.98]` or `active:-translate-y-[1px]`

---

## §7 — VISUAL STYLE ARCHETYPES

Choose ONE archetype per project and commit to it fully. Never mix.

### 7A — High-End Agency Tier (soft-skill / Awwwards)
**Persona:** $150k+ agency-level experiences

**Vibe Archetypes:**
1. **Ethereal Glass:** OLED black, radial mesh gradients, heavy backdrop-blur, hairline borders
2. **Editorial Luxury:** Warm creams, variable serif headlines, CSS noise grain, muted sage accents
3. **Soft Structuralism:** Silver-grey/white, massive Grotesk type, floating components, ambient diffused shadows

**Motion:** Custom cubic-bezier `cubic-bezier(0.32,0.72,0,1)`, floating glass pill nav, staggered mask reveals, magnetic button hover physics

### 7B — Taste-Calibrated Frontend (taste-skill)
**For:** React/Next.js with Tailwind. Uses metric-based variance dials.

**Stack Rules:**
- Framework: React/Next.js, default Server Components
- Styling: Tailwind CSS (check v3 vs v4 before using v4 syntax)
- Icons: `@phosphor-icons/react` or `@radix-ui/react-icons` exclusively
- Interactive components: must be isolated Client Components with `'use client'`
- Global motion: Framer Motion `useMotionValue` (never `useState` for hover)

### 7C — Minimalist Editorial (minimalist-skill)
**For:** Workspace platforms, documentation, portfolios

**Rules:**
- Extreme typographic contrast as primary aesthetic
- Warm monochrome + spot pastels only
- Cards: `border: 1px solid #EAEAEA`, `border-radius: 8–12px`, `padding: 24–40px`
- Buttons: `bg-[#111111] text-white`, `border-radius: 4–6px`, no box-shadow
- Sections: `py-24`–`py-32`, max-width `4xl`–`5xl`
- Motion: invisible sophistication — `translateY(12px)` + `opacity: 0` resolving over 600ms

### 7D — Industrial Brutalism (brutalist-skill)
**For:** Data-heavy dashboards, editorial portfolios, declassified-blueprint aesthetics

**Rules:**
- Pick ONE mode: Swiss Industrial Print (light) OR Tactical Telemetry (dark)
- Macro-typography: `clamp(4rem, 10vw, 15rem)`, uppercase, tracking `-0.03em` to `-0.06em`
- Micro-typography: monospace, 10–14px, uppercase, tracking `0.05em`–`0.1em`
- Color: Max 2 colors (background/foreground) + `#E61919` red accent ONLY
- Layout: CSS Grid strict adherence, `1px`/`2px solid` borders, zero `border-radius`
- Effects: CRT scanlines via `repeating-linear-gradient`, noise via SVG filter, halftone

### 7E — Design Taste Intelligence (gpt-tasteskill)
Reference: stitch-skill from Leonxlnx/taste-skill
Applies systematic taste calibration using design variance dials, anti-AI-tell filters, and creative arsenal patterns. Activates automatically with any design task.

---

## §8 — BRAND IDENTITY & DESIGN SYSTEMS

### Brand Identity Workflow
1. **Brand voice** — tone, messaging framework, consistency rules
2. **Visual identity** — color palette management, typography specs, logo usage
3. **Asset sync:**
   ```bash
   node scripts/inject-brand-context.cjs  # Inject brand into prompts
   node scripts/sync-brand-to-tokens.cjs  # Sync brand-guidelines.md → tokens
   node scripts/extract-colors.cjs --palette  # Extract/compare colors
   ```

### Design Token Architecture (Three-Layer)
```css
/* Layer 1 — Primitive */
--color-blue-600: #2563EB;

/* Layer 2 — Semantic */
--color-primary: var(--color-blue-600);

/* Layer 3 — Component */
--button-bg: var(--color-primary);
```

**Rules:**
- Never use raw hex in components — always reference tokens
- Semantic layer enables theme switching
- Use HSL for opacity control
- Tailwind integration: reference `references/tailwind-integration.md`

### shadcn/ui + Tailwind Setup
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog form
```
**CRITICAL:** Never use shadcn in its generic default state — customize radii, colors, and shadows to match project aesthetic.

---

## §9 — SPECIALIZED DESIGN TASKS

### Banner Design
Sizes reference:
| Platform | Size |
|----------|------|
| Twitter/X Header | 1500×500 |
| LinkedIn Personal | 1584×396 |
| Instagram Story | 1080×1920 |
| Instagram Post | 1080×1080 |
| YouTube Channel Art | 2560×1440 |
| Website Hero | 1920×600-1080 |
| Google Ads Leaderboard | 728×90 |

Top styles: Minimalist, Bold Typography, Gradient, Photo-Based, Geometric, Glassmorphism, Neon/Cyberpunk
Rules: Critical content in central 70–80%, one CTA per banner, max 2 fonts, text < 20% for ads

### Icon Design
15 styles, SVG output. Top styles:
| Style | Best For |
|-------|---------|
| outlined | UI interfaces, web apps |
| filled | Mobile apps, nav bars |
| duotone | Marketing, landing pages |
| gradient | Modern brands, SaaS |
| sharp | Tech, fintech, enterprise |

### Slides / Presentations
- HTML presentations with Chart.js, design tokens, responsive layouts
- Always import `assets/design-tokens.css` and use `var()` exclusively
- Chart.js for all charts (never CSS-only bars)
- Include keyboard navigation and progress bar

### Social Media Images
| Platform | Size |
|----------|------|
| IG Post | 1080×1080 |
| IG Story | 1080×1920 |
| FB Post | 1200×630 |
| X Post | 1200×675 |
| LinkedIn | 1200×627 |
| Pinterest | 1000×1500 |
| YouTube Thumb | 1280×720 |

### Redesign / Upgrade Workflow
Apply in this order for maximum impact:
1. **Font swap** — biggest instant improvement, lowest risk
2. **Color palette cleanup** — remove clashing/oversaturated
3. **Hover and active states** — makes it feel alive
4. **Layout and spacing** — grid, max-width, consistent padding
5. **Replace generic components** — swap cliché patterns
6. **Add loading, empty, error states** — makes it feel finished
7. **Polish typography scale** — final premium touch

### Presentation Style Prompts (from awesome-notebookLM)
| Style | Key Elements |
|-------|-------------|
| Modern Newspaper | Swiss/Bauhaus, asymmetric layouts, 10:1 type ratio, negative space |
| Editorial Luxury | High-contrast variable serif, color-blocked layouts |
| Tech/Neon | Constructivist principles, monochrome photography |
| Sports | Diagonal cuts, italic typography, action photography |
| Minimalist | Anti-gravity whitespace, calm authority |
| Pop/Youth | Cutout photography, asymmetric text, amoeba shapes |

---

## §10 — PRE-DELIVERY CHECKLIST (run before every output)

### Visual Quality
- [ ] No banned fonts (Inter/Roboto/Arial), banned icons (generic Lucide), banned patterns
- [ ] Single accent color, saturation < 80%, no purple/blue AI gradient
- [ ] Shadows are tinted to background hue, not pure black
- [ ] All cards use Double-Bezel or intentional surface treatment
- [ ] Sections have visual depth (imagery, gradients, or texture) — no empty flat backgrounds
- [ ] Font pairing applied with proper scale hierarchy

### Interaction & Motion
- [ ] All tappable elements have pressed feedback (`scale-[0.98]` or `translateY(1px)`)
- [ ] Micro-interaction timing: 150–300ms, custom cubic-bezier
- [ ] Animations use ONLY `transform` and `opacity`
- [ ] Scroll reveals use IntersectionObserver or GSAP ScrollTrigger (NOT window.scroll)
- [ ] Loading, empty, and error states exist for all data views
- [ ] Disabled states are visually distinct

### Layout & Responsive
- [ ] Hero sections use `min-h-[100dvh]` not `h-screen`
- [ ] Layout collapses gracefully below 768px to single-column
- [ ] Max-width container applied (`max-w-7xl` or similar)
- [ ] Section padding minimum `py-24`
- [ ] No horizontal scroll on mobile
- [ ] 4/8dp spacing rhythm maintained

### Accessibility
- [ ] Color contrast ≥4.5:1 for normal text, ≥3:1 for large text
- [ ] All interactive elements have visible focus rings
- [ ] No color-only information conveyance
- [ ] Images have descriptive alt text
- [ ] Form fields have visible labels (never placeholder-only)
- [ ] Reduced-motion respected

### Content
- [ ] No generic placeholder names, no Lorem Ipsum
- [ ] No AI copywriting clichés
- [ ] No emojis used as icons
- [ ] Favicons included in web projects
- [ ] Meta tags present (`title`, `description`, `og:image`)

### Code Quality
- [ ] Semantic HTML used (`<nav>`, `<main>`, `<article>`, `<section>`)
- [ ] All imports verified against package.json
- [ ] No arbitrary z-index values (use scale: 10/20/40/100/1000)
- [ ] No inline styles mixed with CSS classes
- [ ] Interactive Client Components properly isolated (Next.js `'use client'`)

---

## §11 — CREATIVE ARSENAL (High-End Patterns)

Pull from this library to avoid generic AI outputs:

### Navigation
- Mac OS Dock Magnification nav
- Magnetic button (cursor-pull physics)
- Gooey Menu (viscous detach effect)
- Dynamic Island (morphing pill status)
- Mega Menu Reveal (stagger-fade full-screen dropdown)
- Floating glass pill navbar (detached, `mt-6 mx-auto rounded-full`)

### Layout
- Bento Grid (asymmetric tile-based, Apple Control Center style)
- Masonry Layout (staggered grid, variable row heights)
- Chroma Grid (animated color gradient borders)
- Split Screen Scroll (two halves in opposite directions)
- Curtain Reveal (hero parting like a curtain on scroll)

### Cards & Containers
- Parallax Tilt Card (3D mouse-tracking)
- Spotlight Border Card (border illuminates under cursor)
- Holographic Foil Card (iridescent rainbow shift on hover)
- Glassmorphism Panel: `backdrop-blur` + `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- Morphing Modal (button expands to full-screen dialog)

### Scroll Animations
- Sticky Scroll Stack (cards physically stack on scroll)
- Horizontal Scroll Hijack (vertical → horizontal gallery pan)
- Zoom Parallax (background zooms on scroll)
- Scroll Progress SVG Path (vectors draw themselves)
- Locomotive Scroll Sequence (video frames tied to scroll)

### Typography Effects
- Kinetic Marquee (endless bands, speed-up on scroll)
- Text Mask Reveal (typography as video window)
- Text Scramble Effect (matrix character decode on hover)
- Gradient Stroke Animation (outlined text with moving gradient)
- Variable font animation (weight/width interpolation on hover)

### Micro-Interactions
- Particle Explosion Button (CTA shatters into particles on success)
- Skeleton Shimmer (shifting light across placeholder boxes)
- Directional Hover Fill (fill enters from exact cursor entry side)
- Ripple Click Effect (waves from exact click coordinates)
- Mesh Gradient Background (organic lava-lamp animated blobs)
- Grain/Noise Overlay: fixed `pointer-events-none` pseudo-element only

---

## USAGE EXAMPLES

```
/design "landing page for a fintech SaaS"
/design "redesign my existing dashboard to feel premium"
/design "Instagram banner for a product launch"
/design "design system tokens for my React app"
/design "add scroll animations to my hero section"
/design "brutalist portfolio layout for a developer"
```

When invoked, Claude synthesizes all relevant sections above simultaneously and outputs the best possible design for the request — applying UX rules, typography systems, color theory, motion design, and anti-slop filters all at once.
