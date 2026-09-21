// ─── Recruiter Types ──────────────────────────────────────────────────────────

import type { RoleUtilisateur } from './auth';

export interface RecruteurRead {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  date_creation: string;
  poste?: string;
  departement?: string;
}

export interface RecruteurCreate {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  poste?: string;
  departement?: string;
}

export interface RecruteurUpdate {
  poste?: string;
  departement?: string;
}
