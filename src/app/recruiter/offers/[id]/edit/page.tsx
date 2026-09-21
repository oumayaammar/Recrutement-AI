'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import type { OffreRead, StatutOffre } from '@/lib/types/offer';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const STATUT_OPTIONS: { value: StatutOffre; label: string }[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'PUBLIEE', label: 'Publiée' },
  { value: 'CLOTUREE', label: 'Clôturée' },
  { value: 'ARCHIVEE', label: 'Archivée' },
];

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offreId = Number(params.id);

  const [offre, setOffre] = useState<OffreRead | null>(null);
  const [isLoadingOffre, setIsLoadingOffre] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ titre: '', description: '', statut: 'BROUILLON' as StatutOffre });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchOffre = useCallback(async () => {
    setIsLoadingOffre(true);
    setLoadError(null);
    try {
      const data = await offresApi.get(offreId);
      setOffre(data);
      setForm({ titre: data.titre, description: data.description ?? '', statut: data.statut });
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setIsLoadingOffre(false);
    }
  }, [offreId]);

  useEffect(() => { if (!isNaN(offreId)) fetchOffre(); }, [offreId, fetchOffre]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.titre.trim()) errors.titre = 'Le titre est requis.';
    if (form.titre.trim().length > 200) errors.titre = 'Le titre ne doit pas dépasser 200 caractères.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await offresApi.update(offreId, { titre: form.titre.trim(), description: form.description.trim() || '', statut: form.statut });
      setSuccess(true);
      setTimeout(() => router.push(`/recruiter/offers/${offreId}`), 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOffre) return <CardSkeleton className="max-w-2xl" />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchOffre} />;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href={`/recruiter/offers/${offreId}`} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modifier l&apos;offre</h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{offre?.titre}</p>
        </div>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
          <p className="font-semibold text-emerald-800">Offre mise à jour !</p>
          <p className="text-sm text-emerald-700">Redirection en cours…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <AlertCircle size={16} /> {submitError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Titre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.titre ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
            />
            {fieldErrors.titre && <p className="text-red-500 text-xs">{fieldErrors.titre}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as StatutOffre }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {STATUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Mise à jour…</>
            ) : (
              <><RefreshCw size={16} /> Mettre à jour</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
