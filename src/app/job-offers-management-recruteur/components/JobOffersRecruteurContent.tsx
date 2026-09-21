'use client';
import React, { useState, useEffect } from 'react';
import { Plus, LayoutList, GitBranch, Trophy, RefreshCw } from 'lucide-react';
import OffresTable from './OffresTable';
import PipelineKanban from './PipelineKanban';
import ClassementTable from './ClassementTable';
import OffreFormModal from './OffreFormModal';
import {candidaturesApi} from '@/lib/api/candidatutre';
import { offresApi } from '@/lib/api/offers';
import type { CandidatureRead as ApiCandidatureRead  } from '@/lib/types/api';

import { toast } from 'sonner';

export type StatutOffre = 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE' | 'ARCHIVEE';
export type StatutCandidature = 'SUGGEREE' | 'RECUE' | 'PRESELECTIONNEE' | 'ENTRETIEN' | 'ACCEPTEE' | 'REFUSEE';

export interface OffreRead {
  id: string;
  recruteur_id: string;
  titre: string;
  description: string;
  date_publication: string;
  statut: StatutOffre;
  candidature_count: number;
  embedding_ready: boolean;
}

export interface CandidatureRead {
  id: string;
  candidat_id: string;
  offre_id: string;
  date_candidature: string;
  statut: StatutCandidature;
  score_matching: number | null;
  candidat_nom: string;
  candidat_prenom: string;
  candidat_email: string;
  cv_competences: string[];
}

type ActiveTab = 'offres' | 'pipeline' | 'classement';

function mapApiCandidature(c: ApiCandidatureRead): CandidatureRead {
  return {
    id: String(c.id),
    candidat_id: String(c.candidat_id),
    offre_id: String(c.offre_id),
    date_candidature: c.date_candidature,
    statut: c.statut,
    score_matching: c.score_matching ?? null,
    candidat_nom: '',
    candidat_prenom: `Candidat #${c.candidat_id}`,
    candidat_email: '',
    cv_competences: [],
  };
}

