// ─── Offers API ───────────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { OffreRead, OffreCreate, OffreUpdate, StatutOffre, PipelineOffre } from '../types/offer';
import type { EmbeddingRead } from '../types/cv';
import type { CandidatureRead } from '../types/application';

export const offresApi = {
  create: (data: OffreCreate) =>
    apiFetch<OffreRead>('/offres/', { method: 'POST', body: JSON.stringify(data) }),

  list: (params?: { skip?: number; limit?: number; statut?: StatutOffre }) => {
    const qs = new URLSearchParams();
    if (params?.skip !== undefined) qs.set('skip', String(params.skip));
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    if (params?.statut) qs.set('statut', params.statut);
    return apiFetch<OffreRead[]>(`/offres/?${qs.toString()}`);
  },

  get: (id: number) => apiFetch<OffreRead>(`/offres/${id}`),

  update: (id: number, data: OffreUpdate) =>
    apiFetch<OffreRead>(`/offres/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/offres/${id}`, { method: 'DELETE' }),

  /** POST /offres/{id}/embedding — generate offer embedding */
  generateEmbedding: (id: number) =>
    apiFetch<EmbeddingRead>(`/offres/${id}/embedding`, { method: 'POST' }),

  /** GET /offres/{id}/classement — ranked candidates by matching score */
  getClassement: (id: number) =>
    apiFetch<CandidatureRead[]>(`/offres/${id}/classement`),

  /** GET /offres/{id}/pipeline — kanban pipeline */
  getPipeline: (id: number) =>
    apiFetch<PipelineOffre>(`/offres/${id}/pipeline`),
};
