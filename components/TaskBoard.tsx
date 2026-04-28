'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  FileClock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  AgentId,
  HermesHeartbeat,
  TaskEnvelope,
  TaskNote,
  TaskStep,
} from '@/types';

interface TaskBoardProps {
  tasks: TaskEnvelope[];
  steps: TaskStep[];
  notes: TaskNote[];
  /** Optional Hermes heartbeat — when present, renders a pinned synthetic
   *  "Hermes Background Sync" card at the top of the board so the user can
   *  see Hermes is alive without polluting the real tasks table. */
  heartbeat?: HermesHeartbeat | null;
  /** How many "active" tasks to show by default. Default 5. */
  activeWindow?: number;
}

const AGENT_COLOR: Record<AgentId | 'system', string> = {
  kratos: '#f59e0b',
  loki: '#06b6d4',
  mimir: '#8b5cf6',
  hermes: '#10b981',
  system: '#6b7280',
};

const TASK_STATUS_STYLE: Record<
  TaskEnvelope['status'],
  { label: string; dot: string; text: string }
> = {
  planned:    { label: 'PLANNED',    dot: 'bg-muted-foreground',       text: 'text-muted-foreground' },
  scouting:   { label: 'SCOUTING',   dot: 'bg-[#06b6d4] animate-pulse', text: 'text-[#22d3ee]'      },
  executing:  { label: 'EXECUTING',  dot: 'bg-[#f59e0b] animate-pulse', text: 'text-[#fbbf24]'      },
  reviewing:  { label: 'REVIEWING',  dot: 'bg-[#8b5cf6] animate-pulse', text: 'text-[#a78bfa]'      },
  done:       { label: 'DONE',       dot: 'bg-[#10b981]',              text: 'text-[#10b981]'      },
  failed:     { label: 'FAILED',     dot: 'bg-[#ef4444]',              text: 'text-[#ef4444]'      },
  cancelled:  { label: 'CANCELLED',  dot: 'bg-muted-foreground',       text: 'text-muted-foreground' },
  blocked:    { label: 'BLOCKED',    dot: 'bg-[#ef4444]',              text: 'text-[#ef4444]'      },
};

/** A task is "active" if it's not in a terminal state, OR it just finished
 *  (within the last `recentDoneWindowMs`). Everything else is archive material. */
const RECENT_DONE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 h

function isActive(task: TaskEnvelope, now: number): boolean {
  const terminal = ['done', 'cancelled'];
  if (!terminal.includes(task.status)) return true;
  const updated = new Date(task.updated_at).getTime();
  return now - updated < RECENT_DONE_WINDOW_MS;
}

function StepIcon({ status }: { status: TaskStep['status'] }) {
  switch (status) {
    case 'running':
      return <Loader2 className="w-3.5 h-3.5 text-[#fbbf24] animate-spin" />;
    case 'done':
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />;
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />;
    case 'skipped':
      return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 0) return 'in future';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 100) / 10;
  if (s < 60) return `${s}s`;
  return `${Math.round(s / 60)}m`;
}

