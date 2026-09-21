'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import type { OffreRead } from '@/lib/types/offer';
import type { CandidatureRead } from '@/lib/types/application';
import OfferStatusBadge from '@/components/offer/offer-status-badge';


import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Briefcase, Search, Plus, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateOffersPage() {
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const [applying, setApplying] = useState<number | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await offresApi.list({ statut: 'PUBLIEE', limit: 200 });
        setOffres(data);
        if (candidatId) {
          const cands = await candidaturesApi.list({ candidat_id: candidatId, limit: 500 });
          setAppliedIds(new Set(cands.map((c: CandidatureRead) => c.offre_id)));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des offres.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [candidatId]);

  const handleApply = async (offreId: number) => {
    if (!candidatId) { toast.error('Vous devez être connecté pour postuler.'); return; }
    setApplying(offreId);
    try {
      await candidaturesApi.create({ candidat_id: candidatId, offre_id: offreId, statut: 'RECUE' });
      setAppliedIds((prev) => new Set([...prev, offreId]));
      toast.success('Candidature envoyée !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la candidature.');
    } finally {
      setApplying(null);
    }
  };

  const filtered = offres.filter((o) =>
    o.titre.toLowerCase().includes(search.toLowerCase()) ||
    (o.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offres d&apos;emploi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Découvrez les offres disponibles et postulez</p>
        </div>
        <Link href="/candidate/applications" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <Send size={14} /> Mes candidatures
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une offre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading && <TableSkeleton rows={6} />}
      {!loading && error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="Aucune offre disponible"
          description="Revenez plus tard pour découvrir de nouvelles opportunités."
          icon={<Briefcase size={40} />}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((offre) => {
            const isApplied = appliedIds.has(offre.id);
            return (
              <div key={offre.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{offre.titre}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(offre.date_publication)}</p>
                  </div>
                  <OfferStatusBadge statut={offre.statut} dot />
                </div>
                {offre.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{offre.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border mt-auto gap-2">
                  <Link
                    href={`/candidate/offers/${offre.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Eye size={12} /> Voir détails
                  </Link>
                  {isApplied ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                      ✓ Postulé
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(offre.id)}
                      disabled={applying === offre.id || offre.statut !== 'PUBLIEE'}
                      className="flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={12} />
                      {applying === offre.id ? 'Envoi…' : 'Postuler'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
