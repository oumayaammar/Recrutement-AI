// ─── Offer Types ──────────────────────────────────────────────────────────────

export type StatutOffre = 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE' | 'ARCHIVEE';

export interface OffreRead {
  id: number;
  recruteur_id: number;
  titre: string;
  description?: string;
  date_publication: string;
  statut: StatutOffre;
}

export interface OffreCreate {
  recruteur_id: number;
  titre: string;
  description?: string;
  statut?: StatutOffre;
}

export interface OffreUpdate {
  titre?: string;
  description?: string;
  statut?: StatutOffre;
}

export interface PipelineEtape {
  statut: string;
  candidatures: unknown[];
}

export interface PipelineOffre {
  offre_id: number;
  etapes: PipelineEtape[];
}

export function statutOffreLabel(s: StatutOffre): string {
  const m: Record<StatutOffre, string> = {
    PUBLIEE: 'Publiée',
    BROUILLON: 'Brouillon',
    CLOTUREE: 'Clôturée',
    ARCHIVEE: 'Archivée',
  };
  return m[s] ?? s;
}

export function statutOffreColor(s: StatutOffre): string {
  const m: Record<StatutOffre, string> = {
    PUBLIEE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BROUILLON: 'bg-amber-50 text-amber-700 border-amber-200',
    CLOTUREE: 'bg-red-50 text-red-700 border-red-200',
    ARCHIVEE: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return m[s] ?? 'bg-slate-50 text-slate-600 border-slate-200';
}
