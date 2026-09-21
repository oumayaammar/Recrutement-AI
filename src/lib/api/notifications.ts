// ─── Notifications API ────────────────────────────────────────────────────────

import { apiFetch } from './client';
import type { NotificationRead } from '../types/api';

export const notificationsApi = {
  create: (data: { utilisateur_id: number; message: string }) =>
    apiFetch<NotificationRead>('/notifications/', { method: 'POST', body: JSON.stringify(data) }),

  getByUser: (utilisateurId: number, nonLuesSeulement = false) =>
    apiFetch<NotificationRead[]>(
      `/notifications/utilisateur/${utilisateurId}?non_lues_seulement=${nonLuesSeulement}`
    ),

  markAsRead: (id: number) =>
    apiFetch<NotificationRead>(`/notifications/${id}/lue`, { method: 'PATCH' }),
};
