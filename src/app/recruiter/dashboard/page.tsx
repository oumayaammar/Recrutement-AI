'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { offresApi } from '@/lib/api/offers';
import { candidaturesApi } from '@/lib/api/applications';
import { candidatsApi } from '@/lib/api/candidates';
import type { OffreRead } from '@/lib/types/offer';
import type { CandidatureRead } from '@/lib/types/application';
import type { CandidatRead } from '@/lib/types/candidate';
import OfferStatusBadge from '@/components/offer/offer-status-badge';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScoreBadge from '@/components/matching/matching-score-badge';
import StatCard from '@/components/dashboard/stat-card';
import { TableSkeleton, ErrorState, EmptyState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { Briefcase, Users, Send, TrendingUp, Plus, Search, Eye, ArrowRight, CheckCircle2,  } from 'lucide-react';

export default function RecruiterDashboardPage() {
  const [offres, setOffres] = useState<OffreRead[]>([]);
  const [candidatures, setCandidatures] = useState<CandidatureRead[]>([]);
  const [candidats, setCandidats] = useState<CandidatRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [offresData, candidaturesData, candidatsData] = await Promise.allSettled([
        offresApi.list({ limit: 200 }),
        candidaturesApi.list({ limit: 200 }),
        candidatsApi.list(0, 200),
      ]);
      if (offresData.status === 'fulfilled') setOffres(offresData.value);
      if (candidaturesData.status === 'fulfilled') setCandidatures(candidaturesData.value);
      if (candidatsData.status === 'fulfilled') setCandidats(candidatsData.value);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const offresActives = offres.filter((o) => o.statut === 'PUBLIEE').length;
  const scoresWithValue = candidatures.filter((c) => c.score_matching !== null && c.score_matching !== undefined);
  const avgScore = scoresWithValue.length > 0
    ? Math.round(scoresWithValue.reduce((sum, c) => sum + (c.score_matching ?? 0), 0) / scoresWithValue.length)
    : null;

  const recentOffres = [...offres].sort((a, b) => new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime()).slice(0, 5);
  const recentCandidatures = [...candidatures].sort((a, b) => new Date(b.date_candidature).getTime() - new Date(a.date_candidature).getTime()).slice(0, 8);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Vue d&apos;ensemble de votre activité de recrutement</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/recruiter/offers/new" className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all">
            <Plus size={15} /> Nouvelle offre
          </Link>
          <Link href="/recruiter/search" className="flex items-center gap-2 bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-muted/80 transition-all">
            <Search size={15} /> Recherche IA
          </Link>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total offres" value={offres.length} icon={<Briefcase size={20} className="text-blue-600" />} iconBg="bg-blue-50" loading={loading} href="/recruiter/offers" />
        <StatCard label="Offres actives" value={offresActives} icon={<CheckCircle2 size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" loading={loading} />
        <StatCard label="Candidatures" value={candidatures.length} icon={<Send size={20} className="text-violet-600" />} iconBg="bg-violet-50" loading={loading} href="/recruiter/applications" />
        <StatCard label="Score moyen" value={avgScore !== null ? `${avgScore}%` : '—'} icon={<TrendingUp size={20} className="text-amber-600" />} iconBg="bg-amber-50" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Offers */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Offres récentes</h2>
            <Link href="/recruiter/offers" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? <TableSkeleton rows={3} /> : recentOffres.length === 0 ? (
            <EmptyState title="Aucune offre" icon={<Briefcase size={28} />} />
          ) : (
            <div className="flex flex-col gap-2">
              {recentOffres.map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{o.titre}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.date_publication)}</p>
                  </div>
                  <OfferStatusBadge statut={o.statut} />
                  <Link href={`/recruiter/offers/${o.id}`} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors">
                    <Eye size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Candidatures récentes</h2>
            <Link href="/recruiter/applications" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? <TableSkeleton rows={3} /> : recentCandidatures.length === 0 ? (
            <EmptyState title="Aucune candidature" icon={<Send size={28} />} />
          ) : (
            <div className="flex flex-col gap-2">
              {recentCandidatures.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Users size={13} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Candidat #{c.candidat_id}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(c.date_candidature)}</p>
                  </div>
                  <MatchingScoreBadge score={c.score_matching} />
                  <ApplicationStatusBadge statut={c.statut} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Créer une offre', href: '/recruiter/offers/new', icon: <Plus size={18} />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'Recherche sémantique', href: '/recruiter/search', icon: <Search size={18} />, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
            { label: 'Voir les candidatures', href: '/recruiter/applications', icon: <Send size={18} />, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 p-4 rounded-xl font-medium text-sm transition-all ${action.color}`}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
