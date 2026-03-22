'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AgentNode } from '@/components/AgentNode';
import { PipelineLine } from '@/components/PipelineLine';
import type { Agent, PipelineState } from '@/types';

interface HeroSectionProps {
  agents: Agent[];
  pipelineState: PipelineState;
}

function CountdownTimer({ targetHours = 8 }: { targetHours?: number }) {
  const [timeLeft, setTimeLeft] = useState({ hours: targetHours, minutes: 0, seconds: 0 });

  useEffect(() => {
    const totalSeconds = targetHours * 60 * 60;
    let remaining = totalSeconds;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = totalSeconds;
      }
      
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetHours]);

  return (
    <span className="font-mono">
      {String(timeLeft.hours).padStart(2, '0')}h{' '}
      {String(timeLeft.minutes).padStart(2, '0')}m{' '}
      {String(timeLeft.seconds).padStart(2, '0')}s
    </span>
  );
}

export function HeroSection({ agents, pipelineState }: HeroSectionProps) {
  const isActive = pipelineState.status !== 'idle';
  const kratos = agents.find(a => a.id === 'kratos')!;
  const loki = agents.find(a => a.id === 'loki')!;
  const mimir = agents.find(a => a.id === 'mimir')!;

  return (
    <section id="status" className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-24 pb-16">
      {/* Eyebrow text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-mono text-[#22d3ee] tracking-widest mb-6"
      >
        AUTONOMOUS AI NEWSROOM // TWOBY2.DEV
      </motion.p>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-4 gradient-text"
      >
        THE PANTHEON
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl text-muted-foreground italic text-center mb-12"
      >
        Three agents. One pipeline. Infinite intelligence.
      </motion.p>

      {/* Pipeline visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-12"
      >
        <AgentNode agent={kratos} />
        <div className="hidden md:block">
          <PipelineLine fromAgent="kratos" toAgent="loki" isActive={isActive} />
        </div>
        <div className="md:hidden h-8 w-0.5 bg-gradient-to-b from-[#f59e0b] to-[#06b6d4]" />
        <AgentNode agent={loki} />
        <div className="hidden md:block">
          <PipelineLine fromAgent="loki" toAgent="mimir" isActive={isActive} />
        </div>
        <div className="md:hidden h-8 w-0.5 bg-gradient-to-b from-[#06b6d4] to-[#8b5cf6]" />
        <AgentNode agent={mimir} />
      </motion.div>

      {/* Last Pipeline Run stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-3xl rounded-xl border border-border bg-surface p-6 mb-8"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
          Last Pipeline Run
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">
              {pipelineState.article_count}
            </p>
            <p className="text-xs text-muted-foreground">Articles Published</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">
              {pipelineState.last_completed 
                ? new Date(pipelineState.last_completed).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) + ' UTC'
                : 'Never'}
            </p>
            <p className="text-xs text-muted-foreground">Last Run</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#22d3ee] font-mono">
              <CountdownTimer targetHours={8} />
            </p>
            <p className="text-xs text-muted-foreground">Next Run</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">
              {agents.reduce((sum, a) => sum + a.tokensThisCycle, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Tokens Used</p>
          </div>
        </div>
      </motion.div>

      {/* Trigger button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            {/* TODO: Add API route for triggering pipeline */}
            <Button
              size="lg"
              className="bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-bold px-8 py-6 text-lg"
              disabled
            >
              <Play className="w-5 h-5 mr-2" />
              TRIGGER PIPELINE
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin only</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </section>
  );
}
