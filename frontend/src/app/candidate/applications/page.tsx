'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { candidaturesApi } from '@/lib/api/applications';
import { offresApi } from '@/lib/api/offers';
import type { CandidatureRead } from '@/lib/types/application';
import type { OffreRead } from '@/lib/types/offer';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScoreBadge from '@/components/matching/matching-score-badge';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Send, Eye, Briefcase } from 'lucide-react';

interface EnrichedCandidature {
  candidature: CandidatureRead;
  offre: OffreRead | null;
}

export default function CandidateApplicationsPage() {
  const [items, setItems] = useState<EnrichedCandidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidatId, setCandidatId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async () => {
    if (!candidatId) return;
    setLoading(true);
    setError(null);
    try {
      const cands = await candidaturesApi.list({ candidat_id: candidatId, limit: 200 });
      const enriched = await Promise.all(
        cands.map(async (c) => {
          let offre: OffreRead | null = null;
          try { offre = await offresApi.get(c.offre_id); } catch { /* ignore */ }
          return { candidature: c, offre };
        })
      );
      setItems(enriched);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [candidatId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mes candidatures</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Suivez l&apos;état de vos candidatures</p>
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Aucune candidature"
          description="Vous n'avez pas encore postulé à une offre."
          icon={<Send size={40} />}
          action={<Link href="/candidate/offers" className="text-sm font-semibold text-primary hover:underline">Voir les offres</Link>}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map(({ candidature, offre }) => (
            <div key={candidature.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {offre?.titre ?? `Offre #${candidature.offre_id}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(candidature.date_candidature)}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <MatchingScoreBadge score={candidature.score_matching} />
                <ApplicationStatusBadge statut={candidature.statut} dot />
                {offre && (
                  <Link href={`/candidate/offers/${offre.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                    <Eye size={15} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
