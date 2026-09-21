// ─── API barrel export ────────────────────────────────────────────────────────
// Import from specific modules for tree-shaking, or use this barrel for convenience.

export { apiFetch, BASE_URL } from './client';
export { authApi } from './auth';
export { candidatsApi } from './candidates';
export { recruteursApi } from './recruiters';
export { cvsApi } from './cvs';
export { offresApi } from './offers';
export { candidaturesApi } from './applications';
export { matchingApi } from './matching';
export { searchApi } from './search';
export { administrateursApi } from './admin';
export { notificationsApi } from './notifications';

// ... Add this block to declare missing variables/functions locally so re-exports are valid ...//
const apiFetch: any = undefined;
const BASE_URL: any = undefined;
const authApi: any = undefined;
const candidatsApi: any = undefined;
const recruteursApi: any = undefined;
const cvsApi: any = undefined;
const offresApi: any = undefined;
const candidaturesApi: any = undefined;
const matchingApi: any = undefined;
const searchApi: any = undefined;
const administrateursApi: any = undefined;
const notificationsApi: any = undefined;
