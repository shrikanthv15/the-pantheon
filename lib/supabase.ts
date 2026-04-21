import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Agent,
  AgentId,
  AgentMetrics,
  AgentSession,
  AgentStatus,
  Article,
  HermesHeartbeat,
  LogEntry,
  PipelineState,
  TaskEnvelope,
  TaskEvent,
  TaskNote,
  TaskStep,
} from '@/types';

// ────────────────────────────────────────────────────────────────────────
// Client — uses publishable/anon key. Service-role key is NEVER imported
// client-side; it only exists server-side on the VPS in Hermes/Mimir env.
// ────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Support both the legacy `ANON_KEY` name and the new `PUBLISHABLE_DEFAULT_KEY`
// name Supabase rolled out in 2024.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = () => supabase !== null;

// ────────────────────────────────────────────────────────────────────────
// Agent roster — static identity + colors. Status / tokens / sessions
// come from Supabase below.
// ────────────────────────────────────────────────────────────────────────

const STATIC_AGENTS: Record<AgentId, Omit<Agent, 'status' | 'lastActive' | 'sessionCount' | 'tokensThisCycle'>> = {
  kratos: {
    id: 'kratos',
    name: 'KRATOS',
    role: 'Orchestrator',
    model: 'ollama/gemma4:26b',
    heartbeat: 'Every 8h',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    soul:
      'The god of war and strategy. Kratos receives tasks from WhatsApp, Hermes, or the dashboard, decomposes them, routes each step to the right agent, and closes the envelope.',
    mission: [
      'Accept tasks from any source (WhatsApp, dashboard, Hermes)',
      'Decompose into plan steps by verb family',
      'Dispatch Loki / Mimir, watch for stalls, close the envelope',
    ],
  },
  loki: {
    id: 'loki',
    name: 'LOKI',
    role: 'Scout',
    model: 'ollama/kimi-k2.5:cloud',
    heartbeat: 'On demand',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    soul:
      'Trickster scout. Loki does research, discovery, and data gathering. Structured JSON over prose. Never editorializes.',
    mission: [
      'Research AI news, repos, funding, releases',
      'Gather apartment listings + landlord contacts for the Texas move',
      'Return structured data + close its step in the envelope',
    ],
  },
  mimir: {
    id: 'mimir',
    name: 'MIMIR',
    role: 'Reviewer & Publisher',
    model: 'ollama/kimi-k2.5:cloud',
    heartbeat: 'Hourly',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    soul:
      'The well of wisdom made actionable. Takes raw Loki output, polishes into articles, publishes to Supabase, and narrates every envelope as it runs.',
    mission: [
      'Format & review all agent output',
      'Publish articles to Supabase',
      'Append running commentary so the dashboard always has a story',
    ],
  },
  hermes: {
    id: 'hermes',
    name: 'HERMES',
    role: 'Archivist & Auditor',
    model: 'ollama/kimi-k2.5:cloud',
    heartbeat: 'Every 30m',
    color: '#10b981',
    accentColor: '#34d399',
    soul:
      "Shri's personal archivist. Watches the other three, syncs everything into Supabase, writes the daily and weekly logs. Read-only observer with teeth.",
    mission: [
      'Audit every envelope and log failures + stalls',
      'Sync tasks / steps / events / notes to Supabase',
      'Write daily and weekly system summaries',
    ],
  },
};

export const AGENT_ORDER: AgentId[] = ['kratos', 'loki', 'mimir', 'hermes'];

// ────────────────────────────────────────────────────────────────────────
// Placeholder fallbacks — used when env vars are missing so local dev
// still renders something reasonable.
// ────────────────────────────────────────────────────────────────────────

const placeholderAgents: Agent[] = AGENT_ORDER.map((id) => ({
  ...STATIC_AGENTS[id],
  status: 'idle',
  lastActive: new Date().toISOString(),
  sessionCount: 0,
  tokensThisCycle: 0,
}));

