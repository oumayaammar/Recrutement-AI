'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { cvsApi } from '@/lib/api/cvs';
import type { CVRead, CompetenceRead, ExperienceRead, FormationRead } from '@/lib/types/cv';
import {
  ArrowLeft, RefreshCw, Zap, FileText, Brain, Briefcase, GraduationCap,
  CheckCircle, Loader2, AlertCircle, Clock, ExternalLink
} from 'lucide-react';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkillList({ skills }: { skills: CompetenceRead[] }) {
  if (!skills?.length) return <p className="text-sm text-muted-foreground italic">Aucune compétence extraite</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <span key={s.id} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
          {s.nom}
          {s.niveau && <span className="text-primary/60">· {s.niveau}</span>}
        </span>
      ))}
    </div>
  );
}

function ExperienceList({ experiences }: { experiences: ExperienceRead[] }) {
  if (!experiences?.length) return <p className="text-sm text-muted-foreground italic">Aucune expérience extraite</p>;
  return (
    <div className="space-y-3">
      {experiences.map((e) => (
        <div key={e.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Briefcase size={14} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{e.poste}</p>
            <p className="text-sm text-muted-foreground">{e.entreprise}</p>
            {(e.date_debut || e.date_fin) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {e.date_debut ?? '?'} → {e.date_fin ?? 'Présent'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EducationList({ formations }: { formations: FormationRead[] }) {
  if (!formations?.length) return <p className="text-sm text-muted-foreground italic">Aucune formation extraite</p>;
  return (
    <div className="space-y-3">
      {formations.map((f) => (
        <div key={f.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <GraduationCap size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{f.diplome}</p>
            <p className="text-sm text-muted-foreground">{f.etablissement}</p>
            {f.annee && <p className="text-xs text-muted-foreground mt-0.5">{f.annee}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmbeddingStatus({
  hasData,
  loading,
  error,
  onGenerate,
}: {
  hasData: boolean;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {hasData ? (
          <>
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">Embedding généré</span>
          </>
        ) : (
          <>
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm text-amber-700 font-medium">Embedding non généré</span>
          </>
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
        {loading ? 'Génération...' : 'Générer embedding'}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CVDetailPage() {
  const params = useParams();
  const cvId = Number(params.id);

  const [cv, setCv] = useState<CVRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [embeddingDone, setEmbeddingDone] = useState(false);

  const loadCV = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await cvsApi.get(cvId);
      setCv(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cvId]);

  useEffect(() => { loadCV(); }, [loadCV]);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const updated = await cvsApi.extract(cvId);
      setCv(updated);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur extraction');
    } finally {
      setExtracting(false);
    }
  };

  const handleEmbedding = async () => {
    setEmbeddingLoading(true);
    setEmbeddingError(null);
    try {
      await cvsApi.generateEmbedding(cvId);
      setEmbeddingDone(true);
    } catch (e: unknown) {
      setEmbeddingError(e instanceof Error ? e.message : 'Erreur embedding');
    } finally {
      setEmbeddingLoading(false);
    }
  };

  if (loading) {
    return (
      // <AppLayout portal="candidat">
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      // </AppLayout>
    );
  }

  if (error || !cv) {
    return (
      <AppLayout portal="candidat">
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error ?? 'CV introuvable'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const hasAIData = (cv.competences?.length > 0) || (cv.experiences?.length > 0) || (cv.formations?.length > 0);

  return (
    // <AppLayout portal="candidat">
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/candidate/cv" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Détail du CV</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Déposé le {new Date(cv.date_depot).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            onClick={() => loadCV(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        <div className="space-y-4">
          {/* CV File card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Fichier CV</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">
                  {cv.fichier_url ? cv.fichier_url.split('/').pop() : `CV #${cv.id}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{cv.fichier_url}</p>
              </div>
              {cv.fichier_url && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/${cv.fichier_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} />
                  Ouvrir
                </a>
              )}
            </div>
          </div>

          {/* Extracted text card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-foreground">Texte extrait</h2>
              </div>
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {extracting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {extracting ? 'Extraction...' : 'Extraire le texte'}
              </button>
            </div>
            {cv.texte_brut ? (
              <div className="bg-muted/40 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{cv.texte_brut}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Texte non encore extrait</p>
            )}
          </div>

          {/* Skills card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Compétences</h2>
              {cv.competences?.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {cv.competences.length}
                </span>
              )}
            </div>
            <SkillList skills={cv.competences ?? []} />
          </div>

          {/* Experiences card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-foreground">Expériences</h2>
              {cv.experiences?.length > 0 && (
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                  {cv.experiences.length}
                </span>
              )}
            </div>
            <ExperienceList experiences={cv.experiences ?? []} />
          </div>

          {/* Education card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={16} className="text-amber-600" />
              <h2 className="text-sm font-semibold text-foreground">Formations</h2>
              {cv.formations?.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {cv.formations.length}
                </span>
              )}
            </div>
            <EducationList formations={cv.formations ?? []} />
          </div>

          {/* Embedding card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-foreground">Embedding vectoriel</h2>
            </div>
            <EmbeddingStatus
              hasData={embeddingDone || hasAIData}
              loading={embeddingLoading}
              error={embeddingError}
              onGenerate={handleEmbedding}
            />
            {embeddingError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {embeddingError}
              </p>
            )}
            {embeddingDone && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle size={12} /> Embedding généré avec succès
              </p>
            )}
          </div>
        </div>
      </div>
    // </AppLayout>
  );
}
