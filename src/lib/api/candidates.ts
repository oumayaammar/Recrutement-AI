// ─── Candidates API ───────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { CandidatRead, CandidatCreate, CandidatUpdate } from '../types/candidate';

export const candidatsApi = {
  create: (data: CandidatCreate) =>
    apiFetch<CandidatRead>('/candidats/', { method: 'POST', body: JSON.stringify(data) }),

  list: (skip = 0, limit = 100) =>
    apiFetch<CandidatRead[]>(`/candidats/?skip=${skip}&limit=${limit}`),

  get: (id: number) => apiFetch<CandidatRead>(`/candidats/${id}`),

  update: (id: number, data: CandidatUpdate) =>
    apiFetch<CandidatRead>(`/candidats/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/candidats/${id}`, { method: 'DELETE' }),
};
