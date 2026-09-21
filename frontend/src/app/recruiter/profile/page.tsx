'use client';
import React, { useEffect, useState } from 'react';
import { recruteursApi } from '@/lib/api/recruiters';
import type { RecruteurRead } from '@/lib/types/recruiter';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { formatDate } from '@/lib/utils/format';
import { User, Mail, Briefcase, Building2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState<RecruteurRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ poste: '', departement: '' });
  const [saving, setSaving] = useState(false);
  const [recruteurId, setRecruteurId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('jobgate_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        setRecruteurId(parsed.id ?? parsed.userId ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!recruteurId) return;
    setLoading(true);
    recruteursApi.get(recruteurId)
      .then((data) => {
        setProfile(data);
        setForm({ poste: data.poste ?? '', departement: data.departement ?? '' });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [recruteurId]);

  const handleSave = async () => {
    if (!recruteurId) return;
    setSaving(true);
    try {
      const updated = await recruteursApi.update(recruteurId, {
        poste: form.poste || undefined,
        departement: form.departement || undefined,
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
        <p className="text-muted-foreground text-sm mt-0.5">Gérez vos informations recruteur</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
            <User size={28} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{profile.prenom} {profile.nom}</p>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm"><Mail size={15} className="text-muted-foreground" /> {profile.email}</div>
          {profile.poste && <div className="flex items-center gap-3 text-sm"><Briefcase size={15} className="text-muted-foreground" /> {profile.poste}</div>}
          {profile.departement && <div className="flex items-center gap-3 text-sm"><Building2 size={15} className="text-muted-foreground" /> {profile.departement}</div>}
          {profile.date_creation && <div className="flex items-center gap-3 text-sm text-muted-foreground"><Calendar size={15} /> Membre depuis {formatDate(profile.date_creation)}</div>}
        </div>

        {editing ? (
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Poste / Titre</label>
              <input type="text" value={form.poste} onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))} placeholder="ex. Responsable RH" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Département / Entreprise</label>
              <input type="text" value={form.departement} onChange={(e) => setForm((f) => ({ ...f, departement: e.target.value }))} placeholder="ex. TechCorp — RH" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={() => setEditing(false)} className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-lg hover:bg-muted/80 transition-all">Annuler</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full bg-muted text-foreground font-semibold py-2.5 rounded-lg hover:bg-muted/80 transition-all text-sm">Modifier le profil</button>
        )}
      </div>
    </div>
  );
}
