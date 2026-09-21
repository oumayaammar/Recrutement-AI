'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, Trophy, RefreshCw, Info } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { OffreRead, CandidatureRead, StatutCandidature } from './JobOffersRecruteurContent';
import {  offresApi } from '@/lib/api/offers';
import {candidaturesApi} from '@/lib/api/'
import { toast } from 'sonner';

function scoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-yellow-700';
  return 'text-red-600';
}

function scoreBg(score: number | null) {
  if (score === null) return 'bg-slate-200';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function rankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function getCandidatureBadgeVariant(s: StatutCandidature) {
  const map: Record<StatutCandidature, 'suggeree' | 'recue' | 'preselectionnee' | 'entretien' | 'acceptee' | 'refusee'> = {
    SUGGEREE: 'suggeree', RECUE: 'recue', PRESELECTIONNEE: 'preselectionnee',
    ENTRETIEN: 'entretien', ACCEPTEE: 'acceptee', REFUSEE: 'refusee',
  };
  return map[s];
}

const statutLabels: Record<StatutCandidature, string> = {
  SUGGEREE: 'Suggérée', RECUE: 'Reçue', PRESELECTIONNEE: 'Présélectionnée',
  ENTRETIEN: 'Entretien', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée',
};

interface ClassementTableProps {
  offres: OffreRead[];
  selectedOffreId: string;
  onSelectOffre: (id: string) => void;
  candidatures: CandidatureRead[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ClassementTable({ offres, selectedOffreId, onSelectOffre, candidatures, isLoading = false, onRefresh }: ClassementTableProps) {
  const [calculatingId, setCalculatingId] = useState<string | null>(null);
  const [calculatingAll, setCalculatingAll] = useState(false);
  const [localCandidatures, setLocalCandidatures] = useState<CandidatureRead[]>(candidatures);

  useEffect(() => {
    setLocalCandidatures(candidatures);
  }, [candidatures]);

  const handleCalculateScore = async (candidatureId: string) => {
    setCalculatingId(candidatureId);
    try {
      const updated = await candidaturesApi.calculerScore(Number(candidatureId));
      setLocalCandidatures((prev) =>
        prev.map((c) => c.id === candidatureId
          ? { ...c, score_matching: updated.score_matching ?? null }
          : c
        ).sort((a, b) => (b.score_matching ?? 0) - (a.score_matching ?? 0))
      );
      toast.success('Score de matching recalculé par l\'IA.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du calcul du score.';
      toast.error(message);
    } finally {
      setCalculatingId(null);
    }
  };

  const handleCalculateAllScores = async () => {
    if (!selectedOffreId) return;
    setCalculatingAll(true);
    try {
      const ranked = await offresApi.getClassement(Number(selectedOffreId));
      // Merge updated scores into local state
      setLocalCandidatures((prev) =>
        prev.map((c) => {
          const updated = ranked.find((r) => r.id === Number(c.id));
          return updated ? { ...c, score_matching: updated.score_matching ?? null } : c;
        }).sort((a, b) => (b.score_matching ?? 0) - (a.score_matching ?? 0))
      );
      toast.success('Classement IA recalculé pour toutes les candidatures.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du calcul du classement.';
      toast.error(message);
    } finally {
      setCalculatingAll(false);
    }
  };

  const selectedOffre = offres.find((o) => o.id === selectedOffreId);
  const withScore = localCandidatures.filter((c) => c.score_matching !== null);
  const withoutScore = localCandidatures.filter((c) => c.score_matching === null);

  const avgScore = withScore.length > 0
    ? Math.round(withScore.reduce((sum, c) => sum + (c.score_matching ?? 0), 0) / withScore.length)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Offer selector + stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Classement pour :</span>
          <div className="relative">
            <select
              value={selectedOffreId}
              onChange={(e) => onSelectOffre(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-input bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-slate-400 transition-all"
            >
              {offres.length === 0 && <option value="">Aucune offre</option>}
              {offres.map((o) => (
                <option key={`classement-offre-${o.id}`} value={o.id}>{o.titre}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-xs font-medium text-foreground">
            <Trophy size={12} className="text-yellow-500" />
            {localCandidatures.length} candidat{localCandidatures.length !== 1 ? 's' : ''}
          </div>
          {avgScore !== null && (
            <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-xs font-medium text-foreground">
              <Sparkles size={12} className="text-violet-500" />
              Score moyen : <span className={`font-bold ml-1 ${scoreColor(avgScore)}`}>{avgScore}</span>
            </div>
          )}
          {withoutScore.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700">
              <Info size={12} />
              {withoutScore.length} sans score
            </div>
          )}
        </div>

        {/* Bulk recalculate */}
        <div className="flex items-center gap-2 ml-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          )}
          {localCandidatures.length > 0 && (
            <button
              onClick={handleCalculateAllScores}
              disabled={calculatingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-all disabled:opacity-50"
            >
              {calculatingAll ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <Sparkles size={12} />
              )}
              {calculatingAll ? 'Calcul en cours…' : 'Recalculer tout'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : localCandidatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Trophy size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Aucune candidature pour cette offre</p>
            <p className="text-xs text-muted-foreground">Les candidatures apparaîtront ici une fois reçues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">Rang</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Compétences CV</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut pipeline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date candidature</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[200px]">Score matching IA</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localCandidatures.map((cand, idx) => {
                  const rank = idx + 1;
                  const medal = rankMedal(rank);
                  const isCalc = calculatingId === cand.id;

                  return (
                    <tr key={`rank-row-${cand.id}`} className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {medal ? (
                            <span className="text-lg leading-none">{medal}</span>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground tabular-nums w-6 text-center">{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Candidate */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {cand.candidat_prenom ? cand.candidat_prenom[0] : '#'}{cand.candidat_nom ? cand.candidat_nom[0] : cand.candidat_id}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {cand.candidat_prenom} {cand.candidat_nom}
                              {!cand.candidat_prenom && <span className="text-muted-foreground">Candidat #{cand.candidat_id}</span>}
                            </p>
                            {cand.candidat_email && (
                              <p className="text-xs text-muted-foreground">{cand.candidat_email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Competences */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {cand.cv_competences.slice(0, 4).map((c) => (
                            <span key={`classement-comp-${cand.id}-${c}`} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap">{c}</span>
                          ))}
                          {cand.cv_competences.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{cand.cv_competences.length - 4}</span>
                          )}
                          {cand.cv_competences.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">Non extrait</span>
                          )}
                        </div>
                      </td>

                      {/* Pipeline status */}
                      <td className="px-4 py-3">
                        <Badge variant={getCandidatureBadgeVariant(cand.statut)} dot>
                          {statutLabels[cand.statut]}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(cand.date_candidature).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Score bar */}
                      <td className="px-4 py-3">
                        {cand.score_matching !== null ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[100px]">
                              <div
                                className={`h-2 rounded-full score-bar-fill ${scoreBg(cand.score_matching)}`}
                                style={{ width: `${cand.score_matching}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold tabular-nums w-10 text-right ${scoreColor(cand.score_matching)}`}>
                              {cand.score_matching}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Non calculé</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCalculateScore(cand.id)}
                            disabled={isCalc}
                            title="Recalculer le score IA"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isCalc ? (
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <RefreshCw size={12} />
                            )}
                            {isCalc ? 'Calcul…' : 'Score IA'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI explanation note */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Comment fonctionne le score IA ?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Le score de matching (0–100) est calculé par similarité cosinus entre l&apos;embedding vectoriel du CV du candidat et celui de l&apos;offre. Un score ≥ 80 indique une excellente compatibilité. Assurez-vous que les embeddings sont générés pour l&apos;offre et les CVs avant de calculer les scores.
          </p>
        </div>
      </div>
    </div>
  );
}