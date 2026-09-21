'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, CheckCircle2, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import type { OffreRead } from './JobOffersCandidatContent';
import { cvsApi, candidaturesApi } from '@/lib/api';
import type { CVRead } from '@/lib/api';

interface ApplyFormValues {
  cv_id: string;
  message?: string;
}

interface ApplyModalProps {
  offre: OffreRead;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ offre, onClose, onSuccess }: ApplyModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvs, setCvs] = useState<CVRead[]>([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const [newCvUrl, setNewCvUrl] = useState('');
  const [showAddCv, setShowAddCv] = useState(false);
  const [addingCv, setAddingCv] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ApplyFormValues>();
  const selectedCvId = watch('cv_id');

  useEffect(() => {
    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('jobgate_auth') : null;
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);
    const id = Number(auth.id ?? auth.userId);
    setCandidatId(id);
    loadCvs(id);
  }, []);

  const loadCvs = async (id: number) => {
    setLoadingCvs(true);
    try {
      const data = await cvsApi.getByCandidatId(id);
      setCvs(data);
    } catch {
      toast.error('Impossible de charger vos CVs.');
    } finally {
      setLoadingCvs(false);
    }
  };

  const handleAddCv = async () => {
    if (!newCvUrl.trim() || !candidatId) return;
    setAddingCv(true);
    try {
      const cv = await cvsApi.create({ candidat_id: candidatId, fichier_url: newCvUrl.trim() });
      setCvs((prev) => [...prev, cv]);
      setNewCvUrl('');
      setShowAddCv(false);
      toast.success('CV ajouté avec succès.');
    } catch {
      toast.error('Erreur lors de l\'ajout du CV.');
    } finally {
      setAddingCv(false);
    }
  };

  const onSubmit = async () => {
    if (!candidatId || !selectedCvId) return;
    setIsSubmitting(true);
    try {
      const candidature = await candidaturesApi.create({
        candidat_id: candidatId,
        offre_id: Number(offre.id),
      });
      // Trigger score calculation
      try {
        await candidaturesApi.calculerScore(candidature.id);
      } catch {
        // Score calculation may fail if embeddings aren't ready — not critical
      }
      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la candidature.';
      if (message.includes('409') || message.toLowerCase().includes('unique')) {
        toast.error('Vous avez déjà postulé à cette offre.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSuccess = () => {
    toast.success(`Candidature envoyée pour "${offre.titre}" !`);
    onSuccess();
  };

  const selectedCv = cvs.find((cv) => String(cv.id) === selectedCvId);

  return (
    <Modal
      open
      onClose={onClose}
      title={step === 3 ? undefined : `Postuler — ${offre.titre}`}
      size="lg"
    >
      {/* Step indicators */}
      {step !== 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={`step-frag-${s}`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                  {s}
                </span>
                {s === 1 ? 'Sélectionner un CV' : 'Confirmer'}
              </div>
              {s < 2 && <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1: CV selection */}
      {step === 1 && (
        <form onSubmit={handleSubmit(() => setStep(2))} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Choisissez votre CV <span className="text-red-500">*</span></label>
            <p className="text-xs text-muted-foreground mb-3">Sélectionnez le CV le plus adapté à cette offre. Le score de matching IA sera calculé automatiquement.</p>

            {loadingCvs ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : cvs.length === 0 ? (
              <div className="flex flex-col items-center py-8 bg-muted rounded-xl border border-border">
                <FileText size={28} className="text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Aucun CV disponible</p>
                <p className="text-xs text-muted-foreground mt-1">Ajoutez un CV ci-dessous avant de postuler.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cvs.map((cv) => (
                  <label
                    key={`cv-opt-${cv.id}`}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                      selectedCvId === String(cv.id) ? 'border-primary bg-blue-50' : 'border-border bg-card hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={String(cv.id)}
                      className="mt-0.5 accent-primary"
                      {...register('cv_id', { required: 'Sélectionnez un CV' })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className={selectedCvId === String(cv.id) ? 'text-primary' : 'text-muted-foreground'} />
                        <span className="text-sm font-semibold text-foreground truncate">{cv.fichier_url}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Déposé le {new Date(cv.date_depot).toLocaleDateString('fr-FR')}
                      </p>
                      {cv.competences.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cv.competences.slice(0, 4).map((c) => (
                            <span key={`comp-${cv.id}-${c.id}`} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{c.nom}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.cv_id && <p className="text-red-500 text-xs mt-1">{errors.cv_id.message}</p>}
          </div>

          {/* Add CV inline */}
          {!showAddCv ? (
            <button
              type="button"
              onClick={() => setShowAddCv(true)}
              className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline"
            >
              <Plus size={13} /> Ajouter un CV (URL)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={newCvUrl}
                onChange={(e) => setNewCvUrl(e.target.value)}
                placeholder="https://exemple.com/mon-cv.pdf"
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleAddCv}
                disabled={addingCv || !newCvUrl.trim()}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {addingCv ? '…' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowAddCv(false)} className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-all">
                Annuler
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="apply-message" className="text-sm font-semibold text-foreground">Message de motivation <span className="text-muted-foreground font-normal">(optionnel)</span></label>
            <textarea
              id="apply-message"
              rows={3}
              placeholder="Bonjour, je suis très intéressé(e) par ce poste car…"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none hover:border-slate-400 transition-all"
              {...register('message')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95">
              Annuler
            </button>
            <button
              type="submit"
              disabled={cvs.length === 0 || loadingCvs}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="bg-muted rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Récapitulatif de votre candidature</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Offre</span>
                <span className="text-sm font-semibold text-foreground">{offre.titre}</span>
              </div>
              {offre.recruteur_entreprise && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Entreprise</span>
                  <span className="text-sm text-foreground">{offre.recruteur_entreprise}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">CV sélectionné</span>
                <span className="text-sm font-medium text-foreground truncate">{selectedCv?.fichier_url}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Score IA automatique</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Après envoi, l&apos;IA analysera la compatibilité entre votre CV et cette offre. Le recruteur verra votre score de matching.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95">
              Retour
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Envoi en cours…
                </>
              ) : 'Envoyer ma candidature'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="flex flex-col items-center py-8 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Candidature envoyée !</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Votre candidature pour <span className="font-semibold text-foreground">{offre.titre}</span> a bien été transmise. Le score IA sera calculé dans quelques instants.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-4 w-full text-left">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Prochaines étapes</p>
            <div className="flex flex-col gap-2">
              {['Score IA calculé automatiquement', 'Le recruteur examine votre profil', 'Mise à jour du statut dans vos candidatures'].map((s, i) => (
                <div key={`next-step-${i}`} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleConfirmSuccess} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all">
            Voir mes candidatures
          </button>
        </div>
      )}
    </Modal>
  );
}