'use client';

import { motion } from 'framer-motion';

interface PipelineLineProps {
  fromAgent: 'kratos' | 'loki';
  toAgent: 'loki' | 'mimir';
  isActive?: boolean;
}

const colorMap = {
  kratos: '#f59e0b',
  loki: '#06b6d4',
  mimir: '#8b5cf6',
};

export function PipelineLine({ fromAgent, toAgent, isActive = false }: PipelineLineProps) {
  const fromColor = colorMap[fromAgent];
  const toColor = colorMap[toAgent];

  return (
    <div className="relative w-24 h-8 flex items-center justify-center mx-2">
      {/* Base dashed line */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${fromAgent}-${toAgent}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={fromColor} stopOpacity={isActive ? 0.8 : 0.3} />
            <stop offset="100%" stopColor={toColor} stopOpacity={isActive ? 0.8 : 0.3} />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="16"
          x2="100"
          y2="16"
          stroke={`url(#gradient-${fromAgent}-${toAgent})`}
          strokeWidth="2"
          strokeDasharray="6 4"
          className={isActive ? '' : 'opacity-50'}
        />
      </svg>

      {/* Traveling dots when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: fromColor,
              boxShadow: `0 0 10px ${fromColor}`,
            }}
            initial={{ x: -48 }}
            animate={{ x: 48 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: toColor,
              boxShadow: `0 0 10px ${toColor}`,
            }}
            initial={{ x: -48 }}
            animate={{ x: 48 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.75,
            }}
          />
        </>
      )}

      {/* Arrow head */}
      <svg
        className="absolute right-0 w-4 h-4"
        viewBox="0 0 16 16"
        style={{ right: '-4px' }}
      >
        <polygon
          points="0,4 8,8 0,12"
          fill={toColor}
          opacity={isActive ? 1 : 0.5}
        />
      </svg>
    </div>
  );
}

// Mini version for footer
export function MiniPipelineVisualization({ status }: { status: 'idle' | 'active' }) {
  const isActive = status === 'active';
  
  return (
    <div className="flex items-center gap-1">
      {/* Kratos dot */}
      <div 
        className={`w-3 h-3 rounded-full bg-[#f59e0b] ${isActive ? 'animate-pulse' : ''}`}
        style={{ boxShadow: isActive ? '0 0 8px #f59e0b' : 'none' }}
      />
      
      {/* Line to Loki */}
      <div className="w-6 h-0.5 bg-gradient-to-r from-[#f59e0b] to-[#06b6d4] opacity-50" />
      
      {/* Loki dot */}
      <div 
        className={`w-3 h-3 rounded-full bg-[#06b6d4] ${isActive ? 'animate-pulse' : ''}`}
        style={{ boxShadow: isActive ? '0 0 8px #06b6d4' : 'none' }}
      />
      
      {/* Line to Mimir */}
      <div className="w-6 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] opacity-50" />
      
      {/* Mimir dot */}
      <div 
        className={`w-3 h-3 rounded-full bg-[#8b5cf6] ${isActive ? 'animate-pulse' : ''}`}
        style={{ boxShadow: isActive ? '0 0 8px #8b5cf6' : 'none' }}
      />
    </div>
  );
}
