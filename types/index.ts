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
