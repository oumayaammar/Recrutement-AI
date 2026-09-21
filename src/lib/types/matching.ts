// ─── Matching Types ───────────────────────────────────────────────────────────

import type { CVRead } from './cv';

export interface ResultatRecherche {
  cv: CVRead;
  score_pertinence: number;
}

export interface MatchingResult {
  candidature_id: number;
  candidat_id: number;
  offre_id: number;
  score: number;
  rank: number;
}

export type ScoreTier = 'low' | 'medium' | 'good' | 'excellent';

export interface ScoreTierConfig {
  label: string;
  barColor: string;
  badgeClass: string;
  textColor: string;
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 30) return 'medium';
  return 'low';
}

export const scoreTierConfig: Record<ScoreTier, ScoreTierConfig> = {
  excellent: {
    label: 'Excellent',
    barColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textColor: 'text-emerald-600',
  },
  good: {
    label: 'Bon',
    barColor: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textColor: 'text-blue-600',
  },
  medium: {
    label: 'Moyen',
    barColor: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    textColor: 'text-amber-600',
  },
  low: {
    label: 'Faible',
    barColor: 'bg-red-400',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    textColor: 'text-red-500',
  },
};
