'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { AgentCard } from '@/components/AgentCard';
import { LogFeed, LogTicker } from '@/components/LogFeed';
import { OracleFeed } from '@/components/OracleFeed';
import { MetricsPanel } from '@/components/MetricsPanel';
import { Footer } from '@/components/Footer';
import { 
  agents, 
  placeholderArticles, 
  placeholderLogs, 
  pipelineState,
  getAgentMetrics,
} from '@/lib/supabase';

// Placeholder metrics - would be fetched from Supabase in production
const metrics = [
  { agentId: 'kratos' as const, tokensUsed: 1240, totalTokens: 10000, uptime: '99.9%', memoryChunks: 0 },
  { agentId: 'loki' as const, tokensUsed: 3450, totalTokens: 10000, uptime: '99.7%', memoryChunks: 0 },
  { agentId: 'mimir' as const, tokensUsed: 2100, totalTokens: 10000, uptime: '99.8%', memoryChunks: 0 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  },
};

export default function PantheonPage() {
  return (
    <div className="min-h-screen bg-background grid-background">
      {/* Section 1: Sticky Navigation */}
      <Navigation />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 2: Hero - Live Status Dashboard */}
        <motion.div variants={sectionVariants}>
          <HeroSection agents={agents} pipelineState={pipelineState} />
        </motion.div>

        {/* Section 3: Agent Detail Cards */}
        <motion.section
          id="agents"
          variants={sectionVariants}
          className="px-4 py-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                THE AGENTS
              </h2>
              <p className="text-muted-foreground">
                Meet the autonomous AI agents powering The Pantheon
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section 4: Live Activity Feed */}
        <motion.section
          id="feed"
          variants={sectionVariants}
          className="px-4 py-16 bg-surface-elevated"
        >
          <div className="max-w-5xl mx-auto">
            <LogFeed logs={placeholderLogs} />
          </div>
        </motion.section>

        {/* Section 5: The Oracle Feed (Articles) */}
        <motion.div variants={sectionVariants}>
          <OracleFeed articles={placeholderArticles} />
        </motion.div>

        {/* Section 6: System Metrics */}
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
                Real-time operational intelligence
              </p>
            </div>
            <MetricsPanel agents={agents} metrics={metrics} />
          </div>
        </motion.section>

        {/* Section 7: Live Log Stream (Compact Ticker) */}
        <motion.section
          id="logs"
          variants={sectionVariants}
          className="px-4 py-8"
        >
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
            <LogTicker logs={placeholderLogs} />
          </div>
        </motion.section>

        {/* Section 8: Footer */}
        <Footer pipelineState={pipelineState} />
      </motion.main>
    </div>
  );
}
