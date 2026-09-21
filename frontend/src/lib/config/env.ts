// ─── Environment Config ───────────────────────────────────────────────────────

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
} as const;
