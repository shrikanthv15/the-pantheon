import { createClient } from '@supabase/supabase-js'
import type { Agent, Article, LogEntry, PipelineState, AgentMetrics } from '@/types';

// Supabase client — falls back gracefully when env vars are not set (uses placeholder data)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Placeholder data for development
export const agents: Agent[] = [
  {
    id: 'kratos',
    name: 'KRATOS',
    role: 'Orchestrator',
    status: 'idle',
    lastActive: '2026-03-21T08:00:00Z',
    sessionCount: 42,
    tokensThisCycle: 1240,
    model: 'claude-sonnet-4.6 via GitHub Copilot',
    heartbeat: 'Every 8h',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    soul: 'The god of war and strategy. Kratos orchestrates the pipeline with ruthless efficiency, coordinating Loki and Mimir to deliver intelligence on schedule.',
    mission: [
      'Triggers pipeline runs on 8-hour intervals',
      'Coordinates agent handoffs and data flow',
      'Monitors system health and handles errors',
    ],
  },
  {
    id: 'loki',
    name: 'LOKI',
    role: 'Scout',
    status: 'idle',
    lastActive: '2026-03-21T07:45:00Z',
    sessionCount: 156,
    tokensThisCycle: 3450,
    model: 'claude-sonnet-4.6 via GitHub Copilot',
    heartbeat: 'On Demand',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    soul: 'The trickster god of chaos and intelligence. Loki infiltrates the web, scraping news, releases, and signals from across the AI landscape.',
    mission: [
      'Scans 50+ AI news sources and GitHub repos',
      'Extracts and ranks stories by relevance',
      'Prepares structured data for Mimir',
    ],
  },
  {
    id: 'mimir',
    name: 'MIMIR',
    role: 'Publisher',
    status: 'idle',
    lastActive: '2026-03-21T07:50:00Z',
    sessionCount: 89,
    tokensThisCycle: 2100,
    model: 'claude-sonnet-4.6 via GitHub Copilot',
    heartbeat: 'On Demand',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    soul: 'The wisest of the gods, keeper of knowledge. Mimir transforms raw intelligence into polished articles for The Oracle Feed.',
    mission: [
      'Synthesizes Loki\'s data into coherent articles',
      'Applies editorial voice and formatting',
      'Publishes to The Oracle Feed database',
    ],
  },
];

