// ─── Recruiters API ───────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { RecruteurRead, RecruteurCreate, RecruteurUpdate } from '../types/recruiter';
import type { ResultatRecherche } from '../types/matching';

export const recruteursApi = {
  create: (data: RecruteurCreate) =>
    apiFetch<RecruteurRead>('/recruteurs/', { method: 'POST', body: JSON.stringify(data) }),

  list: (skip = 0, limit = 100) =>
    apiFetch<RecruteurRead[]>(`/recruteurs/?skip=${skip}&limit=${limit}`),

  get: (id: number) => apiFetch<RecruteurRead>(`/recruteurs/${id}`),

  update: (id: number, data: RecruteurUpdate) =>
    apiFetch<RecruteurRead>(`/recruteurs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/recruteurs/${id}`, { method: 'DELETE' }),

  searchCandidats: (q: string, limite = 10) =>
    apiFetch<ResultatRecherche[]>(
      `/recruteurs/recherche/candidats?q=${encodeURIComponent(q)}&limite=${limite}`
    ),
};
