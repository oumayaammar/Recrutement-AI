// ─── Matching API ─────────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { CandidatureRead } from '../types/application';

export const matchingApi = {
  /** GET /offres/{id}/classement — ranked candidates for an offer */
  getClassement: (offreId: number) =>
    apiFetch<CandidatureRead[]>(`/offres/${offreId}/classement`),

  /** POST /candidatures/{id}/calculer-score — recalculate matching score */
  calculerScore: (candidatureId: number) =>
    apiFetch<CandidatureRead>(`/candidatures/${candidatureId}/calculer-score`, { method: 'POST' }),
};
