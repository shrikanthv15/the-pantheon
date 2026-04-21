'use client';

import { Shield, Zap, BookOpen, Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Agent, AgentId } from '@/types';

interface AgentNodeProps {
  agent: Agent;
}

const iconMap: Record<AgentId, typeof Shield> = {
  kratos: Shield,
  loki: Zap,
  mimir: BookOpen,
  hermes: Feather,
};

const colorClasses: Record<AgentId, {
  glow: string; border: string; text: string; bg: string; ring: string;
}> = {
  kratos: {
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    border: 'border-[#f59e0b]',
    text: 'text-[#fbbf24]',
    bg: 'bg-[#f59e0b]/10',
    ring: 'ring-[#f59e0b]/50',
  },
  loki: {
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
    border: 'border-[#06b6d4]',
    text: 'text-[#22d3ee]',
    bg: 'bg-[#06b6d4]/10',
    ring: 'ring-[#06b6d4]/50',
  },
  mimir: {
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]',
    border: 'border-[#8b5cf6]',
    text: 'text-[#a78bfa]',
    bg: 'bg-[#8b5cf6]/10',
    ring: 'ring-[#8b5cf6]/50',
  },
  hermes: {
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    border: 'border-[#10b981]',
    text: 'text-[#34d399]',
    bg: 'bg-[#10b981]/10',
    ring: 'ring-[#10b981]/50',
  },
};

const statusConfig = {
  idle: { label: 'IDLE', className: 'bg-muted-foreground/20 text-muted-foreground' },
  running: { label: 'RUNNING', className: 'bg-[#f59e0b]/20 text-[#fbbf24] pulse-glow' },
  complete: { label: 'COMPLETE', className: 'bg-[#10b981]/20 text-[#10b981]' },
  error: { label: 'ERROR', className: 'bg-[#ef4444]/20 text-[#ef4444]' },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' UTC';
}

export function AgentNode({ agent }: AgentNodeProps) {
  const Icon = iconMap[agent.id];
  const colors = colorClasses[agent.id];
  const status = statusConfig[agent.status];
  const isActive = agent.status === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative w-[200px] rounded-xl border ${colors.border} ${colors.bg}
        bg-surface p-6 transition-all duration-300
        ${isActive ? colors.glow : 'hover:' + colors.glow}
      `}
    >
      {/* Glow ring at top */}
      <div className={`
        absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full
        ${colors.bg} ${isActive ? 'animate-pulse' : ''}
      `} style={{ backgroundColor: agent.color }} />

      {/* Icon with glow ring */}
      <div className="flex justify-center mb-4">
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            relative p-4 rounded-full ring-2 ${colors.ring} ${colors.bg}
            ${isActive ? colors.glow : ''}
          `}
        >
          <Icon 
            className={`w-8 h-8 ${colors.text}`}
            strokeWidth={1.5}
          />
        </motion.div>
      </div>

      {/* Agent name */}
      <h3 className={`text-center font-bold text-lg tracking-wide ${colors.text}`}>
        {agent.name}
      </h3>
      
      {/* Role */}
      <p className="text-center text-sm text-muted-foreground mb-3">
        {agent.role}
      </p>

      {/* Status badge */}
      <div className="flex justify-center mb-3">
        <span className={`
          px-3 py-1 rounded-full text-xs font-mono font-medium
          ${status.className}
        `}>
          {status.label}
        </span>
      </div>

      {/* Last active */}
      <p className="text-center text-xs font-mono text-muted-foreground mb-2">
        {formatTimestamp(agent.lastActive)}
      </p>

      {/* Token counter */}
      <p className="text-center text-xs font-mono text-muted-foreground">
        <span className="text-[#10b981]">↑</span> {agent.tokensThisCycle.toLocaleString()} tokens
      </p>
    </motion.div>
  );
}
