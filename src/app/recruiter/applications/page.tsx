'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { candidaturesApi } from '@/lib/api/applications';
import { offresApi } from '@/lib/api/offers';
import { candidatsApi } from '@/lib/api/candidates';
import type { CandidatureRead } from '@/lib/types/application';
import type { OffreRead } from '@/lib/types/offer';
import type { CandidatRead } from '@/lib/types/candidate';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScoreBadge from '@/components/matching/matching-score-badge';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Send, Eye, User } from 'lucide-react';

interface EnrichedCandidature {
  candidature: CandidatureRead;
  offre: OffreRead | null;
  candidat: CandidatRead | null;
}

export default function RecruiterApplicationsPage() {
  const [items, setItems] = useState<EnrichedCandidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cands = await candidaturesApi.list({ limit: 200 });
      const enriched = await Promise.all(
        cands.map(async (c) => {
          let offre: OffreRead | null = null;
          let candidat: CandidatRead | null = null;
          try { offre = await offresApi.get(c.offre_id); } catch { /* ignore */ }
          try { candidat = await candidatsApi.get(c.candidat_id); } catch { /* ignore */ }
          return { candidature: c, offre, candidat };
        })
      );
      setItems(enriched);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidatures</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Toutes les candidatures reçues</p>
      </div>

      {loading && <TableSkeleton rows={6} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="Aucune candidature" description="Aucune candidature reçue pour le moment." icon={<Send size={40} />} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map(({ candidature, offre, candidat }) => (
            <div key={candidature.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {candidat ? `${candidat.prenom} ${candidat.nom}` : `Candidat #${candidature.candidat_id}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {offre?.titre ?? `Offre #${candidature.offre_id}`} · {formatDate(candidature.date_candidature)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <MatchingScoreBadge score={candidature.score_matching} />
                <ApplicationStatusBadge statut={candidature.statut} dot />
                {offre && (
                  <Link href={`/recruiter/offers/${offre.id}/candidates`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Voir candidatures de l'offre">
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
