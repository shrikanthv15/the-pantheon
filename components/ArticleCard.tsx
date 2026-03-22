'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { Article, ArticleCategory } from '@/types';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const categoryConfig: Record<ArticleCategory, { label: string; className: string }> = {
  model_release: { 
    label: 'MODEL RELEASE', 
    className: 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30' 
  },
  framework: { 
    label: 'FRAMEWORK', 
    className: 'bg-[#06b6d4]/20 text-[#22d3ee] border-[#06b6d4]/30' 
  },
  github: { 
    label: 'GITHUB', 
    className: 'bg-[#8b5cf6]/20 text-[#a78bfa] border-[#8b5cf6]/30' 
  },
  funding: { 
    label: 'FUNDING', 
    className: 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' 
  },
  research: { 
    label: 'RESEARCH', 
    className: 'bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]/30' 
  },
  other: { 
    label: 'OTHER', 
    className: 'bg-muted text-muted-foreground border-border' 
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function truncateUrl(url: string, maxLength: number = 30): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > maxLength ? display.slice(0, maxLength) + '...' : display;
  } catch {
    return url.slice(0, maxLength) + '...';
  }
}

function isRecent(timestamp: string): boolean {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 2;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const category = categoryConfig[article.category];
  const recent = isRecent(article.published_at);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.5)' }}
      className="
        group relative rounded-xl border border-border bg-surface p-5
        transition-all duration-300 break-inside-avoid mb-4
        hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]
      "
    >
      {/* New badge */}
      {recent && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ef4444] text-xs font-semibold text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          NEW
        </div>
      )}

      {/* Category badge */}
      <span className={`
        inline-block px-2 py-0.5 rounded-full text-xs font-mono font-medium
        border ${category.className} mb-3
      `}>
        {category.label}
      </span>

      {/* Title */}
      <h3 className="
        text-lg font-bold text-foreground leading-tight mb-2
        group-hover:text-[#fbbf24] transition-colors duration-300
        group-hover:[text-shadow:0_0_20px_rgba(251,191,36,0.3)]
      ">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {article.summary}
      </p>

      {/* Bottom bar */}
      <div className="flex items-center justify-between text-xs">
        {/* Source URL */}
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">{truncateUrl(article.source_url)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Publisher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-muted-foreground">MIMIR</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-muted-foreground">
            {formatRelativeTime(article.published_at)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
