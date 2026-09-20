// ─── General Helpers ──────────────────────────────────────────────────────────

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
