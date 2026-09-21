'use client';
import React, { useState, useMemo } from 'react';
import {
  Search, Pencil, Trash2, GitBranch, Trophy, Cpu, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle2, X, Filter,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import type { OffreRead, StatutOffre } from './JobOffersRecruteurContent';
import { offresApi } from '@/lib/api/offers';
import { toast } from 'sonner';

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
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUT_OPTIONS: StatutOffre[] = ['BROUILLON', 'PUBLIEE', 'CLOTUREE', 'ARCHIVEE'];

interface OffresTableProps {
  offres: OffreRead[];
  isLoading?: boolean;
  onEdit: (offre: OffreRead) => void;
  onDelete: (id: string) => void;
  onSelectForPipeline: (id: string) => void;
  onSelectForClassement: (id: string) => void;
  onRefresh?: () => void;
}

type SortKey = 'titre' | 'date_publication' | 'statut' | 'candidature_count';
type SortDir = 'asc' | 'desc';

export default function OffresTable({ offres, isLoading = false, onEdit, onDelete, onSelectForPipeline, onSelectForClassement, onRefresh }: OffresTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutOffre | 'TOUS'>('TOUS');
  const [sortKey, setSortKey] = useState<SortKey>('date_publication');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [embeddingLoadingId, setEmbeddingLoadingId] = useState<string | null>(null);
  const [embeddingReadyIds, setEmbeddingReadyIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const filtered = useMemo(() => {
    let result = offres.filter((o) => {
      const matchSearch = !search || o.titre.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'TOUS' || o.statut === filterStatut;
      return matchSearch && matchStatut;
    });
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'titre') cmp = a.titre.localeCompare(b.titre);
      else if (sortKey === 'date_publication') cmp = a.date_publication.localeCompare(b.date_publication);
      else if (sortKey === 'statut') cmp = a.statut.localeCompare(b.statut);
      else if (sortKey === 'candidature_count') cmp = a.candidature_count - b.candidature_count;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [offres, search, filterStatut, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={13} className="text-muted-foreground opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-primary" />
      : <ChevronDown size={13} className="text-primary" />;
  };

  const handleGenerateEmbedding = async (offreId: string) => {
    setEmbeddingLoadingId(offreId);
    try {
      await offresApi.generateEmbedding(Number(offreId));
      setEmbeddingReadyIds((prev) => new Set([...prev, offreId]));
      toast.success('Embedding IA généré avec succès pour cette offre.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération de l\'embedding.';
      toast.error(message);
    } finally {
      setEmbeddingLoadingId(null);
    }
  };

  const handleConfirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const handleStatutChange = async (offre: OffreRead, newStatut: StatutOffre) => {
    try {
      await offresApi.update(Number(offre.id), { statut: newStatut });
      onEdit({ ...offre, statut: newStatut });
      toast.success(`Statut mis à jour : ${statutLabel(newStatut)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut.';
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une offre…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-slate-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-muted-foreground flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {(['TOUS', ...STATUT_OPTIONS] as (StatutOffre | 'TOUS')[]).map((s) => (
              <button
                key={`filter-${s}`}
                onClick={() => { setFilterStatut(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  filterStatut === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {s === 'TOUS' ? 'Toutes' : statutLabel(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Publiées', count: offres.filter((o) => o.statut === 'PUBLIEE').length, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Brouillons', count: offres.filter((o) => o.statut === 'BROUILLON').length, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: 'Clôturées', count: offres.filter((o) => o.statut === 'CLOTUREE').length, color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Archivées', count: offres.filter((o) => o.statut === 'ARCHIVEE').length, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${stat.color}`}>
            <span className="text-xs font-semibold">{stat.label}</span>
            <span className="text-xl font-bold tabular-nums">{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('titre')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Titre de l&apos;offre <SortIcon col="titre" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('statut')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Statut <SortIcon col="statut" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('date_publication')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Publié le <SortIcon col="date_publication" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <button onClick={() => handleSort('candidature_count')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Candidatures <SortIcon col="candidature_count" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Embedding IA</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={`skel-row-${i}`} cols={6} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Search size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Aucune offre trouvée</p>
                      <p className="text-xs text-muted-foreground">Modifiez vos filtres ou créez une nouvelle offre.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((offre, idx) => (
                  <OffreRow
                    key={`offre-row-${offre.id}`}
                    offre={offre}
                    isEven={idx % 2 === 0}
                    isEmbeddingLoading={embeddingLoadingId === offre.id}
                    isEmbeddingReady={offre.embedding_ready || embeddingReadyIds.has(offre.id)}
                    onEdit={() => onEdit(offre)}
                    onDeleteRequest={() => setDeleteConfirmId(offre.id)}
                    onPipeline={() => onSelectForPipeline(offre.id)}
                    onClassement={() => onSelectForClassement(offre.id)}
                    onGenerateEmbedding={() => handleGenerateEmbedding(offre.id)}
                    onStatutChange={(s) => handleStatutChange(offre, s)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Afficher</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[5, 10, 20].map((n) => <option key={`pp-${n}`} value={n}>{n}</option>)}
              </select>
              <span>sur {filtered.length} offre{filtered.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Préc.
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={`page-${i + 1}`}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === i + 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Suiv.
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm fade-in">
          <div className="bg-card rounded-xl border border-border shadow-2xl p-6 w-full max-w-sm modal-enter">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Supprimer cette offre ?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cette action est irréversible. Toutes les candidatures associées seront également supprimées.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95">
                Annuler
              </button>
              <button onClick={() => handleConfirmDelete(deleteConfirmId)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all">
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row sub-component ────────────────────────────────────────────────────────
function OffreRow({
  offre, isEven, isEmbeddingLoading, isEmbeddingReady,
  onEdit, onDeleteRequest, onPipeline, onClassement, onGenerateEmbedding, onStatutChange,
}: {
  offre: OffreRead;
  isEven: boolean;
  isEmbeddingLoading: boolean;
  isEmbeddingReady: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onPipeline: () => void;
  onClassement: () => void;
  onGenerateEmbedding: () => void;
  onStatutChange: (s: StatutOffre) => void;
}) {
  const [statutDropdown, setStatutDropdown] = useState(false);

  return (
    <tr className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors group ${isEven ? '' : 'bg-muted/10'}`}>
      <td className="px-4 py-3">
        <div className="font-semibold text-foreground text-sm leading-snug max-w-xs truncate" title={offre.titre}>
          {offre.titre}
        </div>
        {offre.description && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{offre.description.slice(0, 60)}{offre.description.length > 60 ? '…' : ''}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setStatutDropdown((v) => !v)}
            className="focus:outline-none"
            title="Changer le statut"
          >
            <Badge variant={getStatutBadgeVariant(offre.statut)} dot>
              {statutLabel(offre.statut)}
            </Badge>
          </button>
          {statutDropdown && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px] fade-in">
              {(['BROUILLON', 'PUBLIEE', 'CLOTUREE', 'ARCHIVEE'] as StatutOffre[]).map((s) => (
                <button
                  key={`statut-opt-${s}`}
                  onClick={() => { onStatutChange(s); setStatutDropdown(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${offre.statut === s ? 'font-semibold text-primary' : 'text-foreground'}`}
                >
                  <Badge variant={getStatutBadgeVariant(s)} className="pointer-events-none">{statutLabel(s)}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(offre.date_publication)}</td>
      <td className="px-4 py-3">
        <span className="tabular-nums font-semibold text-foreground">{offre.candidature_count}</span>
        <span className="text-xs text-muted-foreground ml-1">candidat{offre.candidature_count !== 1 ? 's' : ''}</span>
      </td>
      <td className="px-4 py-3">
        {isEmbeddingReady ? (
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <CheckCircle2 size={14} className="text-green-500" />
            Prêt
          </div>
        ) : (
          <button
            onClick={onGenerateEmbedding}
            disabled={isEmbeddingLoading}
            className="flex items-center gap-1.5 text-xs text-violet-700 font-semibold hover:text-violet-900 disabled:opacity-60 transition-colors"
            title="Générer l'embedding IA pour cette offre"
          >
            {isEmbeddingLoading ? (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Cpu size={13} />
            )}
            {isEmbeddingLoading ? 'Génération…' : 'Générer'}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onPipeline}
            title="Voir le pipeline Kanban"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
          >
            <GitBranch size={15} />
          </button>
          <button
            onClick={onClassement}
            title="Voir le classement IA"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-violet-50 hover:text-violet-600 transition-all active:scale-95"
          >
            <Trophy size={15} />
          </button>
          <button
            onClick={onEdit}
            title="Modifier cette offre"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDeleteRequest}
            title="Supprimer cette offre — action irréversible"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}