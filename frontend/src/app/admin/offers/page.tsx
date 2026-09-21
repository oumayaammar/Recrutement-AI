'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { offresApi } from '@/lib/api/offers';
import type { OffreRead } from '@/lib/types/offer';
import OfferStatusBadge from '@/components/offer/offer-status-badge';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Briefcase, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOffersPage() {
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offresApi.list({ limit: 500 });
      setOffres(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette offre ?')) return;
    setDeleting(id);
    try {
      await offresApi.delete(id);
      setOffres((p) => p.filter((o) => o.id !== id));
      toast.success('Offre supprimée.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = offres.filter((o) =>
    o.titre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Offres d&apos;emploi</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{offres.length} offre{offres.length !== 1 ? 's' : ''} au total</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher une offre…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="Aucune offre" icon={<Briefcase size={36} />} />}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{o.titre}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.date_publication)} · Recruteur #{o.recruteur_id}</p>
              </div>
              <OfferStatusBadge statut={o.statut} />
              <button onClick={() => handleDelete(o.id)} disabled={deleting === o.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
