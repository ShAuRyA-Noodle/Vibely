# Design Meta-Skill for Claude Code

A unified `/design` skill for [Claude Code](https://claude.ai/code) that bundles **11 design sub-skills** into a single command. When invoked, it activates all design knowledge simultaneously to produce the best possible output.

## What's Inside

| Sub-Skill | Category | Source |
|-----------|----------|--------|
| UI/UX Intelligence | 50+ styles, 161 color palettes, 57 font pairings, 99 UX rules | ui-ux-pro-max |
| Anti-Slop Rules | Eliminates generic AI defaults, banned fonts/icons/patterns | taste-skill + redesign-skill |
| Typography Systems | Font archetypes, weight hierarchy, line-length, tracking | compiled |
| Color Theory | 5 palette archetypes, semantic token architecture, dark mode | compiled |
| Layout Engineering | Double-Bezel cards, bento/z-axis/editorial-split layouts | taste-skill |
| Animation (GSAP + Framer) | Core, ScrollTrigger, timelines, React, spring physics | gsap-skills |
| Visual Style Archetypes | Agency-tier, Minimalist, Brutalist, Taste-Calibrated | taste-skill |
| Brand Identity & Design Systems | Token architecture, shadcn/ui, brand sync | ui-ux-pro-max |
| Specialized Tasks | Banners, icons, slides, social media, redesign workflow | ui-ux-pro-max |
| Pre-Delivery Checklist | Visual, motion, layout, a11y, content, code quality gates | compiled |
| Creative Arsenal | 30+ premium patterns: bento, magnetic buttons, scroll effects | taste-skill |

## Installation

### Option 1 — Clone directly into Claude Code skills folder

```bash
git clone https://github.com/Vdebug/design-skill.git ~/.claude/skills/design
```

### Option 2 — Manual copy

1. Download or clone this repo
2. Copy the `SKILL.md` file into `~/.claude/skills/design/SKILL.md`
   ```bash
   mkdir -p ~/.claude/skills/design
   cp SKILL.md ~/.claude/skills/design/SKILL.md
   ```

## Usage

Once installed, use it in any Claude Code session:

```
/design "landing page for a fintech SaaS"
/design "redesign my existing dashboard to feel premium"
/design "Instagram banner for a product launch"
/design "add scroll animations to my hero section"
/design "brutalist portfolio layout for a developer"
/design "design system tokens for my React app"
```

## What Gets Applied Simultaneously

When you run `/design`, Claude activates all 11 sections in parallel:

- **§1** — UI/UX priority rules (accessibility → touch → performance → layout → typography → animation)
- **§2** — Anti-slop enforcement (no Inter, no generic Lucide, no AI gradients, no Lorem Ipsum)
- **§3** — Typography: Geist, Outfit, Cabinet Grotesk, Satoshi — never defaults
- **§4** — Color: semantic tokens, 5 palette archetypes, tinted shadows
- **§5** — Layout: Double-Bezel cards, asymmetric grids, `min-h-[100dvh]`, `py-24`+ sections
- **§6** — Animation: GSAP ScrollTrigger, Framer Motion spring physics, stagger reveals
- **§7** — Style archetypes: Agency-tier / Minimalist / Brutalist / Taste-Calibrated
- **§8** — Brand & design system tokens
- **§9** — Specialized: banners, icons, slides, social images, redesign priority
- **§10** — Pre-delivery checklist (runs before every output)
- **§11** — Creative arsenal: 30+ premium patterns

## Sources

Compiled from:
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [greensock/gsap-skills](https://github.com/greensock/gsap-skills)
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- [bwPhD/awesome-notebookLM](https://github.com/bwPhD/awesome-notebookLM)
- [marcelodesignx.com](https://www.marcelodesignx.com/)
