// ─── Search API ───────────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { ResultatRecherche } from '../types/matching';

export const searchApi = {
  /**
   * GET /recruteurs/recherche/candidats
   * Semantic search for candidates using natural language query.
   * The backend performs: query → embedding → vector similarity → ranking.
   * The frontend only displays results — never calculates scores.
   */
  searchCandidats: (q: string, limite = 10) =>
    apiFetch<ResultatRecherche[]>(
      `/recruteurs/recherche/candidats?q=${encodeURIComponent(q)}&limite=${limite}`
    ),
};