const placeholderArticles: Article[] = [
  {
    id: '1',
    title: 'Waiting for first Mimir publish',
    slug: 'placeholder',
    summary:
      'No Supabase credentials detected. Drop NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY into .env.local and reload.',
    body: '',
    category: 'other',
    source_url: 'https://github.com/shrikanthv15/VPS-Mirror',
    published_at: new Date().toISOString(),
    agent: 'mimir',
    status: 'published',
  },
];

const placeholderLogs: LogEntry[] = [
  {
    id: 'ph-1',
    timestamp: new Date().toISOString(),
    agent: 'system',
    message: 'Supabase env not configured — showing placeholder data.',
    level: 'warn',
  },
];

const placeholderPipelineState: PipelineState = {
  status: 'idle',
  last_run: null,
  current_phase: null,
  last_completed: null,
  article_count: 0,
  error: null,
};

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

function mapTaskStatusToAgentStatus(status: string | undefined): AgentStatus {
  switch (status) {
    case 'executing':
    case 'scouting':
    case 'reviewing':
      return 'running';
    case 'done':
      return 'complete';
    case 'failed':
    case 'blocked':
      return 'error';
    default:
      return 'idle';
  }
}

function kindToLevel(kind: string): LogEntry['level'] {
  if (kind.endsWith('_failed') || kind === 'stall' || kind === 'error') return 'error';
  if (kind.endsWith('_done') || kind === 'created' || kind === 'step_completed')
    return 'success';
  if (kind === 'blocked' || kind.endsWith('warn')) return 'warn';
  return 'info';
}

// ────────────────────────────────────────────────────────────────────────
// Reads
// ────────────────────────────────────────────────────────────────────────

export async function getArticles(limit = 60): Promise<Article[]> {
  if (!supabase) return placeholderArticles;
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,slug,summary,body,category,source_url,published_at,agent,status,task_id')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error || !data) {
    console.warn('[supabase] getArticles failed', error);
    return placeholderArticles;
  }
  return data.map((r) => ({
    ...r,
    id: String(r.id),
    agent: 'mimir' as const,
    status: 'published' as const,
  })) as Article[];
}

export async function getPipelineState(): Promise<PipelineState> {
  if (!supabase) return placeholderPipelineState;

  // Prefer the flat pipeline_state row if populated.
  const { data: flat } = await supabase
    .from('pipeline_state')
    .select('*')
    .eq('singleton', 1)
    .maybeSingle();

  if (flat && flat.last_run) {
    return {
      status: (flat.status as PipelineState['status']) ?? 'idle',
      current_phase: (flat.current_phase as PipelineState['current_phase']) ?? null,
      last_run: flat.last_run ?? null,
      last_completed: flat.last_completed ?? null,
      article_count: flat.article_count ?? 0,
      error: flat.error ?? null,
    };
  }

  // Fallback: compute from the most recent task envelope.
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status,updated_at,created_at,closed_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  const { count: articleCount } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true });

  const t = tasks?.[0];
  const openEnv = t && !['done', 'failed', 'cancelled'].includes(t.status);
  return {
    status: openEnv
      ? t.status === 'scouting'
        ? 'loki_running'
        : t.status === 'executing'
          ? 'mimir_running'
          : 'kratos_triggered'
      : 'idle',
    current_phase: openEnv ? (t.status === 'scouting' ? 'loki' : 'mimir') : null,
    last_run: t?.created_at ?? null,
    last_completed: t?.closed_at ?? null,
    article_count: articleCount ?? 0,
    error: null,
  };
}

export async function getTasks(limit = 25): Promise<TaskEnvelope[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select(
      'id,title,description,source,status,owner,priority,created_at,updated_at,closed_at',
    )
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as TaskEnvelope[];
}

export async function getTaskSteps(taskId: string): Promise<TaskStep[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('task_steps')
    .select('*')
    .eq('task_id', taskId)
    .order('step', { ascending: true });
  return (data ?? []) as TaskStep[];
}

export async function getAllTaskSteps(taskIds: string[]): Promise<TaskStep[]> {
  if (!supabase || taskIds.length === 0) return [];
  const { data } = await supabase
    .from('task_steps')
    .select('*')
    .in('task_id', taskIds)
    .order('step', { ascending: true });
  return (data ?? []) as TaskStep[];
}

