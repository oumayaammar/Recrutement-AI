'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { KanbanCardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { OffreRead, CandidatureRead, StatutCandidature } from './JobOffersRecruteurContent';
import { candidaturesApi } from '@/lib/api/candidatutre';
import { toast } from 'sonner';

const KANBAN_COLUMNS: { statut: StatutCandidature; label: string; color: string; headerColor: string }[] = [
  { statut: 'SUGGEREE', label: 'Suggérée', color: 'border-violet-200 bg-violet-50/50', headerColor: 'bg-violet-100 text-violet-800' },
  { statut: 'RECUE', label: 'Reçue', color: 'border-blue-200 bg-blue-50/50', headerColor: 'bg-blue-100 text-blue-800' },
  { statut: 'PRESELECTIONNEE', label: 'Présélectionnée', color: 'border-yellow-200 bg-yellow-50/50', headerColor: 'bg-yellow-100 text-yellow-800' },
  { statut: 'ENTRETIEN', label: 'Entretien', color: 'border-orange-200 bg-orange-50/50', headerColor: 'bg-orange-100 text-orange-800' },
  { statut: 'ACCEPTEE', label: 'Acceptée', color: 'border-green-200 bg-green-50/50', headerColor: 'bg-green-100 text-green-800' },
  { statut: 'REFUSEE', label: 'Refusée', color: 'border-red-200 bg-red-50/50', headerColor: 'bg-red-100 text-red-800' },
];

function getCandidatureBadgeVariant(s: StatutCandidature) {
  const map: Record<StatutCandidature, 'suggeree' | 'recue' | 'preselectionnee' | 'entretien' | 'acceptee' | 'refusee'> = {
    SUGGEREE: 'suggeree', RECUE: 'recue', PRESELECTIONNEE: 'preselectionnee',
    ENTRETIEN: 'entretien', ACCEPTEE: 'acceptee', REFUSEE: 'refusee',
  };
  return map[s];
}

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

interface PipelineKanbanProps {
  offres: OffreRead[];
  selectedOffreId: string;
  onSelectOffre: (id: string) => void;
  candidatures: CandidatureRead[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function PipelineKanban({ offres, selectedOffreId, onSelectOffre, candidatures, isLoading = false, onRefresh }: PipelineKanbanProps) {
  const [localCandidatures, setLocalCandidatures] = useState<CandidatureRead[]>(candidatures);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalCandidatures(candidatures);
  }, [candidatures]);

  const selectedOffre = offres.find((o) => o.id === selectedOffreId);

