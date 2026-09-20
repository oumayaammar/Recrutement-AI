// ─── CVs API ──────────────────────────────────────────────────────────────────

import { apiFetch, BASE_URL } from './client';
import type { CVRead, CVCreate, CVUpdate, EmbeddingRead } from '../types/cv';

export const cvsApi = {
  /**
   * Upload a CV file using multipart/form-data.
   * Do NOT send JSON — the backend expects FormData.
   */
  upload: (file: File, candidatId: number): Promise<CVRead> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidat_id', String(candidatId));
    const url = `${BASE_URL}/cvs/upload`;
    return fetch(url, { method: 'POST', body: formData }).then(async (res) => {
      if (!res.ok) {
        let errorMessage = `API error ${res.status}`;
        try {
          const body = await res.json();
          errorMessage = body?.detail ?? errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }
      return res.json() as Promise<CVRead>;
    });
  },

  create: (data: CVCreate) =>
    apiFetch<CVRead>('/cvs/', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: number) => apiFetch<CVRead>(`/cvs/${id}`),

  getByCandidatId: (candidatId: number) =>
    apiFetch<CVRead[]>(`/cvs/candidat/${candidatId}`),

  update: (id: number, data: CVUpdate) =>
    apiFetch<CVRead>(`/cvs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/cvs/${id}`, { method: 'DELETE' }),

  /** POST /cvs/{id}/extraire — extract text + AI info from the CV file */
  extract: (id: number) =>
    apiFetch<CVRead>(`/cvs/${id}/extraire`, { method: 'POST' }),

  /** POST /cvs/{id}/embedding — generate sentence-transformer embedding */
  generateEmbedding: (id: number) =>
    apiFetch<EmbeddingRead>(`/cvs/${id}/embedding`, { method: 'POST' }),
};
