// ─── CV Types ─────────────────────────────────────────────────────────────────

export interface CompetenceRead {
  id: number;
  cv_id: number;
  nom: string;
  niveau?: string;
}

export interface ExperienceRead {
  id: number;
  cv_id: number;
  poste: string;
  entreprise: string;
  date_debut?: string;
  date_fin?: string;
}

export interface FormationRead {
  id: number;
  cv_id: number;
  diplome: string;
  etablissement: string;
  annee?: number;
}

export interface CVRead {
  id: number;
  candidat_id: number;
  fichier_url: string;
  texte_brut?: string;
  date_depot: string;
  competences: CompetenceRead[];
  experiences: ExperienceRead[];
  formations: FormationRead[];
}

export interface CVCreate {
  candidat_id: number;
  fichier_url: string;
  texte_brut?: string;
}

export interface CVUpdate {
  fichier_url?: string;
  texte_brut?: string;
}

export interface EmbeddingRead {
  id: number;
  cv_id?: number;
  offre_id?: number;
  date_generation: string;
}

export type CVPipelineStep = 0 | 1 | 2 | 3;

export function getCVPipelineStep(cv: CVRead): CVPipelineStep {
  if (cv.competences?.length > 0 || cv.experiences?.length > 0 || cv.formations?.length > 0) return 3;
  if (cv.texte_brut) return 1;
  return 0;
}
