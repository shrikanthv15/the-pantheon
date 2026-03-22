# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"The Pantheon" — an autonomous AI newsroom dashboard. A single-page Next.js app that visualizes a three-agent pipeline (Kratos → Loki → Mimir) which scrapes AI news, processes it, and publishes articles. The frontend is a dark-mode-only command-center UI with real-time pipeline status, agent cards, log feeds, article feeds, and system metrics.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui (new-york style) + Framer Motion + Recharts

**Data layer:** All data is currently placeholder, defined in `lib/supabase.ts`. Supabase client is commented out — `@supabase/supabase-js` is not yet in dependencies. Async query functions (`getAgents`, `getArticles`, `getLogs`, etc.) exist but return hardcoded data. The plan is to connect to a cloud Supabase instance.

**Page structure:** Single page at `app/page.tsx` ('use client') renders 8 sections in order:
1. `Navigation` — sticky nav with scroll-spy active section highlighting
2. `HeroSection` — pipeline visualization with `AgentNode` + `PipelineLine`, countdown timer, trigger button
3. Agent Detail Cards — grid of `AgentCard` components with SVG avatars and sparklines
4. `LogFeed` — terminal-style log viewer with pause/clear/copy/download controls
5. `OracleFeed` — filterable/searchable article grid using `ArticleCard` components
6. `MetricsPanel` — three-column metrics: token economy, pipeline performance (bar chart), agent health
7. `LogTicker` — compact scrolling log ticker
8. `Footer` — with `MiniPipelineVisualization`

**Design system:** Dark-mode only. Custom CSS variables in `app/globals.css` define the palette. Agent colors: Kratos=#f59e0b (amber), Loki=#06b6d4 (cyan), Mimir=#8b5cf6 (violet). Custom animations: grid-background, scanlines, glow effects, pulse-glow, cursor-blink, travel-dot.

**Types:** All shared types in `types/index.ts` — `Agent`, `Article`, `LogEntry`, `PipelineState`, `AgentMetrics`.

**Duplicate CSS:** `styles/globals.css` contains default shadcn theme (light+dark, oklch). The actual theme used is `app/globals.css`. Only `app/globals.css` is imported in the layout.

## Key Gotchas

- `next.config.mjs` has `ignoreBuildErrors: true` — TypeScript errors won't fail builds
- `TooltipProvider` is required by Radix tooltips but is NOT wrapped in `app/layout.tsx` — tooltips in `HeroSection` may not work
- `ThemeProvider` component exists but is unused in the layout
- No ESLint config file (`.eslintrc*`) exists despite the lint script
- No `@supabase/supabase-js` in package.json yet
- Environment variables needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
