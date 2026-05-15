'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Star, Home, MapPin, Users, Calendar } from 'lucide-react';
import {
  getFbLeads,
  subscribeToFbLeads,
  setFbLeadReply,
} from '@/lib/supabase';
import type { FbLead } from '@/types';

/** Filter chips. */
type LeadFilter = 'matches' | 'cortland' | 'all' | 'mine';

const filterChips: { value: LeadFilter; label: string; color: string }[] = [
  { value: 'matches',  label: 'Matches',          color: '#10b981' },
  { value: 'cortland', label: '⭐ Cortland',       color: '#f59e0b' },
  { value: 'all',      label: 'All captures',     color: '#9ca3af' },
  { value: 'mine',     label: 'My replies',        color: '#a78bfa' },
];

function formatAge(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fbPermalink(lead: FbLead): string {
  // The post_id + group_id is enough to rebuild a canonical URL.
  return `https://www.facebook.com/groups/${lead.group_id}/posts/${lead.post_id}/`;
}

function MatchPills({ reason }: { reason: string | null }) {
  if (!reason) return null;
  const parts = reason.split(/\s*\|\s*/).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {parts.map((p, i) => {
        const isCortland = /cortland/i.test(p);
        const base = 'px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border';
        if (isCortland) {
          return (
            <span
              key={i}
              className={`${base} border-[#f59e0b]/60 bg-[#f59e0b]/10 text-[#fbbf24]`}
            >
              {p.replace(/^⭐\s*/, '⭐ ')}
            </span>
          );
        }
        return (
          <span
            key={i}
            className={`${base} border-[#10b981]/30 bg-[#10b981]/5 text-[#34d399]`}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, onReply }: {
  lead: FbLead;
  onReply: (post_id: string, reply: string | null) => void;
}) {
  const isCortland = lead.match_reason ? /cortland/i.test(lead.match_reason) : false;
  const age = formatAge(lead.posted_at ?? lead.discovered_at);
  const bodyLines = (lead.body ?? '').split('\n').filter(Boolean);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative rounded-xl border bg-surface/60 p-5
        transition-all hover:bg-surface/80 hover:border-foreground/30
        ${isCortland
          ? 'border-[#f59e0b]/50 shadow-[0_0_30px_-10px_rgba(245,158,11,0.4)]'
          : lead.matches_filter
            ? 'border-[#10b981]/30'
            : 'border-border/60'}
      `}
    >
      {isCortland && (
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#f59e0b] text-background text-[10px] font-bold tracking-widest flex items-center gap-1">
          <Star className="w-3 h-3" /> CORTLAND
        </div>
      )}

      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Home className="w-3 h-3" />
            <span className="truncate">{lead.group_name ?? lead.group_id}</span>
            <span className="opacity-50">·</span>
            <Calendar className="w-3 h-3" />
            <span>{age}</span>
          </div>
          {lead.author_name && (
            <div className="text-sm text-foreground font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              {lead.author_name}
            </div>
          )}
        </div>
        <a
          href={fbPermalink(lead)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground transition-colors"
        >
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
        {bodyLines.slice(0, expanded ? bodyLines.length : 6).join('\n')}
        {bodyLines.length > 6 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-2 text-xs text-[#a78bfa] hover:underline"
          >
            …show {bodyLines.length - 6} more lines
          </button>
        )}
      </div>

      {lead.image_urls && lead.image_urls.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {lead.image_urls.slice(0, 4).map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u}
              src={u}
              alt=""
              loading="lazy"
              className="h-24 w-24 rounded-md object-cover border border-border shrink-0"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      <MatchPills reason={lead.match_reason} />

      {/* Reply row */}
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground mr-1">Mark:</span>
        {(['interested', 'maybe', 'skip', null] as const).map((tag) => {
          const isActive = lead.user_reply === tag || (tag === null && !lead.user_reply);
          const label = tag ?? 'clear';
          return (
            <button
              key={label}
              onClick={() => onReply(lead.post_id, tag)}
              className={`
                px-2 py-1 rounded border text-[11px] uppercase tracking-wider transition-colors
                ${isActive
                  ? tag === 'interested' ? 'bg-[#10b981]/20 border-[#10b981] text-[#34d399]'
                  : tag === 'maybe'      ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]'
                  : tag === 'skip'       ? 'bg-[#ef4444]/15 border-[#ef4444]/60 text-[#fca5a5]'
                  : 'bg-foreground/10 border-foreground/40 text-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/50'}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </motion.article>
  );
}

export default function HousingPage() {
  const [leads, setLeads] = useState<FbLead[]>([]);
  const [filter, setFilter] = useState<LeadFilter>('matches');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await getFbLeads(500);
    setLeads(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribeToFbLeads(() => refresh());
    const interval = setInterval(refresh, 30_000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [refresh]);

  const handleReply = useCallback(async (post_id: string, reply: string | null) => {
    // Optimistic update
    setLeads((cur) => cur.map((l) => l.post_id === post_id ? { ...l, user_reply: reply } : l));
    await setFbLeadReply(post_id, reply);
  }, []);

  const counts = useMemo(() => ({
    all:       leads.length,
    matches:   leads.filter((l) => l.matches_filter).length,
    cortland:  leads.filter((l) => l.match_reason && /cortland/i.test(l.match_reason)).length,
    mine:      leads.filter((l) => l.user_reply).length,
  }), [leads]);

  const visible = useMemo(() => {
    let pool = leads;
    if (filter === 'matches')   pool = pool.filter((l) => l.matches_filter);
    if (filter === 'cortland')  pool = pool.filter((l) => l.match_reason && /cortland/i.test(l.match_reason));
    if (filter === 'mine')      pool = pool.filter((l) => !!l.user_reply);
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter((l) =>
        (l.body ?? '').toLowerCase().includes(q) ||
        (l.author_name ?? '').toLowerCase().includes(q) ||
        (l.group_name ?? '').toLowerCase().includes(q) ||
        (l.match_reason ?? '').toLowerCase().includes(q),
      );
    }
    return pool;
  }, [leads, filter, search]);

  return (
    <div className="min-h-screen bg-background grid-background">
      <Navigation />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-[#fbbf24]" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">DISHA · HOUSING SCOUT</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Live feed of Facebook-group apartment leads, scraped every 15 minutes by{' '}
              <span className="text-[#22d3ee] font-medium">Loki</span>. Hard filter: female · Allen-area · new lease or join existing · no sublease.{' '}
              <span className="text-[#fbbf24] font-medium">Cortland Allen Station</span> mentions are boosted.
            </p>
          </motion.div>

          {/* Filter chips + search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col md:flex-row gap-3 mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => {
                const isActive = filter === chip.value;
                const n = counts[chip.value];
                return (
                  <button
                    key={chip.value}
                    onClick={() => setFilter(chip.value)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${isActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-muted-foreground border-border hover:border-foreground/50'}
                    `}
                  >
                    {chip.label}{' '}
                    <span className="opacity-60">({n})</span>
                  </button>
                );
              })}
            </div>
            <div className="relative md:ml-auto md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search body / author / group…"
                className="pl-9 bg-surface/60"
              />
            </div>
          </motion.div>

          {/* Feed */}
          {loading && (
            <div className="text-center py-16 text-muted-foreground">Loading…</div>
          )}
          {!loading && visible.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No leads match this view.</p>
              <p className="text-xs mt-1">
                {filter === 'matches' && counts.all > 0
                  ? `${counts.all} captures total but none passed the tight filter. Try "All captures".`
                  : 'Scraper runs every 15 min. New posts will appear here automatically.'}
              </p>
            </div>
          )}
          <div className="grid gap-4">
            {visible.map((lead) => (
              <LeadCard key={lead.post_id} lead={lead} onReply={handleReply} />
            ))}
          </div>

          {!loading && visible.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              Showing {visible.length} of {leads.length} captures · auto-refresh every 30s
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
