'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Copy, Check, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import {administrateursApi } from '@/lib/api/admin';
import { candidatsApi } from '@/lib/api/candidates';
import { recruteursApi } from '@/lib/api/recruiters';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  portal: 'candidat' | 'recruteur' | 'admin';
}

const demoCredentials: DemoCredential[] = [
  { role: 'Candidat', email: 'oumaammar@gmail.com', password: 'oumaammar', portal: 'candidat' },
  { role: 'Recruteur', email: 'RecruteurTwo@gmail.com', password: 'Recruteur2026!', portal: 'recruteur' },
  { role: 'Admin', email: 'AdminTwo@gmail.com', password: 'Admin2026!', portal: 'admin' },
];

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { remember: false } });

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
    toast.info(`Identifiants ${cred.role} remplis automatiquement`);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Try to find user across all user types by listing and matching email
      // Since backend has no /auth/login, we attempt to match by fetching lists
      let portal: 'candidat' | 'recruteur' | 'admin' | null = null;
      let userId: number | null = null;
      let nom = '';
      let prenom = '';

      // Try candidats
      try {
        const candidats = await candidatsApi.list(0, 200);
        const found = candidats.find((c) => c.email === data.email);
        if (found) {
          portal = 'candidat';
          userId = found.id;
          nom = found.nom;
          prenom = found.prenom;
        }
      } catch {
        // ignore
      }

      // Try recruteurs
      if (!portal) {
        try {
          const recruteurs = await recruteursApi.list(0, 200);
          const found = recruteurs.find((r) => r.email === data.email);
          if (found) {
            portal = 'recruteur';
            userId = found.id;
            nom = found.nom;
            prenom = found.prenom;
          }
        } catch {
          // ignore
        }
      }

      // Try administrateurs
      if (!portal) {
        try {
          const admins = await administrateursApi.list(0, 200);
          const found = admins.find((a) => a.email === data.email);
          if (found) {
            portal = 'admin';
            userId = found.id;
            nom = found.nom;
            prenom = found.prenom;
          }
        } catch {
          // ignore
        }
      }

      if (!portal || userId === null) {
        // Fallback: check demo credentials for offline/dev mode
        const match = demoCredentials.find((c) => c.email === data.email && c.password === data.password);
        if (match) {
          portal = match.portal;
          userId = match.portal === 'candidat' ? 1 : match.portal === 'recruteur' ? 2 : 3;
          nom = match.portal === 'candidat' ? 'Benali' : match.portal === 'recruteur' ? 'Fontaine' : 'Admin';
          prenom = match.portal === 'candidat' ? 'Sara' : match.portal === 'recruteur' ? 'Marc' : 'Super';
        } else {
          toast.error('Identifiants invalides — aucun compte trouvé avec cet e-mail.');
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem('jobgate_auth', JSON.stringify({
        userId,
        id: userId,
        role: portal.toUpperCase(),
        nom,
        prenom,
        email: data.email,
      }));

      toast.success(`Bienvenue ! Redirection en cours…`);

      setTimeout(() => {
        if (portal === 'candidat') window.location.href = '/candidate/dashboard';
        else if (portal === 'recruteur') window.location.href = '/recruiter/dashboard';
        else window.location.href = '/admin/dashboard';
      }, 800);
    } catch {
      toast.error('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-foreground">Bon retour 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">Connectez-vous à votre espace JobGate</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
            Adresse e-mail
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.email ? 'border-red-400 focus:ring-red-300' : 'border-input hover:border-slate-400'
            }`}
            {...register('email', {
              required: "L'adresse e-mail est requise",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format d'e-mail invalide" },
            })}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
              Mot de passe
            </label>
            <button type="button" className="text-xs text-primary hover:underline font-medium">
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                errors.password ? 'border-red-400 focus:ring-red-300' : 'border-input hover:border-slate-400'
              }`}
              {...register('password', { required: 'Le mot de passe est requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-input accent-primary"
            {...register('remember')}
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Se souvenir de moi</label>
        </div>

        {/* Submit */}
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
              Connexion…
            </span>
          ) : (
            <>
              <LogIn size={16} />
              Se connecter
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Pas encore de compte ?{' '}
        <button onClick={onSwitchToRegister} className="text-primary font-semibold hover:underline">
          Créer un compte
        </button>
      </p>

      {/* Demo credentials */}
      {/* <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">i</span>
          Comptes de démonstration
        </p>
        <div className="flex flex-col gap-2">
          {demoCredentials.map((cred) => (
            <div key={`demo-${cred.role}`} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  cred.portal === 'candidat' ? 'bg-blue-100 text-blue-700' :
                  cred.portal === 'recruteur' ? 'bg-violet-100 text-violet-700' :
                  'bg-slate-100 text-slate-700'
                }`}>{cred.role}</span>
                <span className="text-xs text-muted-foreground truncate">{cred.email}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => handleCopy(cred.email, `${cred.role}-email`)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
                  title="Copier l'e-mail"
                >
                  {copiedField === `${cred.role}-email` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => autofill(cred)}
                  className="text-xs text-primary font-semibold hover:underline px-1"
                >
                  Utiliser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}