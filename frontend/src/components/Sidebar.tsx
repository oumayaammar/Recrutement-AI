'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Send,
  User,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  Settings,
  LogOut,
  Shield,
  GitBranch,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  portal: 'candidat' | 'recruteur' | 'admin';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const candidatNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/candidate/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Offres d\'emploi', href: '/candidate/offers', icon: <Briefcase size={20} /> },
  { label: 'Mes CVs', href: '/candidate/cv', icon: <FileText size={20} /> },
  { label: 'Candidatures', href: '/candidate/applications', icon: <Send size={20} /> },
  { label: 'Mon Profil', href: '/candidate/profile', icon: <User size={20} /> },
];

const recruteurNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/recruiter/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Offres', href: '/recruiter/offers', icon: <Briefcase size={20} /> },
  { label: 'Candidats', href: '/recruiter/candidates', icon: <Users size={20} /> },
  { label: 'Candidatures', href: '/recruiter/applications', icon: <Send size={20} /> },
  { label: 'Pipeline', href: '/recruiter/job-offers-management-recruteur', icon: <GitBranch size={20} /> }, // ← ajouté
  { label: 'Recherche IA', href: '/recruiter/search', icon: <Search size={20} /> },
  { label: 'Mon Profil', href: '/recruiter/profile', icon: <User size={20} /> },
];

const adminNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users size={20} /> },
  { label: 'Candidats', href: '/admin/candidates', icon: <User size={20} /> },
  { label: 'Recruteurs', href: '/admin/recruiters', icon: <Briefcase size={20} /> },
  { label: 'Offres', href: '/admin/offers', icon: <Shield size={20} /> },
  { label: 'Candidatures', href: '/admin/applications', icon: <Send size={20} /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings size={20} /> },
];

const portalNavMap = { candidat: candidatNav, recruteur: recruteurNav, admin: adminNav };
const portalLabel = { candidat: 'Espace Candidat', recruteur: 'Espace Recruteur', admin: 'Administration' };
const portalColor = { candidat: 'text-blue-600', recruteur: 'text-violet-600', admin: 'text-slate-600' };

export default function Sidebar({ collapsed, onToggle, portal }: SidebarProps) {
  const pathname = usePathname();
  const navItems = portalNavMap[portal];

  return (
    <aside
      className={`flex flex-col bg-card border-r border-border sidebar-transition flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-0 py-4' : 'px-4 py-4 gap-3'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base text-foreground tracking-tight leading-none">JobGate</span>
            <span className={`text-xs font-medium mt-0.5 truncate ${portalColor[portal]}`}>{portalLabel[portal]}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={`nav-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center tabular-nums">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
          aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <span className="flex items-center gap-2 text-sm">
              <ChevronLeft size={18} />
              <span>Réduire</span>
            </span>
          )}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('jobgate_auth');
            window.location.href = '/';
          }}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-150 mt-1 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}