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
import { ArrowLeft, Briefcase, Calendar, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateOfferDetailPage() {
  const params = useParams();
  const offreId = Number(params.id);
  const [offre, setOffre] = useState<OffreRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [candidatId, setCandidatId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchOffre = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offresApi.get(offreId);
      setOffre(data);
      if (candidatId) {
        const cands = await candidaturesApi.list({ candidat_id: candidatId, offre_id: offreId });
        setIsApplied(cands.length > 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [offreId, candidatId]);

  useEffect(() => {
    if (!isNaN(offreId)) fetchOffre();
  }, [offreId, fetchOffre]);

  const handleApply = async () => {
    if (!candidatId) { toast.error('Vous devez être connecté.'); return; }
    setApplying(true);
    try {
      await candidaturesApi.create({ candidat_id: candidatId, offre_id: offreId, statut: 'RECUE' });
      setIsApplied(true);
      toast.success('Candidature envoyée !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la candidature.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <CardSkeleton className="max-w-2xl" />;
  if (error) return <ErrorState message={error} onRetry={fetchOffre} />;
  if (!offre) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/candidate/offers" className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{offre.titre}</h1>
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

        <div className="pt-4 border-t border-border">
          {isApplied ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle2 size={18} />
              <span className="font-semibold text-sm">Vous avez déjà postulé à cette offre</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || offre.statut !== 'PUBLIEE'}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {applying ? 'Envoi en cours…' : 'Postuler à cette offre'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
