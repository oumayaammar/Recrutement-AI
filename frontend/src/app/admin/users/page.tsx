'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { candidatsApi } from '@/lib/api/candidates';
import { recruteursApi } from '@/lib/api/recruiters';
import { administrateursApi } from '@/lib/api/admin';
import type { CandidatRead } from '@/lib/types/candidate';
import type { RecruteurRead } from '@/lib/types/recruiter';
import type { AdministrateurRead } from '@/lib/types/api';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Users, Briefcase, Shield, Trash2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'candidats' | 'recruteurs' | 'admins';

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('candidats');
  const [candidats, setCandidats] = useState<CandidatRead[]>([]);
  const [recruteurs, setRecruteurs] = useState<RecruteurRead[]>([]);
  const [admins, setAdmins] = useState<AdministrateurRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, r, a] = await Promise.allSettled([
        candidatsApi.list(0, 500),
        recruteursApi.list(0, 500),
        administrateursApi.list(0, 500),
      ]);
      if (c.status === 'fulfilled') setCandidats(c.value);
      if (r.status === 'fulfilled') setRecruteurs(r.value);
      if (a.status === 'fulfilled') setAdmins(a.value);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteCandidat = async (id: number) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    setDeleting(id);
    try { await candidatsApi.delete(id); setCandidats((p) => p.filter((c) => c.id !== id)); toast.success('Candidat supprimé.'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setDeleting(null); }
  };

  const handleDeleteRecruteur = async (id: number) => {
    if (!confirm('Supprimer ce recruteur ?')) return;
    setDeleting(id);
    try { await recruteursApi.delete(id); setRecruteurs((p) => p.filter((r) => r.id !== id)); toast.success('Recruteur supprimé.'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setDeleting(null); }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Supprimer cet administrateur ?')) return;
    setDeleting(id);
    try { await administrateursApi.delete(id); setAdmins((p) => p.filter((a) => a.id !== id)); toast.success('Administrateur supprimé.'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setDeleting(null); }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'candidats', label: 'Candidats', icon: <Users size={15} />, count: candidats.length },
    { id: 'recruteurs', label: 'Recruteurs', icon: <Briefcase size={15} />, count: recruteurs.length },
    { id: 'admins', label: 'Admins', icon: <Shield size={15} />, count: admins.length },
  ];

  const filterFn = (u: { nom: string; prenom: string; email: string }) =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.icon} {t.label} <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && tab === 'candidats' && (
        candidats.filter(filterFn).length === 0 ? <EmptyState title="Aucun candidat" icon={<Users size={36} />} /> : (
          <div className="flex flex-col gap-2">
            {candidats.filter(filterFn).map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{c.prenom.charAt(0)}{c.nom.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.prenom} {c.nom}</p>
                  <p className="text-xs text-muted-foreground">{c.email} · {formatDate(c.date_creation)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${c.disponibilite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}>
                  {c.disponibilite ? 'Disponible' : 'Indisponible'}
                </span>
                <button onClick={() => handleDeleteCandidat(c.id)} disabled={deleting === c.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && !error && tab === 'recruteurs' && (
        recruteurs.filter(filterFn).length === 0 ? <EmptyState title="Aucun recruteur" icon={<Briefcase size={36} />} /> : (
          <div className="flex flex-col gap-2">
            {recruteurs.filter(filterFn).map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-violet-600">{r.prenom.charAt(0)}{r.nom.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{r.prenom} {r.nom}</p>
                  <p className="text-xs text-muted-foreground">{r.email}{r.poste ? ` · ${r.poste}` : ''}</p>
                </div>
                <button onClick={() => handleDeleteRecruteur(r.id)} disabled={deleting === r.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && !error && tab === 'admins' && (
        admins.filter(filterFn).length === 0 ? <EmptyState title="Aucun administrateur" icon={<Shield size={36} />} /> : (
          <div className="flex flex-col gap-2">
            {admins.filter(filterFn).map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">{a.prenom.charAt(0)}{a.nom.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.prenom} {a.nom}</p>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                </div>
                <button onClick={() => handleDeleteAdmin(a.id)} disabled={deleting === a.id} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
