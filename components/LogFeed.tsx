'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LogEntry } from '@/types';

interface LogFeedProps {
  logs: LogEntry[];
  compact?: boolean;
}

const agentColors: Record<string, string> = {
  kratos: 'text-[#fbbf24]',
  loki: 'text-[#22d3ee]',
  mimir: 'text-[#a78bfa]',
  hermes: 'text-[#34d399]',
  system: 'text-muted-foreground',
};

const levelColors = {
  info: 'text-foreground',
  warn: 'text-[#f59e0b]',
  error: 'text-[#ef4444]',
  success: 'text-[#10b981]',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

export function LogFeed({ logs, compact = false }: LogFeedProps) {
  // BUGFIX: previously did `useState(logs)` which captured the prop
  // exactly once and never updated. Now visibleLogs is derived: it
  // tracks `logs` live, and only freezes to a snapshot while paused.
  const [isPaused, setIsPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<LogEntry[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleLogs = useMemo(
    () => (isPaused && snapshot ? snapshot : logs),
    [isPaused, snapshot, logs],
  );

  const togglePause = () => {
    if (isPaused) {
      setSnapshot(null);
      setIsPaused(false);
    } else {
      setSnapshot(logs); // freeze to current state
      setIsPaused(true);
    }
  };

  const handleCopyAll = async () => {
    const logText = visibleLogs
      .map(log => `[${formatTimestamp(log.timestamp)}] [${log.agent.toUpperCase()}] ${log.message}`)
      .join('\n');
    await navigator.clipboard.writeText(logText);
  };

  const handleDownload = () => {
    const logText = visibleLogs
      .map(log => `[${formatTimestamp(log.timestamp)}] [${log.agent.toUpperCase()}] ${log.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantheon-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="relative overflow-hidden h-32 bg-surface rounded-lg border border-border">
        <div className="absolute inset-0 scanlines opacity-30" />
        <div className="p-3 h-full overflow-hidden">
          <AnimatePresence mode="popLayout">
            {visibleLogs.slice(0, 5).map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xs font-mono truncate mb-1"
              >
                <span className="text-muted-foreground">[{formatTimestamp(log.timestamp).split(' ')[0]}]</span>
                {' '}
                <span className={agentColors[log.agent]}>[{log.agent.toUpperCase()}]</span>
                {' '}
                <span className={levelColors[log.level]}>{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-sm font-semibold">LIVE PIPELINE FEED</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            className="h-8 px-2"
            title={isPaused ? 'Resume live feed' : 'Pause feed'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAll}
            className="h-8 px-2"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal display */}
      <div 
        ref={containerRef}
        className="relative h-[400px] overflow-y-auto p-4 font-mono text-sm"
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        
        <AnimatePresence mode="popLayout">
          {visibleLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.02 }}
              className="mb-2 flash-in"
            >
              <span className="text-muted-foreground">[{formatTimestamp(log.timestamp)}]</span>
              {' '}
              <span className={agentColors[log.agent]}>[{log.agent.toUpperCase().padEnd(6)}]</span>
              {' '}
              <span className={levelColors[log.level]}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Cursor */}
        <div className="flex items-center mt-2">
          <span className="text-[#10b981]">{'>'}</span>
          <span className="w-2 h-4 bg-[#10b981] ml-1 cursor-blink" />
        </div>
      </div>
    </div>
  );
}

// Compact ticker version for section 7
export function LogTicker({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="relative overflow-hidden h-40 bg-surface rounded-lg border border-border">
      <div className="absolute inset-0 scanlines opacity-20" />
      <motion.div
        animate={{ y: [0, -20] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="p-3"
      >
        {logs.slice(0, 5).map((log) => (
          <div
            key={log.id}
            className="text-xs font-mono mb-2 py-1"
          >
            <span className="text-muted-foreground">[{formatTimestamp(log.timestamp).split(' ')[0]}]</span>
            {' '}
            <span className={agentColors[log.agent]}>[{log.agent.toUpperCase()}]</span>
            {' '}
            <span className={levelColors[log.level]}>{log.message}</span>
          </div>
        ))}
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
