'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { candidatsApi } from '@/lib/api/candidates';
import { cvsApi } from '@/lib/api/cvs';
import type { CandidatRead } from '@/lib/types/candidate';
import type { CVRead } from '@/lib/types/cv';
import { getCVPipelineStep } from '@/lib/types/cv';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { Users, Eye, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CandidatWithCV {
  candidat: CandidatRead;
  cv: CVRead | null;
}

function CVStatusBadge({ cv }: { cv: CVRead | null }) {
  if (!cv) return <span className="text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">Pas de CV</span>;
  const step = getCVPipelineStep(cv);
  if (step >= 3) return <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Prêt</span>;
  if (step >= 1) return <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full"><Clock size={11} /> En cours</span>;
  return <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertCircle size={11} /> En attente</span>;
}

export default function RecruiterCandidatesPage() {
  const [items, setItems] = useState<CandidatWithCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const candidats = await candidatsApi.list(0, 200);
      const enriched = await Promise.all(
        candidats.map(async (c) => {
          let cv: CVRead | null = null;
          try {
            const cvs = await cvsApi.getByCandidatId(c.id);
            cv = cvs.length > 0 ? cvs[cvs.length - 1] : null;
          } catch { /* ignore */ }
          return { candidat: c, cv };
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

  const filtered = items.filter(({ candidat }) =>
    `${candidat.prenom} ${candidat.nom} ${candidat.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidats</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Liste de tous les candidats inscrits</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un candidat…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading && <TableSkeleton rows={6} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="Aucun candidat" description="Aucun candidat inscrit pour le moment." icon={<Users size={40} />} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(({ candidat, cv }) => (
            <div key={candidat.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">
                  {candidat.prenom.charAt(0)}{candidat.nom.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{candidat.prenom} {candidat.nom}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{candidat.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CVStatusBadge cv={cv} />
                {cv && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText size={11} /> {cv.competences?.length ?? 0} compétences
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${candidat.disponibilite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}>
                  {candidat.disponibilite ? 'Disponible' : 'Indisponible'}
                </span>
                <Link href={`/recruiter/candidates/${candidat.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Voir le profil">
                  <Eye size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
