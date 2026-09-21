'use client';
import React, { useEffect, useState } from 'react';
import { candidatsApi } from '@/lib/api/candidates';
import type { CandidatRead } from '@/lib/types/candidate';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { User, Mail, Phone, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidatRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ telephone: '', disponibilite: true });
  const [saving, setSaving] = useState(false);
  const [candidatId, setCandidatId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!candidatId) return;
    setLoading(true);
    candidatsApi.get(candidatId)
      .then((data) => {
        setProfile(data);
        setForm({ telephone: data.telephone ?? '', disponibilite: data.disponibilite });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [candidatId]);

  const handleSave = async () => {
    if (!candidatId) return;
    setSaving(true);
    try {
      const updated = await candidatsApi.update(candidatId, {
        telephone: form.telephone || undefined,
        disponibilite: form.disponibilite,
      });
      setProfile(updated);
      setEditing(false);
      toast.success('Profil mis à jour !');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton className="max-w-lg" />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gérez vos informations personnelles</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{profile.prenom} {profile.nom}</p>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
          </div>
        </div>

        {/* Info fields */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={15} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{profile.email}</span>
          </div>
          {profile.date_creation && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={15} className="text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Membre depuis {formatDate(profile.date_creation)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            {profile.disponibilite ? (
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle size={15} className="text-red-500 flex-shrink-0" />
            )}
            <span className={profile.disponibilite ? 'text-emerald-700' : 'text-red-600'}>
              {profile.disponibilite ? 'Disponible immédiatement' : 'Non disponible'}
            </span>
          </div>
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone size={12} /> Téléphone
              </label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="disponibilite"
                type="checkbox"
                checked={form.disponibilite}
                onChange={(e) => setForm((f) => ({ ...f, disponibilite: e.target.checked }))}
                className="w-4 h-4 rounded border-input accent-primary"
              />
              <label htmlFor="disponibilite" className="text-sm font-medium text-foreground">Disponible immédiatement</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-lg hover:bg-muted/80 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-muted text-foreground font-semibold py-2.5 rounded-lg hover:bg-muted/80 transition-all text-sm"
          >
            Modifier le profil
          </button>
        )}
      </div>
    </div>
  );
}
