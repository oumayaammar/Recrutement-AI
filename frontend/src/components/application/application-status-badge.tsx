'use client';
import React from 'react';
import { statutCandidatureLabel, statutCandidatureColor } from '@/lib/types/application';
import type { StatutCandidature } from '@/lib/types/application';

interface ApplicationStatusBadgeProps {
  statut: StatutCandidature;
  dot?: boolean;
  className?: string;
}

export default function ApplicationStatusBadge({
  statut,
  dot = false,
  className = '',
}: ApplicationStatusBadgeProps) {
  const colorClass = statutCandidatureColor(statut);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorClass} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {statutCandidatureLabel(statut)}
    </span>
  );
}