  const handleStatutChange = async (candidatureId: string, newStatut: StatutCandidature) => {
    setUpdatingId(candidatureId);
    try {
      await candidaturesApi.update(Number(candidatureId), { statut: newStatut });
      setLocalCandidatures((prev) =>
        prev.map((c) => c.id === candidatureId ? { ...c, statut: newStatut } : c)
      );
      toast.success('Statut de la candidature mis à jour.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut.';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const columnData = KANBAN_COLUMNS.map((col) => ({
    ...col,
    items: localCandidatures.filter((c) => c.statut === col.statut),
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Offer selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-muted-foreground">Pipeline pour :</span>
        <div className="relative">
          <select
            value={selectedOffreId}
            onChange={(e) => onSelectOffre(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-input bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-slate-400 transition-all"
          >
            {offres.length === 0 && <option value="">Aucune offre publiée</option>}
            {offres.map((o) => (
              <option key={`pipeline-offre-${o.id}`} value={o.id}>{o.titre}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        {selectedOffre && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {localCandidatures.length} candidature{localCandidatures.length !== 1 ? 's' : ''}
          </div>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        )}
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {columnData.map((col) => (
            <div
              key={`kanban-col-${col.statut}`}
              className={`w-56 flex flex-col rounded-xl border-2 ${col.color} kanban-col`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg ${col.headerColor}`}>
                <span className="text-xs font-bold uppercase tracking-wide">{col.label}</span>
                <span className="text-xs font-bold tabular-nums bg-white/60 px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                {isLoading ? (
                  <>
                    <KanbanCardSkeleton />
                    <KanbanCardSkeleton />
                  </>
                ) : col.items.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    Aucune candidature
                  </div>
                ) : (
                  col.items.map((cand) => (
                    <KanbanCard
                      key={`kanban-card-${cand.id}`}
                      candidature={cand}
                      isUpdating={updatingId === cand.id}
                      onStatutChange={(s) => handleStatutChange(cand.id, s)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-xs text-muted-foreground font-medium">Score IA :</span>
        {[
          { label: '≥ 80 — Excellent', color: 'bg-green-500' },
          { label: '60–79 — Correct', color: 'bg-yellow-500' },
          { label: '< 60 — Faible', color: 'bg-red-500' },
        ].map((l) => (
          <span key={`legend-${l.label}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ candidature, isUpdating, onStatutChange }: {
  candidature: CandidatureRead;
  isUpdating: boolean;
  onStatutChange: (s: StatutCandidature) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const NEXT_STATUTS: StatutCandidature[] = ['SUGGEREE', 'RECUE', 'PRESELECTIONNEE', 'ENTRETIEN', 'ACCEPTEE', 'REFUSEE'];
  const statutLabels: Record<StatutCandidature, string> = {
    SUGGEREE: 'Suggérée', RECUE: 'Reçue', PRESELECTIONNEE: 'Présélectionnée',
    ENTRETIEN: 'Entretien', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée',
  };

  const initials = candidature.candidat_prenom
    ? `${candidature.candidat_prenom[0]}${candidature.candidat_nom[0] ?? ''}`
    : `#${candidature.candidat_id}`;

  return (
    <div className={`bg-card rounded-lg border border-border shadow-sm p-3 flex flex-col gap-2 transition-all ${isUpdating ? 'opacity-50' : 'hover:shadow-md hover:border-slate-300'}`}>
      {/* Candidate name */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {candidature.candidat_prenom} {candidature.candidat_nom}
          </p>
          {candidature.candidat_email && (
            <p className="text-xs text-muted-foreground truncate">{candidature.candidat_email}</p>
          )}
          {!candidature.candidat_email && (
            <p className="text-xs text-muted-foreground">Candidat #{candidature.candidat_id}</p>
          )}
        </div>
      </div>

      {/* Score bar */}
      {candidature.score_matching !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles size={10} className="text-violet-500" /> Score IA
            </span>
            <span className={`text-xs font-bold tabular-nums ${scoreColor(candidature.score_matching)}`}>
              {candidature.score_matching}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full score-bar-fill ${scoreBg(candidature.score_matching)}`}
              style={{ width: `${candidature.score_matching}%` }}
            />
          </div>
        </div>
      )}

      {/* Competences */}
      {candidature.cv_competences.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidature.cv_competences.slice(0, 3).map((c) => (
            <span key={`comp-${candidature.id}-${c}`} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{c}</span>
          ))}
          {candidature.cv_competences.length > 3 && (
            <span className="text-xs text-muted-foreground">+{candidature.cv_competences.length - 3}</span>
          )}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar size={10} />
        {new Date(candidature.date_candidature).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </div>

      {/* Status change */}
      <div className="relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          disabled={isUpdating}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted hover:bg-slate-200 text-xs font-medium text-foreground transition-all disabled:opacity-50"
        >
          <span>Déplacer vers…</span>
          <ChevronDown size={11} />
        </button>
        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 fade-in">
            {NEXT_STATUTS.filter((s) => s !== candidature.statut).map((s) => (
              <button
                key={`move-${candidature.id}-${s}`}
                onClick={() => { onStatutChange(s); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
              >
                <Badge variant={getCandidatureBadgeVariant(s)} className="text-xs pointer-events-none">
                  {statutLabels[s]}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}