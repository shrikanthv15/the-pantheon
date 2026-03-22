-- ============================================================
-- The Pantheon: Supabase Schema Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create agents table (MISSING)
CREATE TABLE IF NOT EXISTS public.agents (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'complete', 'error')),
  last_active timestamptz DEFAULT now(),
  session_count integer DEFAULT 0,
  tokens_this_cycle integer DEFAULT 0,
  model text,
  heartbeat text,
  color text,
  accent_color text,
  soul text,
  mission text[]
);

-- 2. Create agent_metrics table (MISSING)
CREATE TABLE IF NOT EXISTS public.agent_metrics (
  agent_id text PRIMARY KEY REFERENCES public.agents(id),
  tokens_used integer DEFAULT 0,
  total_tokens integer DEFAULT 10000,
  uptime text DEFAULT '0%',
  memory_chunks integer DEFAULT 0
);

-- 3. Enable Row Level Security on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_state ENABLE ROW LEVEL SECURITY;

-- 4. Allow public (anon) read access on all tables
CREATE POLICY "Allow public read on agents"
  ON public.agents FOR SELECT USING (true);

CREATE POLICY "Allow public read on agent_metrics"
  ON public.agent_metrics FOR SELECT USING (true);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Allow public read on articles') THEN
    CREATE POLICY "Allow public read on articles" ON public.articles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_logs' AND policyname = 'Allow public read on pipeline_logs') THEN
    CREATE POLICY "Allow public read on pipeline_logs" ON public.pipeline_logs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_state' AND policyname = 'Allow public read on pipeline_state') THEN
    CREATE POLICY "Allow public read on pipeline_state" ON public.pipeline_state FOR SELECT USING (true);
  END IF;
END $$;

-- 5. Seed agent data
INSERT INTO public.agents (id, name, role, status, model, heartbeat, color, accent_color, soul, mission) VALUES
(
  'kratos', 'KRATOS', 'Orchestrator', 'idle',
  'claude-sonnet-4.6 via GitHub Copilot', 'Every 8h',
  '#f59e0b', '#fbbf24',
  'The god of war and strategy. Kratos orchestrates the pipeline with ruthless efficiency, coordinating Loki and Mimir to deliver intelligence on schedule.',
  ARRAY['Triggers pipeline runs on 8-hour intervals', 'Coordinates agent handoffs and data flow', 'Monitors system health and handles errors']
),
(
  'loki', 'LOKI', 'Scout', 'idle',
  'claude-sonnet-4.6 via GitHub Copilot', 'On Demand',
  '#06b6d4', '#22d3ee',
  'The trickster god of chaos and intelligence. Loki infiltrates the web, scraping news, releases, and signals from across the AI landscape.',
  ARRAY['Scans 50+ AI news sources and GitHub repos', 'Extracts and ranks stories by relevance', 'Prepares structured data for Mimir']
),
(
  'mimir', 'MIMIR', 'Publisher', 'idle',
  'claude-sonnet-4.6 via GitHub Copilot', 'On Demand',
  '#8b5cf6', '#a78bfa',
  'The wisest of the gods, keeper of knowledge. Mimir transforms raw intelligence into polished articles for The Oracle Feed.',
  ARRAY['Synthesizes Loki''s data into coherent articles', 'Applies editorial voice and formatting', 'Publishes to The Oracle Feed database']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed agent metrics
INSERT INTO public.agent_metrics (agent_id, tokens_used, total_tokens, uptime, memory_chunks) VALUES
('kratos', 0, 10000, '99.9%', 0),
('loki', 0, 10000, '99.7%', 0),
('mimir', 0, 10000, '99.8%', 0)
ON CONFLICT (agent_id) DO NOTHING;

-- 7. Enable Realtime on pipeline_logs for live log streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_logs;
