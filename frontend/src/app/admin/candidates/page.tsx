'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { candidatsApi } from '@/lib/api/candidates';
import type { CandidatRead } from '@/lib/types/candidate';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Users, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCandidatesPage() {
  const [candidats, setCandidats] = useState<CandidatRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidatsApi.list(0, 500);
      setCandidats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    setDeleting(id);
    try {
      await candidatsApi.delete(id);
      setCandidats((p) => p.filter((c) => c.id !== id));
      toast.success('Candidat supprimé.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = candidats.filter((c) =>
    `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidats</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{candidats.length} candidat{candidats.length !== 1 ? 's' : ''} inscrits</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="Aucun candidat" icon={<Users size={36} />} />}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">{c.prenom.charAt(0)}{c.nom.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{c.prenom} {c.nom}</p>
                <p className="text-xs text-muted-foreground">{c.email} · {formatDate(c.date_creation)}</p>
              </div>
              <div className="flex items-center gap-2">
                {c.disponibilite ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-red-500" />}
                <span className="text-xs text-muted-foreground">{c.disponibilite ? 'Disponible' : 'Indisponible'}</span>
              </div>
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
