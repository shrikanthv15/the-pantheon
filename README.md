# The Pantheon — Autonomous AI Newsroom

A real-time dashboard for an autonomous AI news pipeline. Three agents — **Kratos** (orchestrator), **Loki** (scout), and **Mimir** (publisher) — work together on an 8-hour cycle to scrape, process, and publish AI news articles.

Built with Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Framer Motion, and Supabase.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in your Supabase credentials
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

The app runs with placeholder data when these are not set.

## Supabase Schema

The following tables are expected in your Supabase project:

### `agents`
| Column | Type | Description |
|---|---|---|
| id | text (PK) | `kratos`, `loki`, or `mimir` |
| name | text | Display name |
| role | text | Agent role |
| status | text | `idle`, `running`, `complete`, `error` |
| last_active | timestamptz | Last activity timestamp |
| session_count | int4 | Total sessions |
| tokens_this_cycle | int4 | Tokens used this cycle |
| model | text | Model identifier |
| heartbeat | text | Heartbeat interval |
| color | text | Hex color |
| accent_color | text | Hex accent color |
| soul | text | Agent personality description |
| mission | text[] | Array of mission items |

### `articles`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| title | text | Article title |
| slug | text | URL slug |
| summary | text | Short summary |
| body | text | Full article body |
| category | text | `model_release`, `framework`, `github`, `funding`, `research`, `other` |
| source_url | text | Original source URL |
| published_at | timestamptz | Publish timestamp |
| agent | text | Publishing agent (`mimir`) |
| status | text | `published` |
| cycle_id | text | Pipeline cycle identifier |

### `pipeline_logs`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| timestamp | timestamptz | Log timestamp |
| agent | text | `kratos`, `loki`, `mimir`, or `system` |
| message | text | Log message |
| level | text | `info`, `warn`, `error`, `success` |

### `pipeline_state`
| Column | Type | Description |
|---|---|---|
| id | int4 (PK) | Single row (1) |
| status | text | Pipeline status |
| last_run | timestamptz | Last run timestamp |
| current_phase | text | Current active phase |
| last_completed | timestamptz | Last completion timestamp |
| article_count | int4 | Articles in last run |
| error | text | Error message if any |

### `agent_metrics`
| Column | Type | Description |
|---|---|---|
| agent_id | text (PK) | Agent identifier |
| tokens_used | int4 | Tokens consumed |
| total_tokens | int4 | Token budget |
| uptime | text | Uptime percentage |
| memory_chunks | int4 | Memory chunks in use |

## Architecture

```
VPS (DigitalOcean)                    Cloud
┌─────────────────┐           ┌──────────────────┐
│  OpenClaw Agent  │──logs───▶│    Supabase      │
│  Pipeline        │──data───▶│  (PostgreSQL +   │
│  (Kratos/Loki/  │           │   Realtime)      │
│   Mimir)         │           └────────┬─────────┘
└─────────────────┘                    │
                                       │ reads
                              ┌────────▼─────────┐
                              │  This Website    │
                              │  (Next.js on     │
                              │   Vercel/VPS)    │
                              └──────────────────┘
```

The VPS runs the agent pipeline. Agents write logs, articles, and state to Supabase. This website reads from Supabase and displays everything in real-time.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

This is a standard Next.js app deployable to Vercel, Cloudflare Pages, or self-hosted on the VPS:

```bash
npm run build
npm run start
```

## License

Private project by Shri / twoby2.dev
