export type AgentStatus = 'idle' | 'running' | 'complete' | 'error';
export type ArticleCategory = 'model_release' | 'framework' | 'github' | 'funding' | 'research' | 'other';

export interface Agent {
  id: 'kratos' | 'loki' | 'mimir';
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
  cycle_id: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: 'kratos' | 'loki' | 'mimir' | 'system';
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface PipelineState {
  status: 'idle' | 'kratos_triggered' | 'loki_running' | 'mimir_running' | 'complete' | 'error';
  last_run: string | null;
  current_phase: 'loki' | 'mimir' | null;
  last_completed: string | null;
  article_count: number;
  error: string | null;
}

export interface AgentMetrics {
  agentId: 'kratos' | 'loki' | 'mimir';
  tokensUsed: number;
  totalTokens: number;
  uptime: string;
  memoryChunks: number;
}
