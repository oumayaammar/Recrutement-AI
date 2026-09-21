'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserCheck, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { candidatsApi } from '@/lib/api/candidates';
import { recruteursApi } from '@/lib/api/recruiters';

type RoleType = 'CANDIDAT' | 'RECRUTEUR';

interface CandidatFields {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  date_naissance?: string;
  disponibilite: boolean;
}

interface RecruteurFields {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  poste?: string;
  departement?: string;
}

type RegisterFormValues = CandidatFields & RecruteurFields;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [role, setRole] = useState<RoleType>('CANDIDAT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({ defaultValues: { disponibilite: true } });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      let userId: number;
      let nom: string;
      let prenom: string;

      if (role === 'CANDIDAT') {
        const result = await candidatsApi.create({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          mot_de_passe: data.password,
          telephone: data.telephone || undefined,
          date_naissance: data.date_naissance || undefined,
          disponibilite: data.disponibilite,
        });
        userId = result.id;
        nom = result.nom;
        prenom = result.prenom;
      } else {
        const result = await recruteursApi.create({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          mot_de_passe: data.password,
          poste: data.poste || undefined,
          departement: data.departement || undefined,
        });
        userId = result.id;
        nom = result.nom;
        prenom = result.prenom;
      }

      // localStorage.setItem('jobgate_auth', JSON.stringify({
      //   userId,
      //   role,
      //   nom,
      //   prenom,
      //   email: data.email,
      // }));

      // toast.success(`Compte ${role === 'CANDIDAT' ? 'candidat' : 'recruteur'} créé ! Bienvenue sur JobGate.`);
      // reset();
      toast.success(`Compte ${role === 'CANDIDAT' ? 'candidat' : 'recruteur'} créé ! Vous pouvez maintenant vous connecter.`);
      reset();
      onSwitchToLogin();

      // setTimeout(() => {
      //   if (role === 'CANDIDAT') window.location.href = '/candidate/dashboard';
      //   else window.location.href = '/recruiter/dashboard';
      // }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du compte.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
        <p className="text-muted-foreground text-sm mt-1">Rejoignez JobGate en tant que :</p>
      </div>

      {/* Role toggle */}
      <div className="flex gap-3 mb-6">
        {(['CANDIDAT', 'RECRUTEUR'] as RoleType[]).map((r) => (
          <button
            key={`role-${r}`}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
              role === r
                ? r === 'CANDIDAT' ? 'border-primary bg-blue-50 text-primary' : 'border-accent bg-violet-50 text-accent'
                : 'border-border bg-card text-muted-foreground hover:border-slate-300'
            }`}
          >
            {r === 'CANDIDAT' ? <UserCheck size={22} /> : <Briefcase size={22} />}
            <span className="text-sm font-semibold">{r === 'CANDIDAT' ? 'Candidat' : 'Recruteur'}</span>
            <span className="text-xs text-center leading-tight opacity-70">
              {r === 'CANDIDAT' ? 'Je cherche un emploi' : 'Je recrute des talents'}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Common fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-prenom" className="text-xs font-semibold text-foreground">Prénom <span className="text-red-500">*</span></label>
            <input
              id="reg-prenom"
              type="text"
              placeholder="Sara"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors.prenom ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
              {...register('prenom', { required: 'Requis' })}
            />
            {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-nom" className="text-xs font-semibold text-foreground">Nom <span className="text-red-500">*</span></label>
            <input
              id="reg-nom"
              type="text"
              placeholder="Benali"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors.nom ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
              {...register('nom', { required: 'Requis' })}
            />
            {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-email" className="text-xs font-semibold text-foreground">Adresse e-mail <span className="text-red-500">*</span></label>
          <input
            id="reg-email"
            type="email"
            placeholder="vous@exemple.fr"
            className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors.email ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
            {...register('email', {
              required: 'E-mail requis',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format invalide' },
            })}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className="text-xs font-semibold text-foreground">Mot de passe <span className="text-red-500">*</span></label>
          <p className="text-xs text-muted-foreground -mt-0.5">Minimum 8 caractères</p>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors.password ? 'border-red-400' : 'border-input hover:border-slate-400'}`}
              {...register('password', { required: 'Mot de passe requis', minLength: { value: 8, message: 'Minimum 8 caractères' } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>

        {/* Candidat-specific fields */}
        {role === 'CANDIDAT' && (
          <div className="flex flex-col gap-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700">Informations candidat</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-telephone" className="text-xs font-semibold text-foreground">Téléphone</label>
              <input
                id="reg-telephone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                {...register('telephone')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-dob" className="text-xs font-semibold text-foreground">Date de naissance</label>
              <input
                id="reg-dob"
                type="date"
                className="w-full px-3 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                {...register('date_naissance')}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="reg-disponibilite"
                type="checkbox"
                className="w-4 h-4 rounded border-input accent-primary"
                {...register('disponibilite')}
              />
              <label htmlFor="reg-disponibilite" className="text-sm text-foreground font-medium">
                Disponible immédiatement
              </label>
            </div>
          </div>
        )}

        {/* Recruteur-specific fields */}
        {role === 'RECRUTEUR' && (
          <div className="flex flex-col gap-4 bg-violet-50/50 rounded-xl p-4 border border-violet-100">
            <p className="text-xs font-semibold text-violet-700">Informations recruteur</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-poste" className="text-xs font-semibold text-foreground">Poste / Titre</label>
              <input
                id="reg-poste"
                type="text"
                placeholder="ex. Responsable RH, DRH, Talent Acquisition…"
                className="w-full px-3 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                {...register('poste')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-departement" className="text-xs font-semibold text-foreground">Département / Entreprise</label>
              <input
                id="reg-departement"
                type="text"
                placeholder="ex. TechCorp — Département RH"
                className="w-full px-3 py-2.5 rounded-lg border border-input hover:border-slate-400 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                {...register('departement')}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos{' '}
          <button type="button" className="text-primary hover:underline font-medium">Conditions d&apos;utilisation</button>{' '}
          et notre{' '}
          <button type="button" className="text-primary hover:underline font-medium">Politique de confidentialité</button>.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Création en cours…
            </span>
          ) : (
            `Créer mon espace ${role === 'CANDIDAT' ? 'candidat' : 'recruteur'}`
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">
            Se connecter
          </button>
        </p>
      </form>
    </div>
  );
}