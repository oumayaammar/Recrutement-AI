// ─── API Response Types ───────────────────────────────────────────────────────

import { StatutCandidature } from "../api";

export interface ApiError {
  detail: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface NotificationRead {
  id: number;
  utilisateur_id: number;
  message: string;
  date: string;
  lue: boolean;
}

export interface AdministrateurRead {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  date_creation: string;
}

export interface CandidatureRead {
  id: number;
  candidat_id: number;
  offre_id: number;
  date_candidature: string;
  statut: StatutCandidature;
  score_matching?: number | null;
}

