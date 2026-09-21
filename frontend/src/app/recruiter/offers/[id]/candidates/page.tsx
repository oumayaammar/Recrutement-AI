'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import { candidatsApi } from '@/lib/api/candidates';
import { cvsApi } from '@/lib/api/cvs';
import type { OffreRead } from '@/lib/types/offer';
import type { CandidatureRead } from '@/lib/types/application';
import type { CandidatRead } from '@/lib/types/candidate';
import type { CVRead } from '@/lib/types/cv';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScore from '@/components/matching/matching-score';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { ArrowLeft, Users, Trophy, ChevronDown, ChevronUp, Mail, Phone, Briefcase, BookOpen, Cpu, ArrowUpDown, ChevronLeft, ChevronRight, Loader2,  } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

interface EnrichedCandidature {
  candidature: CandidatureRead;
  candidat: CandidatRead | null;
  cv: CVRead | null;
}

export default function RecruiterOfferCandidatesPage() {
  const params = useParams();
  const offreId = Number(params.id);

  const [offre, setOffre] = useState<OffreRead | null>(null);
  const [items, setItems] = useState<EnrichedCandidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [recalculating, setRecalculating] = useState<number | null>(null);
  const [reranking, setReranking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [offreData, candidaturesData] = await Promise.allSettled([
        offresApi.get(offreId),
        offresApi.getClassement(offreId),
      ]);
      if (offreData.status === 'fulfilled') setOffre(offreData.value);
      const cands = candidaturesData.status === 'fulfilled' ? candidaturesData.value : await candidaturesApi.list({ offre_id: offreId });
      const enriched = await Promise.all(
        cands.map(async (c) => {
          let candidat: CandidatRead | null = null;
          let cv: CVRead | null = null;
          try { candidat = await candidatsApi.get(c.candidat_id); } catch { /* ignore */ }
          try {
            const cvs = await cvsApi.getByCandidatId(c.candidat_id);
            cv = cvs.length > 0 ? cvs[cvs.length - 1] : null;
          } catch { /* ignore */ }
          return { candidature: c, candidat, cv };
        })
      );
      setItems(enriched);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [offreId]);

  useEffect(() => { if (!isNaN(offreId)) load(); }, [offreId, load]);

  const handleRecalculate = async (candidatureId: number) => {
    setRecalculating(candidatureId);
    try {
      const updated = await candidaturesApi.calculerScore(candidatureId);
      setItems((prev) => prev.map((item) =>
        item.candidature.id === candidatureId ? { ...item, candidature: updated } : item
      ));
      toast.success('Score recalculé !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du recalcul.');
    } finally {
      setRecalculating(null);
    }
  };

  const handleRerank = async () => {
    setReranking(true);
    try {
      const ranked = await offresApi.getClassement(offreId);
      const enriched = await Promise.all(
        ranked.map(async (c) => {
          let candidat: CandidatRead | null = null;
          let cv: CVRead | null = null;
          try { candidat = await candidatsApi.get(c.candidat_id); } catch { /* ignore */ }
          try {
            const cvs = await cvsApi.getByCandidatId(c.candidat_id);
            cv = cvs.length > 0 ? cvs[cvs.length - 1] : null;
          } catch { /* ignore */ }
          return { candidature: c, candidat, cv };
        })
      );
      setItems(enriched);
      toast.success('Classement mis à jour !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du reclassement.');
    } finally {
      setReranking(false);
    }
  };

  const sorted = [...items].sort((a, b) => {
    const sa = a.candidature.score_matching ?? -1;
    const sb = b.candidature.score_matching ?? -1;
    return sortDesc ? sb - sa : sa - sb;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/recruiter/offers/${offreId}`} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Candidatures</h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{offre?.titre ?? `Offre #${offreId}`}</p>
        </div>
        <button
          onClick={handleRerank}
          disabled={reranking}
          className="flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-100 transition-all border border-violet-200 disabled:opacity-60"
        >
          {reranking ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
          Recalculer le matching
        </button>
      </div>

      {loading && <TableSkeleton rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="Aucune candidature" description="Aucun candidat n'a postulé à cette offre." icon={<Users size={40} />} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{items.length} candidature{items.length > 1 ? 's' : ''}</p>
            <button onClick={() => setSortDesc((s) => !s)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowUpDown size={14} /> Score {sortDesc ? '↓' : '↑'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {paginated.map((item, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const { candidature, candidat, cv } = item;
              const score = candidature.score_matching;
              const isExpanded = expanded.has(candidature.id);

              return (
                <div key={candidature.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">#{rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        {candidat ? `${candidat.prenom} ${candidat.nom}` : `Candidat #${candidature.candidat_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(candidature.date_candidature)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                      {score !== null && score !== undefined ? (
                        <MatchingScore score={score} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Score: —</span>
                      )}
                      <ApplicationStatusBadge statut={candidature.statut} />
                      <button
                        onClick={() => handleRecalculate(candidature.id)}
                        disabled={recalculating === candidature.id}
                        className="text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1.5 rounded-lg hover:bg-violet-100 transition-all disabled:opacity-60"
                      >
                        {recalculating === candidature.id ? <Loader2 size={12} className="animate-spin" /> : 'Recalculer'}
                      </button>
                      <button onClick={() => toggleExpand(candidature.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border p-5 bg-muted/30 flex flex-col gap-4">
                      {candidat && (
                        <div className="flex flex-wrap gap-4 text-sm">
                          {candidat.email && <span className="flex items-center gap-1.5 text-muted-foreground"><Mail size={13} /> {candidat.email}</span>}
                          {candidat.telephone && <span className="flex items-center gap-1.5 text-muted-foreground"><Phone size={13} /> {candidat.telephone}</span>}
                        </div>
                      )}
                      {cv && (
                        <>
                          {cv.competences?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Cpu size={11} /> Compétences</p>
                              <div className="flex flex-wrap gap-1.5">
                                {cv.competences.map((c) => (
                                  <span key={c.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{c.nom}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {cv.experiences?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Briefcase size={11} /> Expériences</p>
                              <div className="flex flex-col gap-1">
                                {cv.experiences.map((e) => (
                                  <p key={e.id} className="text-xs text-foreground">{e.poste} — <span className="text-muted-foreground">{e.entreprise}</span></p>
                                ))}
                              </div>
                            </div>
                          )}
                          {cv.formations?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><BookOpen size={11} /> Formations</p>
                              <div className="flex flex-col gap-1">
                                {cv.formations.map((f) => (
                                  <p key={f.id} className="text-xs text-foreground">{f.diplome} — <span className="text-muted-foreground">{f.etablissement}</span></p>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <Link href={`/recruiter/candidates/${candidature.candidat_id}`} className="text-xs font-semibold text-primary hover:underline self-start">
                        Voir le profil complet →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
