// ─── Applications API ─────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type {
  CandidatureRead,
  CandidatureCreate,
  CandidatureUpdate,
} from '../types/application';

export const candidaturesApi = {
  create: (data: CandidatureCreate) =>
    apiFetch<CandidatureRead>('/candidatures/', { method: 'POST', body: JSON.stringify(data) }),

  list: (params?: {
    candidat_id?: number;
    offre_id?: number;
    skip?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.candidat_id !== undefined) qs.set('candidat_id', String(params.candidat_id));
    if (params?.offre_id !== undefined) qs.set('offre_id', String(params.offre_id));
    if (params?.skip !== undefined) qs.set('skip', String(params.skip));
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    return apiFetch<CandidatureRead[]>(`/candidatures/?${qs.toString()}`);
  },

  get: (id: number) => apiFetch<CandidatureRead>(`/candidatures/${id}`),

  update: (id: number, data: CandidatureUpdate) =>
    apiFetch<CandidatureRead>(`/candidatures/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/candidatures/${id}`, { method: 'DELETE' }),

  /** POST /candidatures/{id}/calculer-score — trigger backend score calculation */
  calculerScore: (id: number) =>
    apiFetch<CandidatureRead>(`/candidatures/${id}/calculer-score`, { method: 'POST' }),
};