export const placeholderArticles: Article[] = [
  {
    id: '1',
    title: 'Anthropic Releases Claude 4.7 with Extended Thinking Mode',
    slug: 'anthropic-claude-4-7-extended-thinking',
    summary: 'The latest Claude model introduces a revolutionary "Extended Thinking" mode that allows the AI to reason through complex problems over multiple steps before responding.',
    body: '',
    category: 'model_release',
    source_url: 'https://anthropic.com/news/claude-4-7',
    published_at: '2026-03-21T06:30:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
  {
    id: '2',
    title: 'LangGraph 0.4 Drops with Native Multi-Agent Support',
    slug: 'langgraph-0-4-multi-agent',
    summary: 'LangChain\'s graph framework now supports native multi-agent workflows with built-in state management and parallel execution capabilities.',
    body: '',
    category: 'framework',
    source_url: 'https://github.com/langchain-ai/langgraph',
    published_at: '2026-03-21T04:15:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
  {
    id: '3',
    title: 'OpenAI Open-Sources GPT-5-Mini Weights on Hugging Face',
    slug: 'openai-gpt-5-mini-open-source',
    summary: 'In a surprising move, OpenAI releases the full weights of their smallest production model under an Apache 2.0 license, enabling local deployment.',
    body: '',
    category: 'model_release',
    source_url: 'https://huggingface.co/openai/gpt-5-mini',
    published_at: '2026-03-20T22:00:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
  {
    id: '4',
    title: 'Mistral AI Raises $1.2B Series C at $12B Valuation',
    slug: 'mistral-series-c-funding',
    summary: 'The French AI startup closes a massive funding round led by a16z, with plans to expand compute infrastructure and launch enterprise products.',
    body: '',
    category: 'funding',
    source_url: 'https://techcrunch.com/mistral-series-c',
    published_at: '2026-03-20T18:30:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
  {
    id: '5',
    title: 'Google DeepMind Publishes Gemini 3 Technical Report',
    slug: 'deepmind-gemini-3-technical-report',
    summary: 'The 150-page technical report reveals architectural innovations including "Temporal Attention" and a new training methodology called "Recursive Self-Improvement".',
    body: '',
    category: 'research',
    source_url: 'https://arxiv.org/abs/2603.12345',
    published_at: '2026-03-20T14:00:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
  {
    id: '6',
    title: 'Vercel Ships AI SDK 6.0 with Agentic Primitives',
    slug: 'vercel-ai-sdk-6-agentic',
    summary: 'The new major version introduces first-class support for building autonomous agents with built-in memory, tool use, and multi-step reasoning.',
    body: '',
    category: 'framework',
    source_url: 'https://github.com/vercel/ai',
    published_at: '2026-03-20T10:45:00Z',
    agent: 'mimir',
    status: 'published',
    cycle_id: 'cycle_001',
  },
];

export const placeholderLogs: LogEntry[] = [
  { id: '1', timestamp: '2026-03-21T08:00:00Z', agent: 'system', message: 'Pipeline initialized. Waiting for next scheduled run.', level: 'info' },
  { id: '2', timestamp: '2026-03-21T07:50:12Z', agent: 'mimir', message: 'Published 6 articles to The Oracle Feed.', level: 'success' },
  { id: '3', timestamp: '2026-03-21T07:48:33Z', agent: 'mimir', message: 'Processing article: Vercel Ships AI SDK 6.0', level: 'info' },
  { id: '4', timestamp: '2026-03-21T07:45:00Z', agent: 'loki', message: 'Scout complete. Found 12 relevant stories, ranked 6 for publication.', level: 'success' },
  { id: '5', timestamp: '2026-03-21T07:42:18Z', agent: 'loki', message: 'Scanning source: GitHub Trending Repositories', level: 'info' },
  { id: '6', timestamp: '2026-03-21T07:40:05Z', agent: 'loki', message: 'Scanning source: Hacker News Front Page', level: 'info' },
  { id: '7', timestamp: '2026-03-21T07:38:22Z', agent: 'kratos', message: 'Loki activated. Beginning intelligence gathering.', level: 'info' },
  { id: '8', timestamp: '2026-03-21T07:38:00Z', agent: 'kratos', message: 'Pipeline triggered. Cycle ID: cycle_002', level: 'info' },
  { id: '9', timestamp: '2026-03-21T00:00:00Z', agent: 'system', message: 'Daily metrics reset. Previous cycle: 8 articles, 12,450 tokens.', level: 'info' },
  { id: '10', timestamp: '2026-03-20T23:50:00Z', agent: 'mimir', message: 'Cycle complete. 8 articles published successfully.', level: 'success' },
];

export const pipelineState: PipelineState = {
  status: 'idle',
  last_run: '2026-03-21T07:38:00Z',
  current_phase: null,
  last_completed: '2026-03-21T07:50:12Z',
  article_count: 6,
  error: null,
};

// TODO: Replace with actual Supabase queries
export async function getAgents(): Promise<Agent[]> {
  // TODO: return supabase.from('agents').select('*')
  return agents;
}

export async function getArticles(): Promise<Article[]> {
  // TODO: return supabase.from('articles').select('*').order('published_at', { ascending: false })
  return placeholderArticles;
}

export async function getLogs(): Promise<LogEntry[]> {
  // TODO: return supabase.from('pipeline_logs').select('*').order('timestamp', { ascending: false }).limit(50)
  return placeholderLogs;
}

export async function getPipelineState(): Promise<PipelineState> {
  // TODO: return supabase.from('pipeline_state').select('*').single()
  return pipelineState;
}

export async function getAgentMetrics(): Promise<AgentMetrics[]> {
  // TODO: return supabase.from('agent_metrics').select('*')
  return [
    { agentId: 'kratos', tokensUsed: 1240, totalTokens: 10000, uptime: '99.9%', memoryChunks: 0 },
    { agentId: 'loki', tokensUsed: 3450, totalTokens: 10000, uptime: '99.7%', memoryChunks: 0 },
    { agentId: 'mimir', tokensUsed: 2100, totalTokens: 10000, uptime: '99.8%', memoryChunks: 0 },
  ];
}

// TODO: Set up Supabase realtime subscription for live updates
// export function subscribeToPipelineLogs(callback: (log: LogEntry) => void) {
//   return supabase
//     .channel('pipeline_logs')
//     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_logs' }, callback)
//     .subscribe()
// }
