'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { cvsApi } from '@/lib/api/cvs';
import type { CVRead } from '@/lib/types/cv';
import { FileText, Upload, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CandidateCVPage() {
  const [cvs, setCvs] = useState<CVRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [candidatId, setCandidatId] = useState<number | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('jobgate_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (candidatId === null) return;
    setLoading(true);
    cvsApi.getByCandidatId(candidatId)
      .then(setCvs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [candidatId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce CV ?')) return;
    setDeletingId(id);
    try {
      await cvsApi.delete(id);
      setCvs((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getCVStatus = (cv: CVRead) => {
    const hasEmbedding = false; // embedding status not in CVRead directly
    if (cv.competences?.length > 0 || cv.experiences?.length > 0 || cv.formations?.length > 0) {
      return { label: 'Prêt', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} /> };
    }
    if (cv.texte_brut) {
      return { label: 'Texte extrait', color: 'text-blue-600 bg-blue-50', icon: <Clock size={14} /> };
    }
    return { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: <AlertCircle size={14} /> };
  };

  return (
    // <AppLayout portal="candidat">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes CVs</h1>
            <p className="text-muted-foreground text-sm mt-1">Gérez vos CVs et suivez le traitement IA</p>
          </div>
          <Link
            href="/candidate/cv/upload"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload size={16} />
            Déposer un CV
          </Link>
        </div>

        {/* Content */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && cvs.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium mb-1">Aucun CV déposé</p>
            <p className="text-muted-foreground text-sm mb-4">Déposez votre premier CV pour commencer</p>
            <Link
              href="/candidate/cv/upload"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Upload size={16} />
              Déposer un CV
            </Link>
          </div>
        )}

        {!loading && !error && cvs.length > 0 && (
          <div className="space-y-3">
            {cvs.map((cv) => {
              const status = getCVStatus(cv);
              return (
                <div key={cv.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {cv.fichier_url ? cv.fichier_url.split('/').pop() : `CV #${cv.id}`}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Déposé le {new Date(cv.date_depot).toLocaleDateString('fr-FR')}
                      {cv.competences?.length > 0 && ` · ${cv.competences.length} compétence(s)`}
                      {cv.experiences?.length > 0 && ` · ${cv.experiences.length} expérience(s)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/candidate/cv/${cv.id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Eye size={14} />
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      disabled={deletingId === cv.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === cv.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    // </AppLayout>
  );
}
