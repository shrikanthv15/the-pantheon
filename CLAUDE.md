# CLAUDE.md

Guidance for Claude Code when working in **the-pantheon** repo.

## Project overview

The Pantheon is the dashboard for Shri's OpenClaw multi-agent VPS
(`kratos.twoby2.dev`). It visualises the four-agent stack —
**Kratos** (leader), **Loki** (scout), **Mimir** (reviewer/publisher),
**Hermes** (auditor) — reading from a Supabase Postgres project that
Hermes syncs on the VPS.

- VPS repo / operator-facing docs: https://github.com/shrikanthv15/VPS-Mirror
- Supabase project: `gfgqflrahwnbnqtdorly`
- Agent SOUL files: `agents/<id>/SOUL.md` in VPS-Mirror
- Task envelope schema: `agents/shared/envelope.schema.json` in VPS-Mirror
- Dashboard hosting plan: Vercel, DNS `pantheon.twoby2.dev` via Cloudflare

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui
+ Framer Motion + Recharts + `@supabase/supabase-js`.

**Data layer** (`lib/supabase.ts`):
- `createClient` uses `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (falls back to
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the legacy JWT name). If env vars
  are missing, exports `supabase = null` and queries return safe
  placeholder data — the page still renders.
- Async readers: `getAgents`, `getArticles`, `getLogs`, `getTasks`,
  `getAllTaskSteps`, `getAllTaskNotes`, `getAgentMetrics`,
  `getArticlesPerRun`, `getPipelineState`, `getHermesHeartbeat`,
  `getRecentSessions`.
- Realtime subscriptions: `subscribeToArticles`, `subscribeToTaskEvents`,
  `subscribeToTasks`, `subscribeToHermesHeartbeat`. All return a teardown fn.
- **Service-role key is never referenced here.** Only used server-side on
  the VPS by Mimir (publish) and Hermes (sync).

**Page structure** (`app/page.tsx` is a client component):
1. `HeroSection` — pipeline graphic (3 nodes: Kratos/Loki/Mimir) + countdown
2. Agent grid — 4 `AgentCard`s including Hermes
3. `TaskBoard` — live envelopes with plan + Mimir commentary
4. `LogFeed` — driven by `task_events` (kind → level mapping)
5. `OracleFeed` — articles from Supabase
6. `MetricsPanel` — token economy, articles-per-run bar chart, agent health
7. `LogTicker` + `Footer`

Page loads data with `Promise.all`, subscribes to 4 Realtime channels,
plus a 30 s safety `setInterval`.

**Design system:** Dark-mode only. Agent palette:

| Agent  | Primary   | Accent    |
|--------|-----------|-----------|
| Kratos | `#f59e0b` | `#fbbf24` |
| Loki   | `#06b6d4` | `#22d3ee` |
| Mimir  | `#8b5cf6` | `#a78bfa` |
| Hermes | `#10b981` | `#34d399` |

Colour values live in `components/AgentCard.tsx` `colorClasses` and
`components/MetricsPanel.tsx` `agentColors`.

**Types** (`types/index.ts`): `AgentId`, `Agent`, `Article`, `LogEntry`,
`PipelineState`, `AgentMetrics`, plus the envelope types `TaskEnvelope`,
`TaskStep`, `TaskEvent`, `TaskNote`, `HermesHeartbeat`, `AgentSession`.

## Env vars

See `.env.example`. For local dev put them in `.env.local`.

## Supabase tables read by this app

All read-only via the publishable key (RLS anon-read policies live in
`VPS-Mirror:agents/supabase/schema.sql`):

- `tasks` — one row per envelope
- `task_steps` — plan steps
- `task_events` — append-only log (drives LogFeed)
- `task_notes` — Mimir's running commentary
- `articles` — published by Mimir
- `agent_sessions` — per-run status/runtime
- `hermes_heartbeat` — Hermes alive signal
- `pipeline_state` — legacy flat mirror
- `optimization_hints` — agent self-improvement hints
- `hermes_log` — Hermes daily/weekly narratives

## Key gotchas

- `next.config.mjs` sets `ignoreBuildErrors: true` — lint warnings don't
  fail builds.
- Realtime needs `supabase_realtime` publication to include the tables.
  Schema handles that; if you add new tables, add an `alter publication`
  block.
- When Supabase is unreachable (e.g. offline dev), every query returns
  placeholder data; nothing crashes.
- Do NOT import the service-role / secret key anywhere in this repo.