// ─── Synthetic "Hermes Background Sync" card ──────────────────────────────
function HermesBackgroundCard({ heartbeat }: { heartbeat: HermesHeartbeat }) {
  const lastSync = heartbeat.last_sync_at;
  const ageMs = Date.now() - new Date(lastSync).getTime();
  // If Hermes synced within the last 5 minutes, treat it as healthy/running.
  const stale = ageMs > 5 * 60 * 1000;
  const dotColor = stale ? 'bg-[#ef4444]' : 'bg-[#10b981] animate-pulse';
  const statusLabel = stale ? 'STALE' : 'RUNNING';
  const statusText = stale ? 'text-[#ef4444]' : 'text-[#10b981]';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#10b981]/40 bg-surface overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              Hermes — Background Sync
            </h4>
            <p className="text-xs text-muted-foreground font-mono truncate">
              non-LLM · systemd timers · synced once every 30 min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className={`uppercase tracking-wider ${statusText}`}>
            {statusLabel}
          </span>
          <span className="text-muted-foreground">
            last synced {fmtRelative(lastSync)}
          </span>
        </div>
      </div>
      <div className="px-5 py-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Active duties
        </div>
        <ol className="space-y-1.5 text-xs font-mono">
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span
              className="font-semibold"
              style={{ color: AGENT_COLOR.hermes }}
            >
              HERMES
            </span>
            <span className="text-foreground/80 truncate flex-1">
              sync_to_supabase · {heartbeat.envelopes_seen} envelopes seen
            </span>
            <span className="text-muted-foreground">~30 min</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span
              className="font-semibold"
              style={{ color: AGENT_COLOR.hermes }}
            >
              HERMES
            </span>
            <span className="text-foreground/80 truncate flex-1">
              ingest_sessions · jsonl → agent_turns
            </span>
            <span className="text-muted-foreground">2 min</span>
          </li>
          <li className="flex items-center gap-3">
            <Circle className="w-3.5 h-3.5 text-muted-foreground" />
            <span
              className="font-semibold"
              style={{ color: AGENT_COLOR.hermes }}
            >
              HERMES
            </span>
            <span className="text-foreground/80 truncate flex-1">
              expense_archive · weekly cleanup of Notion ledger
            </span>
            <span className="text-muted-foreground">Sun 03:07 UTC</span>
          </li>
        </ol>
      </div>
      {heartbeat.last_error && (
        <div className="px-5 py-3 bg-[#ef4444]/10">
          <div className="text-[10px] uppercase tracking-wider text-[#ef4444] mb-1">
            Last error
          </div>
          <p className="text-xs font-mono text-[#ef4444]/90 break-all">
            {heartbeat.last_error}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function TaskCard({
  task,
  steps,
  notes,
  index,
}: {
  task: TaskEnvelope;
  steps: TaskStep[];
  notes: TaskNote[];
  index: number;
}) {
  const style = TASK_STATUS_STYLE[task.status];
  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {task.title}
            </h4>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {task.id} · via {task.source} · owner {task.owner}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className={`uppercase tracking-wider ${style.text}`}>
            {style.label}
          </span>
          <span className="text-muted-foreground">
            updated {fmtRelative(task.updated_at)}
          </span>
        </div>
      </div>
      {steps.length > 0 && (
        <div className="px-5 py-3 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Plan
          </div>
          <ol className="space-y-1.5">
            {steps.map((s) => (
              <li
                key={`${s.task_id}-${s.step}`}
                className="flex items-center gap-3 text-xs font-mono"
              >
                <StepIcon status={s.status} />
                <span className="text-muted-foreground w-4">{s.step}.</span>
                <span
                  className="font-semibold"
                  style={{ color: AGENT_COLOR[s.agent] ?? '#fff' }}
                >
                  {s.agent.toUpperCase()}
                </span>
                <span className="text-foreground/80 truncate flex-1">
                  {s.action}
                </span>
                <span className="text-muted-foreground">
                  {fmtDuration(s.duration_ms)}
                </span>
                {s.error && (
                  <span className="text-[#ef4444] truncate" title={s.error}>
                    err
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      {notes.length > 0 && (
        <div className="px-5 py-3 bg-surface-elevated/40">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            Mimir's commentary
          </div>
          <ul className="space-y-1 text-xs text-foreground/80">
            {notes.map((n) => (
              <li key={n.id} className="leading-relaxed">
                <span
                  className="font-mono text-[10px] uppercase mr-2"
                  style={{ color: AGENT_COLOR[n.agent] ?? '#fff' }}
                >
                  {n.agent}
                </span>
                {n.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export function TaskBoard({
  tasks,
  steps,
  notes,
  heartbeat,
  activeWindow = 5,
}: TaskBoardProps) {
  const [showArchive, setShowArchive] = useState(false);

  // Partition tasks: active (in-flight or done in last 24h) vs archived (rest).
  const { active, archived } = useMemo(() => {
    const now = Date.now();
    const a: TaskEnvelope[] = [];
    const b: TaskEnvelope[] = [];
    for (const t of tasks) {
      if (isActive(t, now)) a.push(t);
      else b.push(t);
    }
    return { active: a.slice(0, activeWindow), archived: b };
  }, [tasks, activeWindow]);

  const stepsByTask = useMemo(() => {
    const m = new Map<string, TaskStep[]>();
    for (const s of steps) {
      if (!m.has(s.task_id)) m.set(s.task_id, []);
      m.get(s.task_id)!.push(s);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.step - b.step);
    return m;
  }, [steps]);

  const notesByTask = useMemo(() => {
    const m = new Map<string, TaskNote[]>();
    for (const n of notes) {
      if (!m.has(n.task_id)) m.set(n.task_id, []);
      m.get(n.task_id)!.push(n);
    }
    return m;
  }, [notes]);

  // Empty state — only when nothing real to show AND no Hermes heartbeat.
  if (tasks.length === 0 && !heartbeat) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <FileClock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          no task envelopes yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          the next Kratos heartbeat will seed one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pinned: Hermes background sync (always at top) */}
      {heartbeat && <HermesBackgroundCard heartbeat={heartbeat} />}

      {/* Active task cards */}
      {active.map((task, i) => (
        <TaskCard
          key={task.id}
          task={task}
          steps={stepsByTask.get(task.id) ?? []}
          notes={(notesByTask.get(task.id) ?? []).slice(0, 3)}
          index={i}
        />
      ))}

      {/* No active tasks — give the user a clear hint */}
      {active.length === 0 && tasks.length > 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface/60 p-6 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            no active tasks. {archived.length} archived below.
          </p>
        </div>
      )}

      {/* Archive expander */}
      {archived.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowArchive((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-3 border border-dashed border-border rounded-xl bg-surface/40"
          >
            {showArchive ? (
              <>
                <ChevronUp className="w-4 h-4" />
                hide archive
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                show {archived.length} archived task{archived.length === 1 ? '' : 's'}
              </>
            )}
          </button>

          {showArchive && (
            <div className="space-y-4 mt-4">
              {archived.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  steps={stepsByTask.get(task.id) ?? []}
                  notes={(notesByTask.get(task.id) ?? []).slice(0, 3)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