export async function getAllTaskNotes(
  taskIds: string[],
  perTask = 3,
): Promise<TaskNote[]> {
  if (!supabase || taskIds.length === 0) return [];
  const { data } = await supabase
    .from('task_notes')
    .select('id,task_id,ts,agent,note')
    .in('task_id', taskIds)
    .order('ts', { ascending: false })
    .limit(perTask * taskIds.length);
  return (data ?? []) as TaskNote[];
}

export async function getTaskNotes(taskId: string, limit = 20): Promise<TaskNote[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('task_notes')
    .select('*')
    .eq('task_id', taskId)
    .order('ts', { ascending: false })
    .limit(limit);
  return (data ?? []) as TaskNote[];
}

export async function getRecentTaskEvents(limit = 80): Promise<TaskEvent[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('task_events')
    .select('id,task_id,ts,agent,kind,step,detail')
    .order('ts', { ascending: false })
    .limit(limit);
  return (data ?? []) as TaskEvent[];
}

export async function getHermesHeartbeat(): Promise<HermesHeartbeat | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('hermes_heartbeat')
    .select('*')
    .eq('singleton', 1)
    .maybeSingle();
  return (data as HermesHeartbeat) ?? null;
}

export async function getRecentSessions(limit = 200): Promise<AgentSession[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('agent_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as AgentSession[];
}

// ────────────────────────────────────────────────────────────────────────
// Derived views — shape Supabase rows into the component-friendly types.
// ────────────────────────────────────────────────────────────────────────

/** Convert task_events rows → LogEntry[] for LogFeed/LogTicker. */
export async function getLogs(limit = 80): Promise<LogEntry[]> {
  const events = await getRecentTaskEvents(limit);
  if (events.length === 0) return placeholderLogs;
  return events.map((e): LogEntry => {
    let message: string;
    if (typeof e.detail === 'string') {
      message = e.detail;
    } else if (e.detail && typeof e.detail === 'object') {
      const d = e.detail as Record<string, unknown>;
      message =
        (d.message as string) ??
        (d.note as string) ??
        `${e.kind}${e.step ? ` (step ${e.step})` : ''}`;
    } else {
      message = `${e.kind}${e.step ? ` (step ${e.step})` : ''}`;
    }
    return {
      id: e.id,
      timestamp: e.ts,
      agent: (['kratos', 'loki', 'mimir', 'hermes'] as AgentId[]).includes(e.agent as AgentId)
        ? (e.agent as AgentId)
        : 'system',
      message: `${e.kind} — ${message} [${e.task_id.slice(-6)}]`,
      level: kindToLevel(e.kind),
    };
  });
}

/** Compose Agent[] from static metadata + most recent session per agent. */
export async function getAgents(): Promise<Agent[]> {
  if (!supabase) return placeholderAgents;

  const sessions = await getRecentSessions(200);
  const perAgent = new Map<AgentId, { last: AgentSession; count: number }>();
  for (const s of sessions) {
    const a = s.agent as AgentId;
    if (!AGENT_ORDER.includes(a)) continue;
    const existing = perAgent.get(a);
    if (!existing || new Date(s.started_at) > new Date(existing.last.started_at)) {
      perAgent.set(a, { last: s, count: (existing?.count ?? 0) + 1 });
    } else {
      existing.count += 1;
    }
  }

  // Current task -> which agent is currently running?
  const tasks = await getTasks(5);
  const openTask = tasks.find((t) =>
    ['executing', 'scouting', 'reviewing'].includes(t.status),
  );
  let openSteps: TaskStep[] = [];
  if (openTask) openSteps = await getTaskSteps(openTask.id);

  return AGENT_ORDER.map<Agent>((id) => {
    const info = STATIC_AGENTS[id];
    const sess = perAgent.get(id);
    const runningForMe = openSteps.some(
      (s) => s.agent === (id as Exclude<AgentId, 'hermes'>) && s.status === 'running',
    );
    const failedForMe = openSteps.some(
      (s) => s.agent === (id as Exclude<AgentId, 'hermes'>) && s.status === 'failed',
    );
    const status: AgentStatus = runningForMe
      ? 'running'
      : failedForMe
        ? 'error'
        : sess?.last.status === 'failed'
          ? 'error'
          : 'idle';

    return {
      ...info,
      model: sess?.last.model ? `${sess.last.provider ?? ''}/${sess.last.model}`.replace(/^\//, '') : info.model,
      status,
      lastActive: sess?.last.started_at ?? new Date(0).toISOString(),
      sessionCount: sess?.count ?? 0,
      // We don't yet log per-session token counts — approximate from
      // runtime as a rough "activity" signal until the token field exists.
      tokensThisCycle: sess?.last.runtime_ms ? Math.round(sess.last.runtime_ms / 10) : 0,
    };
  });
}

/** Aggregate token budget per agent. Sums runtime_ms across last 24h as a
 *  proxy until a real tokens column exists. */
export async function getAgentMetrics(): Promise<AgentMetrics[]> {
  if (!supabase) {
    return AGENT_ORDER.map((id) => ({
      agentId: id,
      tokensUsed: 0,
      totalTokens: 100000,
      uptime: '—',
      memoryChunks: 0,
    }));
  }
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from('agent_sessions')
    .select('agent,runtime_ms,status')
    .gte('started_at', since);

  const byAgent = new Map<AgentId, { total: number; ok: number; fail: number }>();
  for (const r of data ?? []) {
    const a = r.agent as AgentId;
    if (!AGENT_ORDER.includes(a)) continue;
    const rec = byAgent.get(a) ?? { total: 0, ok: 0, fail: 0 };
    rec.total += 1;
    if (r.status === 'failed') rec.fail += 1;
    else rec.ok += 1;
    byAgent.set(a, rec);
  }

  return AGENT_ORDER.map<AgentMetrics>((id) => {
    const rec = byAgent.get(id);
    const uptime =
      rec && rec.total > 0 ? `${Math.round((rec.ok / rec.total) * 1000) / 10}%` : '—';
    return {
      agentId: id,
      tokensUsed: rec?.ok ?? 0, // count of successful runs as a proxy
      totalTokens: Math.max(100, (rec?.total ?? 0) * 2),
      uptime,
      memoryChunks: rec?.total ?? 0,
    };
  });
}

/** Bar-chart data: articles produced per task envelope (latest 10). */
export async function getArticlesPerRun(): Promise<{ run: string; articles: number }[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('articles')
    .select('task_id')
    .not('task_id', 'is', null);
  if (!data) return [];
  const counts = new Map<string, number>();
  for (const r of data as { task_id: string }[]) {
    counts.set(r.task_id, (counts.get(r.task_id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .slice(-10)
    .map(([id, articles], i) => ({
      run: String(i + 1),
      articles,
      taskId: id,
    }))
    .map(({ run, articles }) => ({ run, articles }));
}

// ────────────────────────────────────────────────────────────────────────
// Realtime subscriptions
// ────────────────────────────────────────────────────────────────────────

export function subscribeToArticles(cb: () => void) {
  if (!supabase) return () => undefined;
  const ch = supabase
    .channel('pantheon:articles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, cb)
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export function subscribeToTaskEvents(cb: () => void) {
  if (!supabase) return () => undefined;
  const ch = supabase
    .channel('pantheon:task_events')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_events' }, cb)
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export function subscribeToTasks(cb: () => void) {
  if (!supabase) return () => undefined;
  const ch = supabase
    .channel('pantheon:tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, cb)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_steps' }, cb)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_notes' }, cb)
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export function subscribeToHermesHeartbeat(cb: () => void) {
  if (!supabase) return () => undefined;
  const ch = supabase
    .channel('pantheon:hermes_heartbeat')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'hermes_heartbeat' },
      cb,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

// ────────────────────────────────────────────────────────────────────────
// Legacy exports — kept so existing imports don't break while components
// migrate to the new async API.
// ────────────────────────────────────────────────────────────────────────

export const agents = placeholderAgents;
export { placeholderArticles, placeholderLogs };
export const pipelineState = placeholderPipelineState;
