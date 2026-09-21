'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';

import type { OffreRead, StatutOffre } from './JobOffersRecruteurContent';

interface OffreFormValues {
  titre: string;
  description: string;
  statut: StatutOffre;
}

interface OffreFormModalProps {
  mode: 'create' | 'edit';
  initialData?: OffreRead;
  onClose: () => void;
  onSubmit: (data: Partial<OffreRead>) => void;
}

const statutOptions: { value: StatutOffre; label: string }[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'PUBLIEE', label: 'Publiée' },
  { value: 'CLOTUREE', label: 'Clôturée' },
  { value: 'ARCHIVEE', label: 'Archivée' },
];

export default function OffreFormModal({ mode, initialData, onClose, onSubmit }: OffreFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OffreFormValues>({
    defaultValues: {
      titre: initialData?.titre ?? '',
      description: initialData?.description ?? '',
      statut: initialData?.statut ?? 'BROUILLON',
    },
  });

  const onFormSubmit = async (data: OffreFormValues) => {
    setIsLoading(true);
    // Delegate to parent — parent calls offresApi.create or offresApi.update
    onSubmit(data);
    setIsLoading(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === 'create' ? 'Créer une nouvelle offre' : 'Modifier l\'offre'}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            form="offre-form"
            type="submit"
            disabled={isLoading || (!isDirty && mode === 'edit')}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ minWidth: '130px' }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {mode === 'create' ? 'Création…' : 'Enregistrement…'}
              </>
            ) : mode === 'create' ? 'Créer l\'offre' : 'Enregistrer'}
          </button>
        </>
      }
    >
      <form id="offre-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Titre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="offre-titre" className="text-sm font-semibold text-foreground">
            Titre du poste <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground -mt-0.5">Soyez précis — ex. "Développeur Full Stack React / Node.js (CDI)"</p>
          <input
            id="offre-titre"
            type="text"
            placeholder="ex. Ingénieur DevOps Senior — AWS & Kubernetes"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.titre ? 'border-red-400 focus:ring-red-300' : 'border-input hover:border-slate-400'
            }`}
            {...register('titre', {
              required: 'Le titre est obligatoire',
              minLength: { value: 5, message: 'Minimum 5 caractères' },
              maxLength: { value: 120, message: 'Maximum 120 caractères' },
            })}
          />
          {errors.titre && <p className="text-red-500 text-xs">{errors.titre.message}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="offre-description" className="text-sm font-semibold text-foreground">
            Description du poste <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Décrivez les missions, le profil recherché, la stack technique et les avantages. Une description détaillée améliore la qualité du matching IA.
          </p>
          <textarea
            id="offre-description"
            rows={8}
            placeholder={`Missions principales :\n- ...\n\nProfil recherché :\n- ...\n\nStack technique :\n- ...\n\nAvantages :\n- ...`}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y transition-all ${
              errors.description ? 'border-red-400 focus:ring-red-300' : 'border-input hover:border-slate-400'
            }`}
            {...register('description', {
              required: 'La description est obligatoire',
              minLength: { value: 30, message: 'Minimum 30 caractères pour un bon matching IA' },
            })}
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
        </div>

        {/* Statut */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="offre-statut" className="text-sm font-semibold text-foreground">Statut de publication</label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Seules les offres <strong>Publiées</strong> sont visibles par les candidats.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statutOptions.map((opt) => (
              <label
                key={`statut-radio-${opt.value}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 has-[:checked]:border-primary has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register('statut')}
                />
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI hint */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <span className="text-violet-600 text-sm font-bold">IA</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Embedding IA automatique</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Après publication, générez l'embedding vectoriel de cette offre pour activer le matching IA avec les CVs des candidats. Accessible depuis le tableau des offres.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}