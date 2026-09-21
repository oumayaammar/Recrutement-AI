'use client';
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AppLogo from '@/components/ui/AppLogo';
import { Sparkles, Shield, Zap, Users } from 'lucide-react';

type AuthTab = 'login' | 'register';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <AppLogo size={40} />
            <span className="text-2xl font-extrabold text-white tracking-tight">JobGate</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 mb-6">
              <Sparkles size={12} />
              Recrutement augmenté par l'IA
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
              Trouvez les meilleurs talents,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                plus vite
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Matching IA, pipeline kanban, recherche sémantique — tout ce qu'il faut pour recruter efficacement ou décrocher le poste idéal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            {[
              { icon: <Zap size={18} className="text-blue-400" />, title: 'Score IA instantané', desc: 'Chaque candidature reçoit un score de matching 0–100 généré par l\'IA.' },
              { icon: <Users size={18} className="text-violet-400" />, title: 'Pipeline visuel', desc: 'Kanban par statut — de RECUE à ACCEPTÉE en un clic.' },
              { icon: <Shield size={18} className="text-emerald-400" />, title: 'Recherche sémantique', desc: 'Trouvez des profils par compétences avec la compréhension du langage naturel.' },
            ].map((feat) => (
              <div key={`feat-${feat.title}`} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{feat.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs">
          © 2026 JobGate. Tous droits réservés.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="text-xl font-extrabold text-foreground">JobGate</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            {(['login', 'register'] as AuthTab[]).map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                  activeTab === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {activeTab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}