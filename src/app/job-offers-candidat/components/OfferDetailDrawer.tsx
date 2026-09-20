'use client';
import React from 'react';
import { X, MapPin, Briefcase, Building2, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { OffreRead, StatutOffre } from './JobOffersCandidatContent';

function statutLabel(s: StatutOffre) {
  const m: Record<StatutOffre, string> = { PUBLIEE: 'Publiée', BROUILLON: 'Brouillon', CLOTUREE: 'Clôturée', ARCHIVEE: 'Archivée' };
  return m[s];
}

function getStatutBadgeVariant(statut: StatutOffre) {
  const map: Record<StatutOffre, 'publiee' | 'brouillon' | 'cloturee' | 'archivee'> = {
    PUBLIEE: 'publiee', BROUILLON: 'brouillon', CLOTUREE: 'cloturee', ARCHIVEE: 'archivee',
  };
  return map[statut];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface OfferDetailDrawerProps {
  offre: OffreRead;
  isApplied: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function OfferDetailDrawer({ offre, isApplied, onClose, onApply }: OfferDetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden slide-up">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-foreground leading-snug">{offre.titre}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Building2 size={13} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">{offre.recruteur_entreprise}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{offre.recruteur_nom}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta chips */}
        <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-border flex-shrink-0">
          <Badge variant={getStatutBadgeVariant(offre.statut)} dot>{statutLabel(offre.statut)}</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            <Briefcase size={11} /> {offre.type_contrat}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            {offre.domaine}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            <MapPin size={11} /> {offre.localisation}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            <Calendar size={11} /> {formatDate(offre.date_publication)}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ChevronRight size={15} className="text-primary" />
                Description du poste
              </h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{offre.description}</p>
            </div>

            {/* IA score placeholder */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Score de matching IA</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Postulez pour obtenir votre score de compatibilité généré par l'IA.</p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-violet-500 score-bar-fill" style={{ width: isApplied ? '78%' : '0%' }} />
              </div>
              {isApplied && (
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">Score calculé</span>
                  <span className="text-sm font-bold text-primary tabular-nums">78 / 100</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95">
            Fermer
          </button>
          {isApplied ? (
            <div className="flex-1 py-2.5 rounded-lg bg-green-50 border border-green-200 text-sm font-semibold text-green-700 text-center flex items-center justify-center gap-2">
              <Sparkles size={14} />
              Candidature envoyée
            </div>
          ) : (
            <button
              onClick={onApply}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              Postuler à cette offre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}