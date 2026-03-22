'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Agent, AgentMetrics } from '@/types';

// TODO: Replace all values with Supabase query to agent_metrics table

interface MetricsPanelProps {
  agents: Agent[];
  metrics: AgentMetrics[];
}

const agentColors = {
  kratos: '#f59e0b',
  loki: '#06b6d4',
  mimir: '#8b5cf6',
};

// Placeholder data for articles per run chart
const articlesPerRunData = [
  { run: '1', articles: 6 },
  { run: '2', articles: 8 },
  { run: '3', articles: 5 },
  { run: '4', articles: 7 },
  { run: '5', articles: 9 },
  { run: '6', articles: 6 },
  { run: '7', articles: 8 },
];

function TokenProgressBar({ agent, metrics }: { agent: Agent; metrics: AgentMetrics }) {
  const percentage = (metrics.tokensUsed / metrics.totalTokens) * 100;
  
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{agent.name}</span>
        <span className="text-xs font-mono" style={{ color: agent.color }}>
          {metrics.tokensUsed.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: agent.color }}
        />
      </div>
    </div>
  );
}

function AgentHealthRow({ agent, metrics }: { agent: Agent; metrics: AgentMetrics }) {
  const statusDotClass = agent.status === 'running' 
    ? 'animate-pulse' 
    : agent.status === 'error' 
      ? 'bg-[#ef4444]' 
      : '';

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2 w-24">
        <div 
          className={`w-2 h-2 rounded-full ${statusDotClass}`}
          style={{ backgroundColor: agent.color }}
        />
        <span className="text-sm font-medium" style={{ color: agent.color }}>
          {agent.name}
        </span>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground block">Uptime</span>
          <span className="font-mono text-foreground">{metrics.uptime}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Model</span>
          <span className="font-mono text-foreground truncate block" title={agent.model}>
            {agent.model.split(' ')[0]}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Sessions</span>
          <span className="font-mono text-foreground">{agent.sessionCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">{metrics.memoryChunks} chunks</span>
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel({ agents, metrics }: MetricsPanelProps) {
  const totalTokens = metrics.reduce((sum, m) => sum + m.tokensUsed, 0);
  const estimatedCost = (totalTokens / 1000000) * 3; // $3 per 1M tokens estimate

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Column 1: Token Economy */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Token Economy
        </h3>
        
        <div className="mb-6">
          <span className="text-xs text-muted-foreground">Total Tokens This Cycle</span>
          <p className="text-3xl font-bold text-[#fbbf24] font-mono">
            {totalTokens.toLocaleString()}
          </p>
        </div>

        {agents.map(agent => {
          const agentMetrics = metrics.find(m => m.agentId === agent.id);
          if (!agentMetrics) return null;
          return (
            <TokenProgressBar 
              key={agent.id} 
              agent={agent} 
              metrics={agentMetrics} 
            />
          );
        })}

        <div className="mt-6 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Estimated Cost</span>
          <p className="text-xl font-bold text-foreground font-mono">
            ${estimatedCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Column 2: Pipeline Performance */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Pipeline Performance
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-xs text-muted-foreground block">Avg Duration</span>
            <p className="text-lg font-bold font-mono text-foreground">--</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Articles/Cycle</span>
            <p className="text-lg font-bold font-mono text-foreground">--</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Success Rate</span>
            <p className="text-lg font-bold font-mono text-[#10b981]">100%</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Total Runs</span>
            <p className="text-lg font-bold font-mono text-foreground">0</p>
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground block mb-2">Articles per Run</span>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={articlesPerRunData}>
                <XAxis 
                  dataKey="run" 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: '#2a2a3a' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: '#2a2a3a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar 
                  dataKey="articles" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Column 3: Agent Health */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Agent Health
        </h3>

        {agents.map(agent => {
          const agentMetrics = metrics.find(m => m.agentId === agent.id);
          if (!agentMetrics) return null;
          return (
            <AgentHealthRow 
              key={agent.id} 
              agent={agent} 
              metrics={agentMetrics} 
            />
          );
        })}
      </div>
    </motion.div>
  );
}
