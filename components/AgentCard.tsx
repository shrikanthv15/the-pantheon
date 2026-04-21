'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import type { Agent, AgentId } from '@/types';

interface AgentCardProps {
  agent: Agent;
}

const statusConfig = {
  idle: { label: 'IDLE', dotClass: 'bg-muted-foreground' },
  running: { label: 'RUNNING', dotClass: 'bg-[#f59e0b] animate-pulse' },
  complete: { label: 'COMPLETE', dotClass: 'bg-[#10b981]' },
  error: { label: 'ERROR', dotClass: 'bg-[#ef4444]' },
};

// Animated SVG avatars for each agent
function KratosAvatar({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${isHovered ? 'spin-slow' : ''}`}
      style={{ animationDuration: isHovered ? '3s' : '20s' }}
    >
      <defs>
        <linearGradient id="kratos-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {/* Ouroboros-style interlocking circles */}
      <circle cx="50" cy="30" r="15" fill="none" stroke="url(#kratos-gradient)" strokeWidth="2" />
      <circle cx="35" cy="60" r="15" fill="none" stroke="url(#kratos-gradient)" strokeWidth="2" />
      <circle cx="65" cy="60" r="15" fill="none" stroke="url(#kratos-gradient)" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="url(#kratos-gradient)" opacity="0.5" />
    </svg>
  );
}

function LokiAvatar({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${isHovered ? 'spin-slow' : ''}`}
      style={{ animationDuration: isHovered ? '3s' : '20s' }}
    >
      <defs>
        <linearGradient id="loki-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Compass rose */}
      <polygon points="50,10 55,45 50,50 45,45" fill="url(#loki-gradient)" />
      <polygon points="90,50 55,55 50,50 55,45" fill="url(#loki-gradient)" />
      <polygon points="50,90 45,55 50,50 55,55" fill="url(#loki-gradient)" />
      <polygon points="10,50 45,45 50,50 45,55" fill="url(#loki-gradient)" />
      <circle cx="50" cy="50" r="5" fill="url(#loki-gradient)" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="url(#loki-gradient)" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

function MimirAvatar({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${isHovered ? 'spin-slow' : ''}`}
      style={{ animationDuration: isHovered ? '3s' : '20s' }}
    >
      <defs>
        <linearGradient id="mimir-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {/* Orbiting dots around center */}
      <circle cx="50" cy="50" r="8" fill="url(#mimir-gradient)" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="url(#mimir-gradient)" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="url(#mimir-gradient)" strokeWidth="1" opacity="0.3" />
      <circle cx="75" cy="50" r="4" fill="url(#mimir-gradient)" />
      <circle cx="50" cy="25" r="3" fill="url(#mimir-gradient)" opacity="0.8" />
      <circle cx="25" cy="50" r="3" fill="url(#mimir-gradient)" opacity="0.6" />
      <circle cx="65" cy="75" r="2" fill="url(#mimir-gradient)" opacity="0.7" />
    </svg>
  );
}

// Caduceus — Hermes's traditional symbol (two serpents around a winged staff)
function HermesAvatar({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 ${isHovered ? 'spin-slow' : ''}`}
      style={{ animationDuration: isHovered ? '3s' : '20s' }}
    >
      <defs>
        <linearGradient id="hermes-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* Central staff */}
      <line x1="50" y1="12" x2="50" y2="88" stroke="url(#hermes-gradient)" strokeWidth="2" />
      {/* Knob at top */}
      <circle cx="50" cy="12" r="4" fill="url(#hermes-gradient)" />
      {/* Wings */}
      <path
        d="M50,22 Q30,18 20,28 Q32,24 50,30 Q68,24 80,28 Q70,18 50,22 Z"
        fill="url(#hermes-gradient)"
        opacity="0.85"
      />
      {/* Serpent 1 (left) */}
      <path
        d="M50,35 Q35,42 50,52 Q65,62 50,72 Q40,78 50,85"
        fill="none"
        stroke="url(#hermes-gradient)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Serpent 2 (right) */}
      <path
        d="M50,35 Q65,42 50,52 Q35,62 50,72 Q60,78 50,85"
        fill="none"
        stroke="url(#hermes-gradient)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

const avatarMap: Record<AgentId, (p: { isHovered: boolean }) => ReactElement> = {
  kratos: KratosAvatar,
  loki: LokiAvatar,
  mimir: MimirAvatar,
  hermes: HermesAvatar,
};

const colorClasses: Record<AgentId, {
  gradient: string;
  text: string;
  border: string;
  glow: string;
}> = {
  kratos: {
    gradient: 'from-[#f59e0b] to-[#fbbf24]',
    text: 'text-[#fbbf24]',
    border: 'border-[#f59e0b]/30',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  loki: {
    gradient: 'from-[#06b6d4] to-[#22d3ee]',
    text: 'text-[#22d3ee]',
    border: 'border-[#06b6d4]/30',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
  },
  mimir: {
    gradient: 'from-[#8b5cf6] to-[#a78bfa]',
    text: 'text-[#a78bfa]',
    border: 'border-[#8b5cf6]/30',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
  },
  hermes: {
    gradient: 'from-[#10b981] to-[#34d399]',
    text: 'text-[#34d399]',
    border: 'border-[#10b981]/30',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
};

// TODO: Replace with Supabase query to get sparkline data
const placeholderSparklineData = [3, 5, 2, 7, 4, 6, 3, 8, 5, 4, 6, 7];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const width = 120;
  const height = 30;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="mt-2">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AgentCard({ agent }: AgentCardProps) {
  const Avatar = avatarMap[agent.id];
  const colors = colorClasses[agent.id];
  const status = statusConfig[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative rounded-xl border ${colors.border} bg-surface overflow-hidden
        transition-shadow duration-300 ${colors.glow}
      `}
    >
      {/* Gradient header banner */}
      <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Left column - Avatar and status */}
          <div className="flex flex-col items-center">
            {/* Animated avatar */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <Avatar isHovered={false} />
            </motion.div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${status.dotClass}`} />
              <span className="text-xs font-mono text-muted-foreground">
                {status.label}
              </span>
            </div>

            {/* Soul quote */}
            <blockquote className="mt-4 text-xs text-muted-foreground italic text-center max-w-[150px] leading-relaxed">
              &ldquo;{agent.soul.split('.')[0]}.&rdquo;
            </blockquote>
          </div>

          {/* Right column - Details */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-4">
              <h3 className={`text-xl font-bold ${colors.text}`}>
                {agent.name}
              </h3>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>

            {/* Mission brief */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Mission
              </h4>
              <ul className="space-y-1">
                {agent.mission.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0`} style={{ backgroundColor: agent.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Model</span>
                <p className="font-mono text-foreground truncate" title={agent.model}>
                  {agent.model.split(' ')[0]}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Heartbeat</span>
                <p className="font-mono text-foreground">{agent.heartbeat}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sessions</span>
                <p className="font-mono text-foreground">{agent.sessionCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tokens</span>
                <p className="font-mono text-foreground">{agent.tokensThisCycle.toLocaleString()}</p>
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="mt-4">
              <span className="text-xs text-muted-foreground">Activity (24h)</span>
              <Sparkline data={placeholderSparklineData} color={agent.color} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
