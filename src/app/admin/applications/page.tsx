'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { candidaturesApi } from '@/lib/api/applications';
import type { CandidatureRead } from '@/lib/types/application';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScoreBadge from '@/components/matching/matching-score-badge';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminApplicationsPage() {
  const [candidatures, setCandidatures] = useState<CandidatureRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidaturesApi.list({ limit: 500 });
      setCandidatures(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    setDeleting(id);
    try {
      await candidaturesApi.delete(id);
      setCandidatures((p) => p.filter((c) => c.id !== id));
      toast.success('Candidature supprimée.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidatures</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''} au total</p>
      </div>

      {loading && <TableSkeleton rows={6} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && candidatures.length === 0 && <EmptyState title="Aucune candidature" icon={<Send size={36} />} />}

      {!loading && !error && candidatures.length > 0 && (
        <div className="flex flex-col gap-2">
          {candidatures.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Candidat #{c.candidat_id} → Offre #{c.offre_id}</p>
                <p className="text-xs text-muted-foreground">{formatDate(c.date_candidature)}</p>
              </div>
              <MatchingScoreBadge score={c.score_matching} />
              <ApplicationStatusBadge statut={c.statut} dot />
              <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
