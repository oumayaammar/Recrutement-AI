// ─── Auth Types ───────────────────────────────────────────────────────────────

export type RoleUtilisateur = 'ADMINISTRATEUR' | 'RECRUTEUR' | 'CANDIDAT';

export interface AuthUser {
  id: number;
  userId: number;
  role: string;
  nom: string;
  prenom: string;
  email: string;
}

export type PortalType = 'candidat' | 'recruteur' | 'admin';

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('jobgate_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Normalize id/userId
    const id = parsed.id ?? parsed.userId ?? null;
    return { ...parsed, id, userId: id };
  } catch {
    return null;
  }
}

export function getPortalFromRole(role: string): PortalType {
  const r = role?.toUpperCase();
  if (r === 'CANDIDAT') return 'candidat';
  if (r === 'RECRUTEUR') return 'recruteur';
  return 'admin';
}
