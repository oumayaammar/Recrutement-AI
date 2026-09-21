// ─── Admin API ────────────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { AdministrateurRead } from '../types/api';

export const administrateursApi = {
  create: (data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
  }) =>
    apiFetch<AdministrateurRead>('/administrateurs/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (skip = 0, limit = 100) =>
    apiFetch<AdministrateurRead[]>(`/administrateurs/?skip=${skip}&limit=${limit}`),

  get: (id: number) => apiFetch<AdministrateurRead>(`/administrateurs/${id}`),

  delete: (id: number) => apiFetch<void>(`/administrateurs/${id}`, { method: 'DELETE' }),
};
