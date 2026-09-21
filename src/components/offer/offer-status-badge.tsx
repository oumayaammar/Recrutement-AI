'use client';
import React from 'react';
import { statutOffreLabel, statutOffreColor } from '@/lib/types/offer';
import type { StatutOffre } from '@/lib/types/offer';

interface OfferStatusBadgeProps {
  statut: StatutOffre;
  dot?: boolean;
  className?: string;
}

export default function OfferStatusBadge({ statut, dot = false, className = '' }: OfferStatusBadgeProps) {
  const colorClass = statutOffreColor(statut);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorClass} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {statutOffreLabel(statut)}
    </span>
  );
}
