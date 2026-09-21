'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Briefcase, Clock, Sparkles, ChevronDown, X, RefreshCw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { OfferCardSkeleton } from '@/components/ui/LoadingSkeleton';
import OfferDetailDrawer from './OfferDetailDrawer';
import ApplyModal from './ApplyModal';
import { offresApi, candidaturesApi } from '@/lib/api';
import type { OffreRead as ApiOffreRead, CandidatureRead } from '@/lib/api';
import { toast } from 'sonner';

export type StatutOffre = 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE' | 'ARCHIVEE';

export interface OffreRead {
  id: string;
  recruteur_id: string;
  titre: string;
  description: string;
  date_publication: string;
  statut: StatutOffre;
  recruteur_nom: string;
  recruteur_entreprise: string;
  localisation: string;
  type_contrat: string;
  domaine: string;
}

const domaineOptions = ['Tous', 'Tech', 'Data / IA', 'Produit', 'Design', 'RH', 'Marketing', 'Cybersécurité', 'Finance', 'Consulting'];
const typeContratOptions = ['Tous', 'CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];

function getStatutBadgeVariant(statut: StatutOffre) {
  const map: Record<StatutOffre, 'publiee' | 'brouillon' | 'cloturee' | 'archivee'> = {
    PUBLIEE: 'publiee', BROUILLON: 'brouillon', CLOTUREE: 'cloturee', ARCHIVEE: 'archivee',
  };
  return map[statut];
}

function statutLabel(s: StatutOffre) {
  const m: Record<StatutOffre, string> = { PUBLIEE: 'Publiée', BROUILLON: 'Brouillon', CLOTUREE: 'Clôturée', ARCHIVEE: 'Archivée' };
  return m[s];
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return `il y a ${diff}j`;
}

// Map API OffreRead to local OffreRead (enriching with UI-only fields)
function mapApiOffre(o: ApiOffreRead): OffreRead {
  return {
    id: String(o.id),
    recruteur_id: String(o.recruteur_id),
    titre: o.titre,
    description: o.description ?? '',
    date_publication: o.date_publication,
    statut: o.statut,
    recruteur_nom: '',
    recruteur_entreprise: '',
    localisation: '',
    type_contrat: 'CDI',
    domaine: 'Tech',
  };
}

interface OfferCardProps {
  offre: OffreRead;
  isApplied: boolean;
  onViewDetail: () => void;
  onApply: () => void;
}

function OfferCard({ offre, isApplied, onViewDetail, onApply }: OfferCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {offre.titre}
          </h3>
          {offre.recruteur_entreprise && (
            <p className="text-xs text-muted-foreground mt-1 font-medium">{offre.recruteur_entreprise}</p>
          )}
        </div>
        <Badge variant={getStatutBadgeVariant(offre.statut)} dot className="flex-shrink-0 text-xs">
          {statutLabel(offre.statut)}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        {offre.type_contrat && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            <Briefcase size={10} /> {offre.type_contrat}
          </span>
        )}
        {offre.domaine && (
          <span className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            {offre.domaine}
          </span>
        )}
        {offre.localisation && (
          <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            {offre.localisation}
          </span>
        )}
      </div>

      {/* Description preview */}
      {offre.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{offre.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={11} /> {daysAgo(offre.date_publication)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetail}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Voir détails
          </button>
          {isApplied ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
              <Sparkles size={11} /> Postulé
            </span>
          ) : (
            <button
              onClick={onApply}
              disabled={offre.statut !== 'PUBLIEE'}
              className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Postuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobOffersCandidatContent() {
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('Tous');
  const [selectedContrat, setSelectedContrat] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState<OffreRead | null>(null);
  const [applyOffre, setApplyOffre] = useState<OffreRead | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadOffres = async () => {
    setIsLoading(true);
    try {
      const data = await offresApi.list({ statut: 'PUBLIEE', limit: 200 });
      setOffres(data.map(mapApiOffre));
      setLastRefresh(new Date());
    } catch {
      toast.error('Impossible de charger les offres. Vérifiez la connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppliedIds = async () => {
    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('jobgate_auth') : null;
    if (!authRaw) return;
    try {
      const auth = JSON.parse(authRaw);
      if (auth.role !== 'CANDIDAT') return;
      const candidatures = await candidaturesApi.list({ candidat_id: Number(auth.userId), limit: 500 });
      setAppliedIds(new Set(candidatures.map((c: CandidatureRead) => String(c.offre_id))));
    } catch {
      // ignore — not critical
    }
  };

  useEffect(() => {
    loadOffres();
    loadAppliedIds();
  }, []);

  const filtered = useMemo(() => {
    return offres.filter((o) => {
      const matchSearch = !search || o.titre.toLowerCase().includes(search.toLowerCase()) || o.recruteur_entreprise.toLowerCase().includes(search.toLowerCase()) || o.domaine.toLowerCase().includes(search.toLowerCase());
      const matchDomaine = selectedDomaine === 'Tous' || o.domaine === selectedDomaine;
      const matchContrat = selectedContrat === 'Tous' || o.type_contrat === selectedContrat;
      return matchSearch && matchDomaine && matchContrat;
    });
  }, [offres, search, selectedDomaine, selectedContrat]);

  const handleApplySuccess = (offreId: string) => {
    setAppliedIds((prev) => new Set([...prev, offreId]));
    setApplyOffre(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offres d&apos;emploi</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isLoading ? 'Chargement…' : `${filtered.length} offre${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
              {appliedIds.size > 0 && (
                <span className="ml-2 text-primary font-medium">· {appliedIds.size} candidature{appliedIds.size > 1 ? 's' : ''} envoyée{appliedIds.size > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
          <button
            onClick={loadOffres}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {lastRefresh ? `Mis à jour ${lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre, entreprise, domaine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-slate-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-input text-foreground hover:bg-muted'}`}
          >
            <SlidersHorizontal size={15} />
            Filtres
            {(selectedDomaine !== 'Tous' || selectedContrat !== 'Tous') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 bg-card border border-border rounded-xl p-4 slide-up">
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Domaine</label>
              <div className="relative">
                <select
                  value={selectedDomaine}
                  onChange={(e) => setSelectedDomaine(e.target.value)}
                  className="w-full appearance-none px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
                >
                  {domaineOptions.map((d) => <option key={`dom-${d}`} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contrat</label>
              <div className="relative">
                <select
                  value={selectedContrat}
                  onChange={(e) => setSelectedContrat(e.target.value)}
                  className="w-full appearance-none px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
                >
                  {typeContratOptions.map((t) => <option key={`contrat-${t}`} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {(selectedDomaine !== 'Tous' || selectedContrat !== 'Tous') && (
              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedDomaine('Tous'); setSelectedContrat('Tous'); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 border border-red-200 transition-all"
                >
                  <X size={14} /> Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {(selectedDomaine !== 'Tous' || selectedContrat !== 'Tous') && (
          <div className="flex flex-wrap gap-2">
            {selectedDomaine !== 'Tous' && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
                {selectedDomaine}
                <button onClick={() => setSelectedDomaine('Tous')} className="hover:text-blue-800"><X size={11} /></button>
              </span>
            )}
            {selectedContrat !== 'Tous' && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
                {selectedContrat}
                <button onClick={() => setSelectedContrat('Tous')} className="hover:text-blue-800"><X size={11} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={`skel-${i}`} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Aucune offre trouvée</h3>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            {offres.length === 0
              ? 'Aucune offre publiée pour le moment. Revenez plus tard.' :'Modifiez vos critères de recherche ou revenez plus tard pour de nouvelles offres.'}
          </p>
          {offres.length > 0 && (
            <button onClick={() => { setSearch(''); setSelectedDomaine('Tous'); setSelectedContrat('Tous'); }} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {filtered.map((offre) => (
            <OfferCard
              key={`offer-${offre.id}`}
              offre={offre}
              isApplied={appliedIds.has(offre.id)}
              onViewDetail={() => setSelectedOffre(offre)}
              onApply={() => setApplyOffre(offre)}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedOffre && (
        <OfferDetailDrawer
          offre={selectedOffre}
          isApplied={appliedIds.has(selectedOffre.id)}
          onClose={() => setSelectedOffre(null)}
          onApply={() => { setApplyOffre(selectedOffre); setSelectedOffre(null); }}
        />
      )}

      {/* Apply Modal */}
      {applyOffre && (
        <ApplyModal
          offre={applyOffre}
          onClose={() => setApplyOffre(null)}
          onSuccess={() => handleApplySuccess(applyOffre.id)}
        />
      )}
    </div>
  );
}