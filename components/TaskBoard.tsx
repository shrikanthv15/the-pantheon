'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Circle, Loader2, XCircle, FileClock } from 'lucide-react';
import type { AgentId, TaskEnvelope, TaskNote, TaskStep } from '@/types';

interface TaskBoardProps {
  tasks: TaskEnvelope[];
  steps: TaskStep[];
  notes: TaskNote[];
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

export function TaskBoard({ tasks, steps, notes }: TaskBoardProps) {
  if (tasks.length === 0) {
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

  const stepsByTask = new Map<string, TaskStep[]>();
  for (const s of steps) {
    if (!stepsByTask.has(s.task_id)) stepsByTask.set(s.task_id, []);
    stepsByTask.get(s.task_id)!.push(s);
  }
  const notesByTask = new Map<string, TaskNote[]>();
  for (const n of notes) {
    if (!notesByTask.has(n.task_id)) notesByTask.set(n.task_id, []);
    notesByTask.get(n.task_id)!.push(n);
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, i) => {
        const taskSteps = (stepsByTask.get(task.id) ?? []).sort((a, b) => a.step - b.step);
        const taskNotes = (notesByTask.get(task.id) ?? []).slice(0, 3);
        const style = TASK_STATUS_STYLE[task.status];
        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            {/* Header */}
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

            {/* Plan */}
            {taskSteps.length > 0 && (
              <div className="px-5 py-3 border-b border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Plan
                </div>
                <ol className="space-y-1.5">
                  {taskSteps.map((s) => (
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

            {/* Notes */}
            {taskNotes.length > 0 && (
              <div className="px-5 py-3 bg-surface-elevated/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  Mimir's commentary
                </div>
                <ul className="space-y-1 text-xs text-foreground/80">
                  {taskNotes.map((n) => (
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
      })}
    </div>
  );
}
