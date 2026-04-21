// Shared types. Mirrors the Supabase schema in agents/supabase/schema.sql
// on the VPS side (gfgqflrahwnbnqtdorly).

export type AgentId = 'kratos' | 'loki' | 'mimir' | 'hermes';
export type AgentStatus = 'idle' | 'running' | 'complete' | 'error';
export type ArticleCategory =
  | 'model_release'
  | 'framework'
  | 'github'
  | 'funding'
  | 'research'
  | 'other';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  lastActive: string;
  sessionCount: number;
  tokensThisCycle: number;
  model: string;
  heartbeat: string;
  color: string;
  accentColor: string;
  soul: string;
  mission: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: ArticleCategory;
  source_url: string;
  published_at: string;
  agent: 'mimir';
  status: 'published';
  cycle_id?: string;
  task_id?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentId | 'system';
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface PipelineState {
  status:
    | 'idle'
    | 'kratos_triggered'
    | 'loki_running'
    | 'mimir_running'
    | 'complete'
    | 'error';
  last_run: string | null;
  current_phase: 'loki' | 'mimir' | null;
  last_completed: string | null;
  article_count: number;
  error: string | null;
}

export interface AgentMetrics {
  agentId: AgentId;
  tokensUsed: number;
  totalTokens: number;
  uptime: string;
  memoryChunks: number;
}

// -----------------------------------------------------------------------
// Task envelope layer — written by Kratos/Loki/Mimir on the VPS,
// synced into Supabase by Hermes. Dashboard reads them through the anon
// key to render the "what each agent is doing right now" panel.
// -----------------------------------------------------------------------

export type TaskStatus =
  | 'planned'
  | 'scouting'
  | 'executing'
  | 'reviewing'
  | 'done'
  | 'failed'
  | 'cancelled'
  | 'blocked';

export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface TaskEnvelope {
  id: string;
  title: string;
  description?: string | null;
  source: 'whatsapp' | 'dashboard' | 'hermes' | 'kratos' | 'cli' | 'heartbeat' | 'dishu';
  status: TaskStatus;
  owner: AgentId;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  raw_envelope?: unknown;
}

export interface TaskStep {
  task_id: string;
  step: number;
  agent: Exclude<AgentId, 'hermes'>;
  action: string;
  status: StepStatus;
  depends_on: number[];
  started_at: string | null;
  ended_at: string | null;
  duration_ms: number | null;
  input: Record<string, unknown> | null;
  output_ref: string | null;
  error: string | null;
  retries: number;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  ts: string;
  agent: AgentId;
  kind: string;
  step: number | null;
  detail: unknown;
}

export interface TaskNote {
  id: string;
  task_id: string;
  ts: string;
  agent: AgentId;
  note: string;
}

export interface HermesHeartbeat {
  singleton: 1;
  last_sync_at: string;
  envelopes_seen: number;
  last_error: string | null;
}

export interface AgentSession {
  id: string;
  agent: AgentId;
  started_at: string;
  ended_at: string | null;
  runtime_ms: number | null;
  model: string | null;
  provider: string | null;
  status: string | null;
  error: string | null;
}

// Per-turn record emitted by the gateway's jsonl session logs and
// ingested into Supabase every 2 minutes by the VPS timer. One row
// per assistant message = one round-trip to the LLM, with exact
// token counts and cost from the model provider.
export interface AgentTurn {
  id: string;
  agent: AgentId;
  session_file: string;
  session_id: string | null;
  ts: string;
  role: string;
  api: string | null;
  provider: string | null;
  model: string | null;
  stop_reason: string | null;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  total_tokens: number;
  cost_usd: number;
  text_preview: string | null;
  is_error: boolean;
}

// Aggregate row from the `agent_token_totals` view.
export interface AgentTokenTotals {
  agent: AgentId;
  turns_total: number;
  turns_24h: number;
  tokens_total: number;
  tokens_24h: number;
  input_total: number;
  output_total: number;
  cost_usd_total: number;
  cost_usd_24h: number;
  last_turn_at: string | null;
  last_model: string | null;
  last_provider: string | null;
}
