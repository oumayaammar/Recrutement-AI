'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { candidatsApi } from '@/lib/api/candidates';
import { cvsApi } from '@/lib/api/cvs';
import { candidaturesApi } from '@/lib/api/applications';
import type { CandidatRead } from '@/lib/types/candidate';
import type { CVRead } from '@/lib/types/cv';
import type { CandidatureRead } from '@/lib/types/application';
import ApplicationStatusBadge from '@/components/application/application-status-badge';
import MatchingScoreBadge from '@/components/matching/matching-score-badge';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, FileText } from 'lucide-react';

export default function RecruiterCandidateDetailPage() {
  const params = useParams();
  const candidatId = Number(params.id);
  const [candidat, setCandidat] = useState<CandidatRead | null>(null);
  const [cvs, setCvs] = useState<CVRead[]>([]);
  const [candidatures, setCandidatures] = useState<CandidatureRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [candidatData, cvsData, candidaturesData] = await Promise.allSettled([
        candidatsApi.get(candidatId),
        cvsApi.getByCandidatId(candidatId),
        candidaturesApi.list({ candidat_id: candidatId, limit: 50 }),
      ]);
      if (candidatData.status === 'fulfilled') setCandidat(candidatData.value);
      else throw candidatData.reason;
      if (cvsData.status === 'fulfilled') setCvs(cvsData.value);
      if (candidaturesData.status === 'fulfilled') setCandidatures(candidaturesData.value);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [candidatId]);

  useEffect(() => { if (!isNaN(candidatId)) load(); }, [candidatId, load]);

  if (loading) return <CardSkeleton className="max-w-2xl" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!candidat) return null;

  const latestCV = cvs.length > 0 ? cvs[cvs.length - 1] : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/recruiter/candidates" className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{candidat.prenom} {candidat.nom}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Profil candidat</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">{candidat.prenom.charAt(0)}{candidat.nom.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{candidat.prenom} {candidat.nom}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${candidat.disponibilite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}>
              {candidat.disponibilite ? '✓ Disponible' : 'Indisponible'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-muted-foreground" /> {candidat.email}</div>
          {candidat.telephone && <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-muted-foreground" /> {candidat.telephone}</div>}
          {candidat.date_creation && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar size={14} /> Membre depuis {formatDate(candidat.date_creation)}</div>}
        </div>
      </div>

      {/* Latest CV */}
      {latestCV && (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText size={16} /> CV</h2>
          {latestCV.competences?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Compétences</p>
              <div className="flex flex-wrap gap-1.5">
                {latestCV.competences.map((c) => (
                  <span key={c.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{c.nom}</span>
                ))}
              </div>
            </div>
          )}
          {latestCV.experiences?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Expériences</p>
              <div className="flex flex-col gap-1.5">
                {latestCV.experiences.map((e) => (
                  <div key={e.id} className="text-sm text-foreground">{e.poste} — <span className="text-muted-foreground">{e.entreprise}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applications */}
      {candidatures.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Briefcase size={16} /> Candidatures ({candidatures.length})</h2>
          {candidatures.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">Offre #{c.offre_id}</p>
                <p className="text-xs text-muted-foreground">{formatDate(c.date_candidature)}</p>
              </div>
              <MatchingScoreBadge score={c.score_matching} />
              <ApplicationStatusBadge statut={c.statut} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
