'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import type { OffreRead } from '@/lib/types/offer';
import OfferStatusBadge from '@/components/offer/offer-status-badge';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { ArrowLeft, Briefcase, Calendar, Pencil, Users, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterOfferDetailPage() {
  const params = useParams();
  const offreId = Number(params.id);
  const [offre, setOffre] = useState<OffreRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidatureCount, setCandidatureCount] = useState(0);
  const [generatingEmbedding, setGeneratingEmbedding] = useState(false);

  const fetchOffre = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [offreData, candidaturesData] = await Promise.allSettled([
        offresApi.get(offreId),
        candidaturesApi.list({ offre_id: offreId }),
      ]);
      if (offreData.status === 'fulfilled') setOffre(offreData.value);
      else throw offreData.reason;
      if (candidaturesData.status === 'fulfilled') setCandidatureCount(candidaturesData.value.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [offreId]);

  useEffect(() => { if (!isNaN(offreId)) fetchOffre(); }, [offreId, fetchOffre]);

  const handleGenerateEmbedding = async () => {
    setGeneratingEmbedding(true);
    try {
      await offresApi.generateEmbedding(offreId);
      toast.success('Embedding généré avec succès !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la génération.');
    } finally {
      setGeneratingEmbedding(false);
    }
  };

  if (loading) return <CardSkeleton className="max-w-2xl" />;
  if (error) return <ErrorState message={error} onRetry={fetchOffre} />;
  if (!offre) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/recruiter/offers" className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{offre.titre}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Détail de l&apos;offre</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{offre.titre}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar size={11} /> {formatDate(offre.date_publication)}
              </p>
            </div>
          </div>
          <OfferStatusBadge statut={offre.statut} dot />
        </div>

        {offre.description && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{offre.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          <Link
            href={`/recruiter/offers/${offreId}/edit`}
            className="flex items-center gap-2 bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-muted/80 transition-all"
          >
            <Pencil size={14} /> Modifier
          </Link>
          <Link
            href={`/recruiter/offers/${offreId}/candidates`}
            className="flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-100 transition-all border border-violet-200"
          >
            <Users size={14} /> Candidatures ({candidatureCount})
          </Link>
          <button
            onClick={handleGenerateEmbedding}
            disabled={generatingEmbedding}
            className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-amber-100 transition-all border border-amber-200 disabled:opacity-60"
          >
            {generatingEmbedding ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Générer embedding
          </button>
        </div>
      </div>
    </div>
  );
}
