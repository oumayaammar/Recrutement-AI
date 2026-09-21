'use client';
import React from 'react';
import { getScoreTier, scoreTierConfig } from '@/lib/types/matching';

interface MatchingScoreProps {
  score: number;
  showLabel?: boolean;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatchingScore({
  score,
  showLabel = true,
  showBar = true,
  size = 'md',
}: MatchingScoreProps) {
  const tier = getScoreTier(score);
  const config = scoreTierConfig[tier];
  const pct = Math.min(100, Math.max(0, Math.round(score)));

  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex flex-col gap-1.5 min-w-[100px]">
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <span
            className={`font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass} ${textSize}`}
          >
            {config.label}
          </span>
        )}
        <span className={`font-bold text-foreground tabular-nums ${textSize}`}>{pct}%</span>
      </div>
      {showBar && (
        <div className={`w-full bg-muted rounded-full overflow-hidden ${barHeight}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
