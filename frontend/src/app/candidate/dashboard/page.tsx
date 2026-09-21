'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { candidaturesApi } from '@/lib/api/applications';
import { cvsApi } from '@/lib/api/cvs';
import { offresApi } from '@/lib/api/offers';
import { notificationsApi } from '@/lib/api/notifications';
import type {
  CandidatureRead,
  StatutCandidature,
} from '@/lib/types/application';
import type { CVRead } from '@/lib/types/cv';
import type { OffreRead } from '@/lib/types/offer';
import type { NotificationRead } from '@/lib/types/api';
import {
  Briefcase,
  FileText,
  Send,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Upload,
  TrendingUp,
  Star,
  Eye,
  Zap,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statutLabel(s: StatutCandidature): string {
  const map: Record<StatutCandidature, string> = {
    SUGGEREE: 'Suggérée',
    RECUE: 'Reçue',
    PRESELECTIONNEE: 'Présélectionnée',
    ENTRETIEN: 'Entretien',
    ACCEPTEE: 'Acceptée',
    REFUSEE: 'Refusée',
  };
  return map[s] ?? s;
}

function statutColor(s: StatutCandidature): string {
  const map: Record<StatutCandidature, string> = {
    SUGGEREE: 'bg-slate-100 text-slate-600 border-slate-200',
    RECUE: 'bg-blue-50 text-blue-700 border-blue-200',
    PRESELECTIONNEE: 'bg-violet-50 text-violet-700 border-violet-200',
    ENTRETIEN: 'bg-amber-50 text-amber-700 border-amber-200',
    ACCEPTEE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REFUSEE: 'bg-red-50 text-red-600 border-red-200',
  };
  return map[s] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

function getScoreTier(score: number) {
  if (score >= 80) return { label: 'Excellent', bar: 'bg-emerald-500', text: 'text-emerald-600' };
  if (score >= 60) return { label: 'Bon', bar: 'bg-blue-500', text: 'text-blue-600' };
  if (score >= 30) return { label: 'Moyen', bar: 'bg-amber-500', text: 'text-amber-600' };
  return { label: 'Faible', bar: 'bg-red-400', text: 'text-red-500' };
}

function getCVPipelineStep(cv: CVRead): number {
  // Step 0: uploaded, 1: text extracted, 2: info extracted, 3: ready (embedding assumed if info extracted)
  if (cv.competences?.length > 0 || cv.experiences?.length > 0 || cv.formations?.length > 0) return 3;
  if (cv.texte_brut) return 1;
  return 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, iconBg, href, loading }: StatCardProps) {
  const inner = (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-muted rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        )}
      </div>
      {href && <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

interface CVPipelineCardProps {
  cv: CVRead;
}

function CVPipelineCard({ cv }: CVPipelineCardProps) {
  const step = getCVPipelineStep(cv);
  const steps = [
    { label: 'CV déposé', done: step >= 0 },
    { label: 'Texte extrait', done: step >= 1 },
    { label: 'Infos extraites', done: step >= 2 },
    { label: 'Prêt', done: step >= 3 },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-primary" />
          <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
            {cv.fichier_url.split('/').pop() ?? `CV #${cv.id}`}
          </span>
        </div>
        <Link
          href={`/candidate/cv/${cv.id}`}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Eye size={12} />
          Voir
        </Link>
      </div>
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  s.done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {s.done ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className={`text-[10px] text-center leading-tight ${s.done ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 rounded-full ${s.done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">Déposé le {formatDate(cv.date_depot)}</p>
    </div>
  );
}

interface ApplicationRowProps {
  candidature: CandidatureRead;
  offre: OffreRead | null;
}

function ApplicationRow({ candidature, offre }: ApplicationRowProps) {
  const score = candidature.score_matching;
  const tier = score != null ? getScoreTier(score) : null;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Briefcase size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {offre?.titre ?? `Offre #${candidature.offre_id}`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(candidature.date_candidature)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {score != null && tier && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${tier.bar}`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${tier.text}`}>{Math.round(score)}%</span>
          </div>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statutColor(candidature.statut)}`}>
          {statutLabel(candidature.statut)}
        </span>
      </div>
    </div>
  );
}

// ─── Progress tracker ─────────────────────────────────────────────────────────

interface ProgressTrackerProps {
  candidatures: CandidatureRead[];
}

function ProgressTracker({ candidatures }: ProgressTrackerProps) {
  const stages: StatutCandidature[] = ['RECUE', 'PRESELECTIONNEE', 'ENTRETIEN', 'ACCEPTEE'];
  const counts: Record<string, number> = {};
  for (const c of candidatures) {
    counts[c.statut] = (counts[c.statut] ?? 0) + 1;
  }
  const total = candidatures.length;

  const stageConfig: { statut: StatutCandidature; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { statut: 'RECUE', label: 'Reçues', icon: <Send size={14} />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { statut: 'PRESELECTIONNEE', label: 'Présélectionnées', icon: <Star size={14} />, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    { statut: 'ENTRETIEN', label: 'Entretiens', icon: <Clock size={14} />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { statut: 'ACCEPTEE', label: 'Acceptées', icon: <CheckCircle2 size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          Progression des candidatures
        </h2>
        <span className="text-xs text-muted-foreground">{total} au total</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stageConfig.map((s) => (
          <div key={s.statut} className={`rounded-lg border p-3 ${s.bg}`}>
            <div className={`flex items-center gap-1.5 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{counts[s.statut] ?? 0}</p>
            {total > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.round(((counts[s.statut] ?? 0) / total) * 100)}%
              </p>
            )}
          </div>
        ))}
      </div>
      {/* Refused */}
      {(counts['REFUSEE'] ?? 0) > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          {counts['REFUSEE']} candidature{counts['REFUSEE'] > 1 ? 's' : ''} refusée{counts['REFUSEE'] > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────

interface RecommendationsProps {
  cvs: CVRead[];
  candidatures: CandidatureRead[];
  offers: OffreRead[];
}

function Recommendations({ cvs, candidatures, offers }: RecommendationsProps) {
  const appliedOfferIds = new Set(candidatures.map((c) => c.offre_id));
  const unapplied = offers.filter((o) => !appliedOfferIds.has(o.id) && o.statut === 'PUBLIEE');
  const hasCV = cvs.length > 0;
  const cvReady = cvs.some(
    (cv) => cv.competences?.length > 0 || cv.experiences?.length > 0 || cv.formations?.length > 0
  );

  const tips: { icon: React.ReactNode; text: string; href: string; cta: string; color: string }[] = [];

  if (!hasCV) {
    tips.push({
      icon: <Upload size={15} />,
      text: 'Déposez votre premier CV pour commencer à postuler.',
      href: '/candidate/cv/upload',
      cta: 'Déposer un CV',
      color: 'border-blue-200 bg-blue-50',
    });
  } else if (!cvReady) {
    tips.push({
      icon: <Zap size={15} />,
      text: 'Votre CV est déposé mais pas encore traité par l\'IA. Lancez l\'extraction.',
      href: `/candidate/cv/${cvs[0].id}`,
      cta: 'Traiter le CV',
      color: 'border-amber-200 bg-amber-50',
    });
  }

  if (unapplied.length > 0) {
    tips.push({
      icon: <Briefcase size={15} />,
      text: `${unapplied.length} offre${unapplied.length > 1 ? 's' : ''} publiée${unapplied.length > 1 ? 's' : ''} disponible${unapplied.length > 1 ? 's' : ''} — vous n'avez pas encore postulé.`,
      href: '/job-offers-candidat',
      cta: 'Voir les offres',
      color: 'border-violet-200 bg-violet-50',
    });
  }

  if (tips.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <Star size={16} className="text-primary" />
          Recommandations
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Votre profil est à jour. Continuez à postuler !
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
        <Star size={16} className="text-primary" />
        Recommandations
      </h2>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${tip.color}`}>
            <span className="mt-0.5 flex-shrink-0 text-foreground">{tip.icon}</span>
            <p className="text-sm text-foreground flex-1">{tip.text}</p>
            <Link
              href={tip.href}
              className="text-xs font-medium text-primary hover:underline flex-shrink-0"
            >
              {tip.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const [candidatures, setCandidatures] = useState<CandidatureRead[]>([]);
  const [cvs, setCvs] = useState<CVRead[]>([]);
  const [offresMap, setOffresMap] = useState<Record<number, OffreRead>>({});
  const [allOffers, setAllOffers] = useState<OffreRead[]>([]);
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('jobgate_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? parsed.userId ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  const loadData = useCallback(async (id: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [cands, cvList, offers, notifs] = await Promise.allSettled([
        candidaturesApi.list({ candidat_id: id, limit: 100 }),
        cvsApi.getByCandidatId(id),
        offresApi.list({ limit: 100, statut: 'PUBLIEE' }),
        notificationsApi.getByUser(id),
      ]);

      const candidatureData = cands.status === 'fulfilled' ? cands.value : [];
      const cvData = cvList.status === 'fulfilled' ? cvList.value : [];
      const offersData = offers.status === 'fulfilled' ? offers.value : [];
      const notifsData = notifs.status === 'fulfilled' ? notifs.value : [];

      setCandidatures(candidatureData);
      setCvs(cvData);
      setAllOffers(offersData);
      setNotifications(notifsData);

      // Enrich candidatures with offer details
      const uniqueOfferIds = [...new Set(candidatureData.map((c) => c.offre_id))];
      const offerDetails = await Promise.allSettled(
        uniqueOfferIds.map((oid) => offresApi.get(oid))
      );
      const map: Record<number, OffreRead> = {};
      offerDetails.forEach((r, i) => {
        if (r.status === 'fulfilled') map[uniqueOfferIds[i]] = r.value;
      });
      setOffresMap(map);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (candidatId !== null) loadData(candidatId);
  }, [candidatId, loadData]);

  const unreadNotifs = notifications.filter((n) => !n.lue).length;
  const activeApplications = candidatures.filter(
    (c) => c.statut !== 'REFUSEE' && c.statut !== 'ACCEPTEE'
  ).length;
  const avgScore =
    candidatures.filter((c) => c.score_matching != null).length > 0
      ? candidatures
          .filter((c) => c.score_matching != null)
          .reduce((sum, c) => sum + (c.score_matching ?? 0), 0) /
        candidatures.filter((c) => c.score_matching != null).length
      : null;

  const recentCandidatures = [...candidatures]
    .sort((a, b) => new Date(b.date_candidature).getTime() - new Date(a.date_candidature).getTime())
    .slice(0, 5);

  const latestCV = cvs.length > 0
    ? [...cvs].sort((a, b) => new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime())[0]
    : null;

  return (
    // <AppLayout portal="candidat">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Suivez vos candidatures et votre profil</p>
          </div>
          <button
            onClick={() => candidatId && loadData(candidatId, true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Candidatures"
            value={loading ? '—' : candidatures.length}
            icon={<Send size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            href="/job-offers-candidat"
            loading={loading}
          />
          <StatCard
            label="En cours"
            value={loading ? '—' : activeApplications}
            icon={<Clock size={18} className="text-amber-600" />}
            iconBg="bg-amber-50"
            loading={loading}
          />
          <StatCard
            label="Mes CVs"
            value={loading ? '—' : cvs.length}
            icon={<FileText size={18} className="text-violet-600" />}
            iconBg="bg-violet-50"
            href="/candidate/cv"
            loading={loading}
          />
          <StatCard
            label="Score moyen"
            value={loading ? '—' : avgScore != null ? `${Math.round(avgScore)}%` : '—'}
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            loading={loading}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col — applications + progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress tracker */}
            {loading ? (
              <div className="bg-card border border-border rounded-xl p-5 animate-pulse h-36" />
            ) : (
              <ProgressTracker candidatures={candidatures} />
            )}

            {/* Recent applications */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Send size={16} className="text-primary" />
                  Candidatures récentes
                </h2>
                <Link
                  href="/job-offers-candidat"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Voir tout <ChevronRight size={12} />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentCandidatures.length === 0 ? (
                <div className="text-center py-8">
                  <Send size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">Aucune candidature pour l'instant</p>
                  <Link
                    href="/job-offers-candidat"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Briefcase size={14} />
                    Parcourir les offres
                  </Link>
                </div>
              ) : (
                <div>
                  {recentCandidatures.map((c) => (
                    <ApplicationRow
                      key={c.id}
                      candidature={c}
                      offre={offresMap[c.offre_id] ?? null}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right col — CV pipeline + recommendations + notifications */}
          <div className="space-y-6">
            {/* CV Pipeline */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Pipeline CV
                </h2>
                <Link
                  href="/candidate/cv"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Gérer <ChevronRight size={12} />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-24 bg-muted rounded-lg animate-pulse" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="text-center py-6">
                  <FileText size={28} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground mb-3">Aucun CV déposé</p>
                  <Link
                    href="/candidate/cv/upload"
                    className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Upload size={13} />
                    Déposer un CV
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestCV && <CVPipelineCard cv={latestCV} />}
                  {cvs.length > 1 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{cvs.length - 1} autre{cvs.length - 1 > 1 ? 's' : ''} CV
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations */}
            {!loading && (
              <Recommendations
                cvs={cvs}
                candidatures={candidatures}
                offers={allOffers}
              />
            )}

            {/* Notifications */}
            {!loading && notifications.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    Notifications
                    {unreadNotifs > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </h2>
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-2 rounded-lg p-2.5 text-sm ${
                        n.lue ? 'text-muted-foreground' : 'bg-primary/5 text-foreground font-medium'
                      }`}
                    >
                      <Bell size={13} className={`mt-0.5 flex-shrink-0 ${n.lue ? 'text-muted-foreground' : 'text-primary'}`} />
                      <span className="flex-1 leading-snug">{n.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    // </AppLayout>
  );
}
