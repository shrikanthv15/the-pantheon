'use client';

import { motion } from 'framer-motion';
import { MiniPipelineVisualization } from '@/components/PipelineLine';
import type { PipelineState } from '@/types';

interface FooterProps {
  pipelineState: PipelineState;
}

export function Footer({ pipelineState }: FooterProps) {
  const isActive = pipelineState.status !== 'idle';

  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Logo and tagline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🦞
              </motion.span>
              <span className="font-bold tracking-widest text-foreground">
                THE PANTHEON
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Built with autonomous AI. Powered by the Pantheon.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#fbbf24]">Kratos</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-[#22d3ee]">Loki</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-[#a78bfa]">Mimir</span>
            </div>
          </div>

          {/* Center - Pipeline status */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Pipeline Status
            </p>
            <MiniPipelineVisualization status={isActive ? 'active' : 'idle'} />
          </div>

          {/* Right - Links */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-4 mb-4">
              <a
                href="https://twoby2.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                twoby2.dev
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Powered by OpenClaw · GitHub Copilot · Supabase · Cloudflare
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center font-mono">
            © 2026 Shri / twoby2.dev — The Pantheon Autonomous Newsroom
          </p>
        </div>
      </div>
    </footer>
  );
}
