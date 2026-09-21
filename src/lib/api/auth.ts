// ─── Auth API ─────────────────────────────────────────────────────────────────
// Note: The backend has no /auth/login endpoint.
// Authentication is performed by listing users and matching email.

import { apiFetch } from './client';
import type { CandidatRead } from '../types/candidate';
import type { RecruteurRead } from '../types/recruiter';
import type { AdministrateurRead } from '../types/api';

export const authApi = {
  /**
   * Find a user by email across all user types.
   * Returns the user and their portal type.
   */
  findByEmail: async (email: string) => {
    const [candidats, recruteurs, admins] = await Promise.allSettled([
      apiFetch<CandidatRead[]>('/candidats/?skip=0&limit=500'),
      apiFetch<RecruteurRead[]>('/recruteurs/?skip=0&limit=500'),
      apiFetch<AdministrateurRead[]>('/administrateurs/?skip=0&limit=500'),
    ]);

    if (candidats.status === 'fulfilled') {
      const found = candidats.value.find((c) => c.email === email);
      if (found) return { user: found, portal: 'candidat' as const };
    }

    if (recruteurs.status === 'fulfilled') {
      const found = recruteurs.value.find((r) => r.email === email);
      if (found) return { user: found, portal: 'recruteur' as const };
    }

    if (admins.status === 'fulfilled') {
      const found = admins.value.find((a) => a.email === email);
      if (found) return { user: found, portal: 'admin' as const };
    }

    return null;
  },
};
