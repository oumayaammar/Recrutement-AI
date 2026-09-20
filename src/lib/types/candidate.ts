// ─── Candidate Types ──────────────────────────────────────────────────────────

import type { RoleUtilisateur } from './auth';

export interface CandidatRead {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  date_creation: string;
  telephone?: string;
  date_naissance?: string;
  disponibilite: boolean;
}

export interface CandidatCreate {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  telephone?: string;
  date_naissance?: string;
  disponibilite?: boolean;
}

export interface CandidatUpdate {
  telephone?: string;
  date_naissance?: string;
  disponibilite?: boolean;
}
