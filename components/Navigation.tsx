'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  color?: string;
}

function NavLink({ href, children, isActive, color = '#f59e0b' }: NavLinkProps) {
  return (
    <a
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeSection"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </a>
  );
}

// TODO: Replace with WebSocket status for real-time system health
type SystemStatus = 'operational' | 'active' | 'error';

const statusConfig = {
  operational: { 
    label: 'ALL SYSTEMS OPERATIONAL', 
    dotClass: 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
  },
  active: { 
    label: 'PIPELINE ACTIVE', 
    dotClass: 'bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' 
  },
  error: { 
    label: 'SYSTEM ERROR', 
    dotClass: 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
  },
};

export function Navigation() {
  const [activeSection, setActiveSection] = useState('status');
  const [systemStatus] = useState<SystemStatus>('operational');
  const status = statusConfig[systemStatus];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['status', 'agents', 'feed', 'articles', 'metrics', 'logs'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionColors: Record<string, string> = {
    status: '#f59e0b',
    agents: '#06b6d4',
    feed: '#ef4444',
    articles: '#8b5cf6',
    metrics: '#10b981',
    logs: '#f59e0b',
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              🦞
            </motion.span>
            <span className="font-bold tracking-widest text-foreground group-hover:text-[#fbbf24] transition-colors">
              THE PANTHEON
            </span>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#fbbf24] group-hover:w-full transition-all duration-300" />
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="#status" isActive={activeSection === 'status'} color={sectionColors.status}>
              Status
            </NavLink>
            <NavLink href="#agents" isActive={activeSection === 'agents'} color={sectionColors.agents}>
              Agents
            </NavLink>
            <NavLink href="#feed" isActive={activeSection === 'feed'} color={sectionColors.feed}>
              Feed
            </NavLink>
            <NavLink href="#articles" isActive={activeSection === 'articles'} color={sectionColors.articles}>
              Articles
            </NavLink>
            <NavLink href="#logs" isActive={activeSection === 'logs'} color={sectionColors.logs}>
              Logs
            </NavLink>
          </div>

          {/* System health pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
            <div className={`w-2 h-2 rounded-full ${status.dotClass}`} />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
