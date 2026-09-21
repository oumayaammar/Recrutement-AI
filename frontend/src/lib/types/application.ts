// ─── Application Types ────────────────────────────────────────────────────────

export type StatutCandidature =
  | 'SUGGEREE' |'RECUE' |'PRESELECTIONNEE' |'ENTRETIEN' |'ACCEPTEE' |'REFUSEE';

export interface CandidatureRead {
  id: number;
  candidat_id: number;
  offre_id: number;
  date_candidature: string;
  statut: StatutCandidature;
  score_matching?: number | null;
}

export interface CandidatureCreate {
  candidat_id: number;
  offre_id: number;
  statut?: StatutCandidature;
}

export interface CandidatureUpdate {
  statut?: StatutCandidature;
  score_matching?: number;
}

export function statutCandidatureLabel(s: StatutCandidature): string {
  const m: Record<StatutCandidature, string> = {
    SUGGEREE: 'Suggérée',
    RECUE: 'Reçue',
    PRESELECTIONNEE: 'Présélectionnée',
    ENTRETIEN: 'Entretien',
    ACCEPTEE: 'Acceptée',
    REFUSEE: 'Refusée',
  };
  return m[s] ?? s;
}

export function statutCandidatureColor(s: StatutCandidature): string {
  const m: Record<StatutCandidature, string> = {
    SUGGEREE: 'bg-slate-100 text-slate-600 border-slate-200',
    RECUE: 'bg-blue-50 text-blue-700 border-blue-200',
    PRESELECTIONNEE: 'bg-violet-50 text-violet-700 border-violet-200',
    ENTRETIEN: 'bg-amber-50 text-amber-700 border-amber-200',
    ACCEPTEE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REFUSEE: 'bg-red-50 text-red-600 border-red-200',
  };
  return m[s] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}
