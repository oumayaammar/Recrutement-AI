'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import type { OffreRead, StatutOffre } from '@/lib/types/offer';
import OfferStatusBadge from '@/components/offer/offer-status-badge';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Eye, Pencil, Briefcase, Users, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUT_OPTIONS: StatutOffre[] = ['BROUILLON', 'PUBLIEE', 'CLOTUREE', 'ARCHIVEE'];
const PAGE_SIZE = 10;

export default function RecruiterOffersPage() {
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [candidatureCounts, setCandidatureCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutOffre | 'TOUS'>('TOUS');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchOffres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { skip: number; limit: number; statut?: StatutOffre } = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (filterStatut !== 'TOUS') params.statut = filterStatut;
      const data = await offresApi.list(params);
      setOffres(data);
      const counts: Record<number, number> = {};
      await Promise.allSettled(
        data.map(async (o) => {
          try {
            const cands = await candidaturesApi.list({ offre_id: o.id });
            counts[o.id] = cands.length;
          } catch { counts[o.id] = 0; }
        })
      );
      setCandidatureCounts(counts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des offres.');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatut]);

  useEffect(() => { fetchOffres(); }, [fetchOffres]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette offre ?')) return;
    setDeleting(id);
    try {
      await offresApi.delete(id);
      toast.success('Offre supprimée.');
      fetchOffres();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = offres.filter((o) =>
    o.titre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offres d&apos;emploi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gérez vos offres de recrutement</p>
        </div>
        <Link href="/recruiter/offers/new" className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all">
          <Plus size={15} /> Nouvelle offre
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une offre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => { setFilterStatut(e.target.value as StatutOffre | 'TOUS'); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="TOUS">Tous les statuts</option>
          {STATUT_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'PUBLIEE' ? 'Publiée' : s === 'BROUILLON' ? 'Brouillon' : s === 'CLOTUREE' ? 'Clôturée' : 'Archivée'}</option>
          ))}
        </select>
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={fetchOffres} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="Aucune offre"
          description="Créez votre première offre d'emploi."
          icon={<Briefcase size={40} />}
          action={<Link href="/recruiter/offers/new" className="text-sm font-semibold text-primary hover:underline">Créer une offre</Link>}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((offre) => (
            <div key={offre.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{offre.titre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(offre.date_publication)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} /> {candidatureCounts[offre.id] ?? 0}
                </span>
                <OfferStatusBadge statut={offre.statut} />
                <Link href={`/recruiter/offers/${offre.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Voir">
                  <Eye size={15} />
                </Link>
                <Link href={`/recruiter/offers/${offre.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Modifier">
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(offre.id)}
                  disabled={deleting === offre.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length === PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