export default function JobOffersRecruteurContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('offres');
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffreId, setSelectedOffreId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editOffre, setEditOffre] = useState<OffreRead | null>(null);
  const [candidatures, setCandidatures] = useState<CandidatureRead[]>([]);
  const [loadingCandidatures, setLoadingCandidatures] = useState(false);
  const [recruteurId, setRecruteurId] = useState<number | null>(null);

  useEffect(() => {
    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('jobgate_auth') : null;
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      setRecruteurId(Number(auth.userId));
    }
    loadOffres();
  }, []);

  const loadOffres = async () => {
    setIsLoading(true);
    try {
      const data = await offresApi.list({ limit: 200 });
      const mapped: OffreRead[] = data.map((o) => ({
        id: String(o.id),
        recruteur_id: String(o.recruteur_id),
        titre: o.titre,
        description: o.description ?? '',
        date_publication: o.date_publication,
        statut: o.statut,
        candidature_count: 0,
        embedding_ready: false,
      }));
      setOffres(mapped);
      if (mapped.length > 0 && !selectedOffreId) {
        setSelectedOffreId(mapped[0].id);
      }
    } catch {
      toast.error('Impossible de charger les offres.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidatures = async (offreId: string) => {
    if (!offreId) return;
    setLoadingCandidatures(true);
    try {
      const data = await candidaturesApi.list({ offre_id: Number(offreId), limit: 500 });
      setCandidatures(data.map(mapApiCandidature));
    } catch {
      toast.error('Impossible de charger les candidatures.');
    } finally {
      setLoadingCandidatures(false);
    }
  };

  useEffect(() => {
    if (selectedOffreId && (activeTab === 'pipeline' || activeTab === 'classement')) {
      loadCandidatures(selectedOffreId);
    }
  }, [selectedOffreId, activeTab]);

  const handleCreateOffre = async (data: Partial<OffreRead>) => {
    if (!recruteurId) {
      toast.error('Identifiant recruteur introuvable. Reconnectez-vous.');
      return;
    }
    try {
      const created = await offresApi.create({
        recruteur_id: recruteurId,
        titre: data.titre ?? '',
        description: data.description,
        statut: data.statut ?? 'BROUILLON',
      });
      const newOffre: OffreRead = {
        id: String(created.id),
        recruteur_id: String(created.recruteur_id),
        titre: created.titre,
        description: created.description ?? '',
        date_publication: created.date_publication,
        statut: created.statut,
        candidature_count: 0,
        embedding_ready: false,
      };
      setOffres((prev) => [newOffre, ...prev]);
      setShowCreateModal(false);
      toast.success('Offre créée avec succès.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création.';
      toast.error(message);
    }
  };

  const handleEditOffre = async (data: Partial<OffreRead>) => {
    if (!editOffre) return;
    try {
      const updated = await offresApi.update(Number(editOffre.id), {
        titre: data.titre,
        description: data.description,
        statut: data.statut,
      });
      setOffres((prev) =>
        prev.map((o) =>
          o.id === editOffre.id
            ? { ...o, titre: updated.titre, description: updated.description ?? '', statut: updated.statut }
            : o
        )
      );
      setEditOffre(null);
      toast.success('Offre mise à jour.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.';
      toast.error(message);
    }
  };

  const handleDeleteOffre = async (id: string) => {
    try {
      await offresApi.delete(Number(id));
      setOffres((prev) => prev.filter((o) => o.id !== id));
      toast.success('Offre supprimée.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression.';
      toast.error(message);
    }
  };

  const handleSelectOffre = (id: string) => {
    setSelectedOffreId(id);
  };

  const tabs = [
    { key: 'offres' as ActiveTab, label: 'Offres', icon: <LayoutList size={16} /> },
    { key: 'pipeline' as ActiveTab, label: 'Pipeline Kanban', icon: <GitBranch size={16} /> },
    { key: 'classement' as ActiveTab, label: 'Classement IA', icon: <Trophy size={16} /> },
  ];

  const publishedCount = offres.filter((o) => o.statut === 'PUBLIEE').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des offres</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? 'Chargement…' : `${publishedCount} offre${publishedCount !== 1 ? 's' : ''} publiée${publishedCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOffres}
            disabled={isLoading}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            <Plus size={16} />
            Nouvelle offre
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'offres' && (
        <OffresTable
          offres={offres}
          isLoading={isLoading}
          onEdit={(offre) => setEditOffre(offre)}
          onDelete={handleDeleteOffre}
          onSelectForPipeline={(id) => { setSelectedOffreId(id); setActiveTab('pipeline'); }}
          onSelectForClassement={(id) => { setSelectedOffreId(id); setActiveTab('classement'); }}
          onRefresh={loadOffres}
        />
      )}

      {activeTab === 'pipeline' && (
        <PipelineKanban
          offres={offres.filter((o) => o.statut === 'PUBLIEE' || o.statut === 'CLOTUREE')}
          selectedOffreId={selectedOffreId}
          onSelectOffre={handleSelectOffre}
          candidatures={candidatures.filter((c) => c.offre_id === selectedOffreId)}
          isLoading={loadingCandidatures}
          onRefresh={() => loadCandidatures(selectedOffreId)}
        />
      )}

      {activeTab === 'classement' && (
        <ClassementTable
          offres={offres.filter((o) => o.statut !== 'BROUILLON')}
          selectedOffreId={selectedOffreId}
          onSelectOffre={handleSelectOffre}
          candidatures={candidatures
            .filter((c) => c.offre_id === selectedOffreId)
            .sort((a, b) => (b.score_matching ?? 0) - (a.score_matching ?? 0))}
          isLoading={loadingCandidatures}
          onRefresh={() => loadCandidatures(selectedOffreId)}
        />
      )}

      {/* Create modal */}
      {showCreateModal && (
        <OffreFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOffre}
        />
      )}

      {/* Edit modal */}
      {editOffre && (
        <OffreFormModal
          mode="edit"
          initialData={editOffre}
          onClose={() => setEditOffre(null)}
          onSubmit={handleEditOffre}
        />
      )}
    </div>
  );
}