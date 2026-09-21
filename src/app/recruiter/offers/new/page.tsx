'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import type { StatutOffre } from '@/lib/types/offer';
import { ArrowLeft, Briefcase, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const STATUT_OPTIONS: { value: StatutOffre; label: string }[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'PUBLIEE', label: 'Publiée' },
  { value: 'CLOTUREE', label: 'Clôturée' },
  { value: 'ARCHIVEE', label: 'Archivée' },
];

export default function NewOfferPage() {
  const router = useRouter();
  const [recruteurId, setRecruteurId] = useState<number | null>(null);
  const [form, setForm] = useState({ titre: '', description: '', statut: 'BROUILLON' as StatutOffre });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setRecruteurId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

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
    setError(null);
    try {
      const created = await offresApi.create({
        recruteur_id: recruteurId ?? 1,
        titre: form.titre.trim(),
        description: form.description.trim() || undefined,
        statut: form.statut,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/recruiter/offers/${created.id}`), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'offre.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/recruiter/offers" className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nouvelle offre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Créez une nouvelle offre d&apos;emploi</p>
        </div>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
          <p className="font-semibold text-emerald-800">Offre créée avec succès !</p>
          <p className="text-sm text-emerald-700">Redirection en cours…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Titre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              placeholder="ex. Développeur Full-Stack React/Node.js"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${fieldErrors.titre ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
            />
            {fieldErrors.titre && <p className="text-red-500 text-xs">{fieldErrors.titre}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez le poste, les responsabilités, les compétences requises…"
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
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
              <><Loader2 size={16} className="animate-spin" /> Création en cours…</>
            ) : (
              <><Briefcase size={16} /> Créer l&apos;offre</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
