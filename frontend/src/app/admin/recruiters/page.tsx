'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { recruteursApi } from '@/lib/api/recruiters';
import type { RecruteurRead } from '@/lib/types/recruiter';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Briefcase, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRecruitersPage() {
  const [recruteurs, setRecruteurs] = useState<RecruteurRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruteursApi.list(0, 500);
      setRecruteurs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce recruteur ?')) return;
    setDeleting(id);
    try {
      await recruteursApi.delete(id);
      setRecruteurs((p) => p.filter((r) => r.id !== id));
      toast.success('Recruteur supprimé.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = recruteurs.filter((r) =>
    `${r.prenom} ${r.nom} ${r.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recruteurs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{recruteurs.length} recruteur{recruteurs.length !== 1 ? 's' : ''} inscrits</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="Aucun recruteur" icon={<Briefcase size={36} />} />}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-violet-600">{r.prenom.charAt(0)}{r.nom.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{r.prenom} {r.nom}</p>
                <p className="text-xs text-muted-foreground">{r.email}{r.poste ? ` · ${r.poste}` : ''}{r.departement ? ` · ${r.departement}` : ''}</p>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">{formatDate(r.date_creation)}</p>
              <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
