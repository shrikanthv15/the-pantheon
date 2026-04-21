'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { AgentCard } from '@/components/AgentCard';
import { LogFeed, LogTicker } from '@/components/LogFeed';
import { OracleFeed } from '@/components/OracleFeed';
import { MetricsPanel } from '@/components/MetricsPanel';
import { TaskBoard } from '@/components/TaskBoard';
import { Footer } from '@/components/Footer';
import {
  agents as placeholderAgents,
  getAgents,
  getAgentMetrics,
  getArticles,
  getArticlesPerRun,
  getAllTaskNotes,
  getAllTaskSteps,
  getHermesHeartbeat,
  getLogs,
  getPipelineState,
  getTasks,
  isSupabaseConfigured,
  subscribeToArticles,
  subscribeToHermesHeartbeat,
  subscribeToTaskEvents,
  subscribeToTasks,
} from '@/lib/supabase';
import type {
  Agent,
  AgentMetrics,
  Article,
  HermesHeartbeat,
  LogEntry,
  PipelineState,
  TaskEnvelope,
  TaskNote,
  TaskStep,
} from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Shallow event-list comparator so we don't re-render when a refetch
// returns structurally identical data.
const sameTs = (a: { id: string }[], b: { id: string }[]) =>
  a.length === b.length && a.every((x, i) => x.id === b[i]?.id);

export default function PantheonPage() {
  // Seed with placeholder agent metadata so Hero + cards render on the
  // first paint (otherwise HeroSection's null-guard hides everything until
  // useEffect finishes its Supabase round-trip).
  const [agents, setAgents] = useState<Agent[]>(placeholderAgents);
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesPerRun, setArticlesPerRun] = useState<{ run: string; articles: number }[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    status: 'idle',
    last_run: null,
    current_phase: null,
    last_completed: null,
    article_count: 0,
    error: null,
  });
  const [tasks, setTasks] = useState<TaskEnvelope[]>([]);
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);
  const [heartbeat, setHeartbeat] = useState<HermesHeartbeat | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [ag, mt, ar, ap, lg, ps, tk, hb] = await Promise.all([
      getAgents(),
      getAgentMetrics(),
      getArticles(60),
      getArticlesPerRun(),
      getLogs(80),
      getPipelineState(),
      getTasks(10),
      getHermesHeartbeat(),
    ]);

    setAgents(ag);
    setMetrics(mt);
    setArticles(ar);
    setArticlesPerRun(ap);
    setLogs((prev) => (sameTs(prev, lg) ? prev : lg));
    setPipelineState(ps);
    setTasks(tk);
    setHeartbeat(hb);

    const taskIds = tk.map((t) => t.id);
    const [fetchedSteps, fetchedNotes] = await Promise.all([
      getAllTaskSteps(taskIds),
      getAllTaskNotes(taskIds, 3),
    ]);
    setSteps(fetchedSteps);
    setTaskNotes(fetchedNotes);

    setLoaded(true);
  }, []);

  // Initial load + Realtime subscriptions + 30 s safety refresh.
  useEffect(() => {
    refresh();

    if (!isSupabaseConfigured()) return;

    const unsubs = [
      subscribeToArticles(refresh),
      subscribeToTaskEvents(refresh),
      subscribeToTasks(refresh),
      subscribeToHermesHeartbeat(refresh),
    ];
    const iv = setInterval(refresh, 30_000);
    return () => {
      clearInterval(iv);
      unsubs.forEach((u) => u());
    };
  }, [refresh]);

  return (
    <div className="min-h-screen bg-background grid-background">
      <Navigation />

      <motion.main variants={containerVariants} initial="hidden" animate="visible">
        {/* Hero */}
        <motion.div variants={sectionVariants}>
          <HeroSection agents={agents} pipelineState={pipelineState} />
        </motion.div>

        {/* Agents (4 cards incl. Hermes) */}
        <motion.section id="agents" variants={sectionVariants} className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                THE AGENTS
              </h2>
              <p className="text-muted-foreground">
                Four autonomous roles on one VPS. Kratos leads, Loki scouts, Mimir reviews,
                Hermes watches.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Task Envelopes — what each agent is doing right now */}
        <motion.section
          id="tasks"
          variants={sectionVariants}
          className="px-4 py-16 bg-surface-elevated"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                LIVE TASK BOARD
              </h2>
              <p className="text-muted-foreground">
                Every envelope Kratos has opened, with the step each agent is running
                and Mimir's commentary.
              </p>
              {heartbeat && (
                <p className="mt-2 text-xs font-mono text-muted-foreground">
                  Hermes last synced{' '}
                  <span className="text-[#34d399]">
                    {new Date(heartbeat.last_sync_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </span>{' '}
                  UTC · {heartbeat.envelopes_seen} envelopes
                </p>
              )}
            </div>
            <TaskBoard tasks={tasks} steps={steps} notes={taskNotes} />
          </div>
        </motion.section>

        {/* Log Feed */}
        <motion.section id="feed" variants={sectionVariants} className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <LogFeed logs={logs} />
          </div>
        </motion.section>

        {/* Oracle Feed */}
        <motion.div variants={sectionVariants}>
          <OracleFeed articles={articles} />
        </motion.div>

        {/* Metrics */}
        <motion.section
          id="metrics"
          variants={sectionVariants}
          className="px-4 py-16 bg-surface-elevated"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                SYSTEM METRICS
              </h2>
              <p className="text-muted-foreground">
                Real-time operational intelligence · computed from Supabase (
                {isSupabaseConfigured() ? 'live' : 'placeholder'})
              </p>
            </div>
            <MetricsPanel agents={agents} metrics={metrics} articlesPerRun={articlesPerRun} />
          </div>
        </motion.section>

        {/* Ticker */}
        <motion.section id="logs" variants={sectionVariants} className="px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Live Log Stream
              </h3>
              <a
                href="#feed"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View Full Logs ↓
              </a>
            </div>
            <LogTicker logs={logs} />
          </div>
        </motion.section>

        <Footer pipelineState={pipelineState} />
      </motion.main>
    </div>
  );
}
