'use client';
import React from 'react';
import { getScoreTier, scoreTierConfig } from '@/lib/types/matching';

interface MatchingScoreBadgeProps {
  score: number | null | undefined;
  className?: string;
}

export default function MatchingScoreBadge({ score, className = '' }: MatchingScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className={`inline-flex items-center text-xs font-medium bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full ${className}`}>
        —
      </span>
    );
  }

  const tier = getScoreTier(score);
  const config = scoreTierConfig[tier];
  const pct = Math.round(score);

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.barColor}`} />
      {pct}% {config.label}
    </span>
  );
}
