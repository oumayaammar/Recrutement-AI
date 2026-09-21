'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { cvsApi } from '@/lib/api/cvs';
import {
  Upload, FileText, CheckCircle, Loader2, AlertCircle, X, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

type PipelineStep = 'idle' | 'uploading' | 'uploaded' | 'extracting' | 'extracted' | 'embedding' | 'ready' | 'error';

interface StepInfo {
  label: string;
  description: string;
}

const STEPS: StepInfo[] = [
  { label: 'CV déposé', description: 'Fichier reçu par le serveur' },
  { label: 'Extraction du texte', description: 'Lecture du contenu PDF/DOCX' },
  { label: 'Extraction IA', description: 'Analyse des compétences, expériences, formations' },
  { label: 'Génération embedding', description: 'Vectorisation pour la recherche sémantique' },
  { label: 'CV prêt', description: 'Traitement terminé' },
];

const stepOrder: PipelineStep[] = ['uploading', 'uploaded', 'extracting', 'extracted', 'embedding', 'ready'];

function getCompletedStepIndex(step: PipelineStep): number {
  const map: Record<PipelineStep, number> = {
    idle: -1, uploading: 0, uploaded: 0, extracting: 1, extracted: 2, embedding: 3, ready: 4, error: -1,
  };
  return map[step];
}

export default function CVUploadPage() {
  const router = useRouter();
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineStep>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cvId, setCvId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem('jobgate_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setCandidatId(parsed.id ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx'].includes(ext)) return 'Format non supporté. Utilisez PDF ou DOCX.';
    if (f.size > 10 * 1024 * 1024) return 'Fichier trop volumineux (max 10 Mo).';
    if (f.size === 0) return 'Le fichier est vide.';
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); setFile(null); return; }
    setFile(f);
    setErrorMsg(null);
    setPipeline('idle');
    setCvId(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const runPipeline = async () => {
    if (!file || candidatId === null) {
      setErrorMsg('Impossible de démarrer : candidat non identifié.');
      return;
    }
    setErrorMsg(null);

    try {
      // Step 1: Upload
      setPipeline('uploading');
      const cv = await cvsApi.upload(file, candidatId);
      setCvId(cv.id);
      setPipeline('uploaded');

      // Step 2: Text extraction
      setPipeline('extracting');
      await cvsApi.extract(cv.id);
      setPipeline('extracted');

      // Step 3: Embedding
      setPipeline('embedding');
      await cvsApi.generateEmbedding(cv.id);
      setPipeline('ready');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Une erreur est survenue');
      setPipeline('error');
    }
  };

  const completedIndex = getCompletedStepIndex(pipeline);
  const isRunning = ['uploading', 'extracting', 'embedding'].includes(pipeline);

  return (
    // <AppLayout portal="candidat">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/candidate/cv" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Déposer un CV</h1>
            <p className="text-muted-foreground text-sm mt-0.5">PDF ou DOCX · max 10 Mo</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer mb-4 ${
            dragOver
              ? 'border-primary bg-primary/5'
              : file
              ? 'border-green-400 bg-green-50 cursor-default' :'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleInputChange}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} Ko</p>
              {pipeline === 'idle' && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPipeline('idle'); }}
                  className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={12} /> Changer de fichier
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Glissez votre CV ici</p>
                <p className="text-sm text-muted-foreground mt-1">ou <span className="text-primary underline">parcourir les fichiers</span></p>
              </div>
              <p className="text-xs text-muted-foreground">PDF, DOCX · max 10 Mo</p>
            </div>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload button */}
        {file && pipeline === 'idle' && (
          <button
            onClick={runPipeline}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <Upload size={16} />
            Lancer le traitement
          </button>
        )}

        {/* Pipeline steps */}
        {pipeline !== 'idle' && (
          <div className="bg-card border border-border rounded-xl p-5 mt-2">
            <h2 className="text-sm font-semibold text-foreground mb-4">Pipeline de traitement</h2>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const isDone = i <= completedIndex;
                const isActive =
                  (i === 0 && pipeline === 'uploading') ||
                  (i === 1 && pipeline === 'extracting') ||
                  (i === 2 && pipeline === 'extracted') ||
                  (i === 3 && pipeline === 'embedding') ||
                  false;
                const isCurrentlyRunning =
                  (i === 0 && pipeline === 'uploading') ||
                  (i === 1 && pipeline === 'extracting') ||
                  (i === 3 && pipeline === 'embedding');

                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isDone && !isCurrentlyRunning
                        ? 'bg-green-100 text-green-600'
                        : isCurrentlyRunning
                        ? 'bg-primary/10 text-primary' :'bg-muted text-muted-foreground'
                    }`}>
                      {isCurrentlyRunning ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isDone ? (
                        <CheckCircle size={14} />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {pipeline === 'ready' && cvId !== null && (
              <div className="mt-5 pt-4 border-t border-border flex gap-3">
                <Link
                  href={`/candidate/cv/${cvId}`}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
                >
                  Voir le CV traité
                </Link>
                <Link
                  href="/candidate/cv"
                  className="flex-1 bg-muted text-foreground py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-muted/80 transition-colors"
                >
                  Mes CVs
                </Link>
              </div>
            )}

            {pipeline === 'error' && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => { setPipeline('idle'); setErrorMsg(null); }}
                  className="w-full bg-muted text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    // </AppLayout>
  );
}
