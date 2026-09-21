'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { candidatsApi } from '@/lib/api/candidates';
import { recruteursApi } from '@/lib/api/recruiters';
import { administrateursApi } from '@/lib/api/admin';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import StatCard from '@/components/dashboard/stat-card';
import { Users, Briefcase, Shield, Send, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ candidats: 0, recruteurs: 0, admins: 0, offres: 0, candidatures: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [candidats, recruteurs, admins, offres, candidatures] = await Promise.allSettled([
          candidatsApi?.list(0, 1000),
          recruteursApi?.list(0, 1000),
          administrateursApi?.list(0, 1000),
          offresApi?.list({ limit: 1000 }),
          candidaturesApi?.list({ limit: 1000 }),
        ]);
        setStats({
          candidats: candidats?.status === 'fulfilled' ? candidats?.value?.length : 0,
          recruteurs: recruteurs?.status === 'fulfilled' ? recruteurs?.value?.length : 0,
          admins: admins?.status === 'fulfilled' ? admins?.value?.length : 0,
          offres: offres?.status === 'fulfilled' ? offres?.value?.length : 0,
          candidatures: candidatures?.status === 'fulfilled' ? candidatures?.value?.length : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Vue d&apos;ensemble de la plateforme JobGate</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Candidats" value={stats?.candidats} icon={<Users size={20} className="text-blue-600" />} iconBg="bg-blue-50" loading={loading} href="/admin/candidates" />
        <StatCard label="Recruteurs" value={stats?.recruteurs} icon={<Briefcase size={20} className="text-violet-600" />} iconBg="bg-violet-50" loading={loading} href="/admin/recruiters" />
        <StatCard label="Administrateurs" value={stats?.admins} icon={<Shield size={20} className="text-slate-600" />} iconBg="bg-slate-50" loading={loading} />
        <StatCard label="Offres" value={stats?.offres} icon={<Briefcase size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" loading={loading} href="/admin/offers" />
        <StatCard label="Candidatures" value={stats?.candidatures} icon={<Send size={20} className="text-orange-600" />} iconBg="bg-orange-50" loading={loading} href="/admin/applications" />
      </div>

      {/* Quick links */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Navigation rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Gérer les candidats', href: '/admin/candidates', icon: <Users size={16} />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'Gérer les recruteurs', href: '/admin/recruiters', icon: <Briefcase size={16} />, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
            { label: 'Gérer les offres', href: '/admin/offers', icon: <LayoutDashboard size={16} />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { label: 'Toutes les candidatures', href: '/admin/applications', icon: <Send size={16} />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            { label: 'Gestion utilisateurs', href: '/admin/users', icon: <Shield size={16} />, color: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
          ]?.map((item) => (
            <Link key={item?.label} href={item?.href} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${item?.color}`}>
              {item?.icon} {item?.label} <ArrowRight size={12} className="ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
