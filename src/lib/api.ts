// ─── Backward-compatibility re-export ────────────────────────────────────────
// This file re-exports everything from the new modular API layer.
// Existing pages that import from '@/lib/api' will continue to work.
// New code should import directly from '@/lib/api/';
// modules.

export * from './api/index';
export * from './types/index';

// Legacy type aliases for backward compatibility
export type { StatutOffre } from './types/offer';
export type { StatutCandidature } from './types/application';
export type { CandidatRead } from './types/candidate';
export type { RecruteurRead } from './types/recruiter';
export type { CVRead, CompetenceRead, ExperienceRead, FormationRead, EmbeddingRead } from './types/cv';
export type { OffreRead } from './types/offer';
export type { CandidatureRead } from './types/application';
export type { ResultatRecherche } from './types/matching';
export type { NotificationRead, AdministrateurRead } from './types/api';

function cvsApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: cvsApi is not implemented yet.', args);
  return null;
}

export { cvsApi };
function candidatsApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: candidatsApi is not implemented yet.', args);
  return null;
}

export { candidatsApi };
function recruteursApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: recruteursApi is not implemented yet.', args);
  return null;
}

export { recruteursApi };
function administrateursApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: administrateursApi is not implemented yet.', args);
  return null;
}

export { administrateursApi };
function candidaturesApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: candidaturesApi is not implemented yet.', args);
  return null;
}

export { candidaturesApi };
function offresApi(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: offresApi is not implemented yet.', args);
  return null;
}

export { offresApi };