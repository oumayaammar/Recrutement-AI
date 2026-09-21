// 'use client';
// import React, { useState, useCallback, useRef } from 'react';
// import Link from 'next/link';
// import { searchApi } from '@/lib/api/search';
// import type { ResultatRecherche } from '@/lib/types/matching';
// import MatchingScore from '@/components/matching/matching-score';
// import { ErrorState, EmptyState } from '@/components/ui/states';
// import { Search, Sparkles, Users, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Briefcase, GraduationCap,  } from 'lucide-react';

// const PAGE_SIZE = 10;
// type SortOrder = 'desc' | 'asc';

// const EXAMPLE_QUERIES = [
//   'Développeur Python avec FastAPI et PostgreSQL',
//   'Data Scientist avec expérience en NLP',
//   'DevOps avec Kubernetes et AWS',
//   'Frontend React avec TypeScript',
// ];

// export default function RecruiterSearchPage() {
//   const [query, setQuery] = useState('');
//   const [limite, setLimite] = useState(20);
//   const [results, setResults] = useState<ResultatRecherche[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
//   const [page, setPage] = useState(1);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   const handleSearch = useCallback(async () => {
//     if (!query.trim()) return;
//     setIsSearching(true);
//     setError(null);
//     setHasSearched(true);
//     setPage(1);
//     try {
//       const data = await searchApi.searchCandidats(query.trim(), limite);
//       setResults(data);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Erreur lors de la recherche.');
//       setResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   }, [query, limite]);

//   const sorted = [...results].sort((a, b) =>
//     sortOrder === 'desc'
//       ? b.score_pertinence - a.score_pertinence
//       : a.score_pertinence - b.score_pertinence
//   );

//   const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
//   const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="flex flex-col gap-8">
//       {/* Header */}
//       <div>
//         <div className="flex items-center gap-2 mb-1">
//           <Sparkles size={20} className="text-violet-600" />
//           <h1 className="text-2xl font-bold text-foreground">Recherche sémantique</h1>
//         </div>
//         <p className="text-muted-foreground text-sm">
//           Décrivez le profil recherché en langage naturel. Le backend calcule la similarité vectorielle — aucun score n&apos;est calculé côté frontend.
//         </p>
//       </div>

//       {/* Search box */}
//       <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
//         <textarea
//           ref={inputRef}
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
//           placeholder="Ex: Développeur Python avec expérience FastAPI et PostgreSQL"
//           rows={3}
//           className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
//         />

//         {/* Example chips */}
//         <div className="flex flex-wrap gap-2">
//           {EXAMPLE_QUERIES.map((q) => (
//             <button
//               key={q}
//               onClick={() => { setQuery(q); inputRef.current?.focus(); }}
//               className="text-xs bg-muted text-muted-foreground hover:bg-violet-50 hover:text-violet-700 px-3 py-1.5 rounded-full border border-border hover:border-violet-200 transition-all"
//             >
//               {q}
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="flex items-center gap-2">
//             <label className="text-xs font-medium text-muted-foreground">Résultats max :</label>
//             <select
//               value={limite}
//               onChange={(e) => setLimite(Number(e.target.value))}
//               className="px-2 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
//             >
//               {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
//             </select>
//           </div>
//           <button
//             onClick={handleSearch}
//             disabled={isSearching || !query.trim()}
//             className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
//           >
//             {isSearching ? <><RefreshCw size={15} className="animate-spin" /> Recherche…</> : <><Search size={15} /> Rechercher</>}
//           </button>
//         </div>
//       </div>

//       {/* Results */}
//       {error && <ErrorState message={error} onRetry={handleSearch} />}

//       {hasSearched && !isSearching && !error && results.length === 0 && (
//         <EmptyState title="Aucun résultat" description="Essayez une requête différente ou élargissez les critères." icon={<Users size={40} />} />
//       )}

//       {hasSearched && !isSearching && results.length > 0 && (
//         <div className="flex flex-col gap-4">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <p className="text-sm text-muted-foreground">{results.length} candidat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}</p>
//             <button
//               onClick={() => setSortOrder((s) => s === 'desc' ? 'asc' : 'desc')}
//               className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
//             >
//               <ArrowUpDown size={14} />
//               Score {sortOrder === 'desc' ? '↓' : '↑'}
//             </button>
//           </div>

//           <div className="flex flex-col gap-3">
//             {paginated.map((result, idx) => {
//               const rank = (page - 1) * PAGE_SIZE + idx + 1;
//               const { cv, score_pertinence } = result;
//               const pct = Math.round(score_pertinence * 100);
//               return (
//                 <div key={cv.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30">
//                   <div className="flex items-start gap-4">
//                     <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
//                       <span className="text-sm font-bold text-primary">#{rank}</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
//                         <div className="flex-1">
//                           <h3 className="text-base font-semibold text-foreground">Candidat #{cv.candidat_id}</h3>
//                           <div className="flex flex-wrap gap-2 mt-2">
//                             {cv.competences?.slice(0, 5).map((c) => (
//                               <span key={c.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{c.nom}</span>
//                             ))}
//                             {(cv.competences?.length ?? 0) > 5 && (
//                               <span className="text-xs text-muted-foreground">+{cv.competences.length - 5}</span>
//                             )}
//                           </div>
//                           {cv.experiences?.length > 0 && (
//                             <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
//                               <Briefcase size={11} /> {cv.experiences[0].poste} — {cv.experiences[0].entreprise}
//                             </p>
//                           )}
//                           {cv.formations?.length > 0 && (
//                             <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
//                               <GraduationCap size={11} /> {cv.formations[0].diplome} — {cv.formations[0].etablissement}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex flex-col items-end gap-2 flex-shrink-0">
//                           <MatchingScore score={pct} size="sm" />
//                           <Link
//                             href={`/recruiter/candidates/${cv.candidat_id}`}
//                             className="text-xs font-semibold text-primary hover:underline"
//                           >
//                             Voir le profil →
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex items-center justify-center gap-3">
//               <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
//                 <ChevronLeft size={16} />
//               </button>
//               <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
//               <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

'use client';
import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { searchApi } from '@/lib/api/search';
import type { ResultatRecherche } from '@/lib/types/matching';
import MatchingScore from '@/components/matching/matching-score';
import { ErrorState, EmptyState } from '@/components/ui/states';
import { Search, Sparkles, Users, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Briefcase, GraduationCap,  } from 'lucide-react';

const PAGE_SIZE = 10;
const SEUIL_MINIMUM = 20; // candidats sous ce score (%) ne sont pas affiches
type SortOrder = 'desc' | 'asc';

const EXAMPLE_QUERIES = [
  'Développeur Python avec FastAPI et PostgreSQL',
  'Data Scientist avec expérience en NLP',
  'DevOps avec Kubernetes et AWS',
  'Frontend React avec TypeScript',
];

export default function RecruiterSearchPage() {
  const [query, setQuery] = useState('');
  const [limite, setLimite] = useState(20);
  const [results, setResults] = useState<ResultatRecherche[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setPage(1);
    try {
      const data = await searchApi.searchCandidats(query.trim(), limite);
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, limite]);

  // Score deja sur une echelle 0-100 cote backend: on filtre les scores
  // trop faibles avant tri/pagination pour garder les compteurs coherents.
  const filtered = results.filter((r) => r.score_pertinence >= SEUIL_MINIMUM);

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === 'desc'
      ? b.score_pertinence - a.score_pertinence
      : a.score_pertinence - b.score_pertinence
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-violet-600" />
          <h1 className="text-2xl font-bold text-foreground">Recherche sémantique</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Décrivez le profil recherché en langage naturel. Le backend calcule la similarité vectorielle — aucun score n&apos;est calculé côté frontend.
        </p>
      </div>

      {/* Search box */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder="Ex: Développeur Python avec expérience FastAPI et PostgreSQL"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); inputRef.current?.focus(); }}
              className="text-xs bg-muted text-muted-foreground hover:bg-violet-50 hover:text-violet-700 px-3 py-1.5 rounded-full border border-border hover:border-violet-200 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Résultats max :</label>
            <select
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
          >
            {isSearching ? <><RefreshCw size={15} className="animate-spin" /> Recherche…</> : <><Search size={15} /> Rechercher</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && <ErrorState message={error} onRetry={handleSearch} />}

      {hasSearched && !isSearching && !error && filtered.length === 0 && (
        <EmptyState title="Aucun résultat" description="Essayez une requête différente ou élargissez les critères." icon={<Users size={40} />} />
      )}

      {hasSearched && !isSearching && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{filtered.length} candidat{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
            <button
              onClick={() => setSortOrder((s) => s === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown size={14} />
              Score {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {paginated.map((result, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const { cv, score_pertinence } = result;
              const pct = Math.round(score_pertinence);
              return (
                <div key={cv.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">#{rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-foreground">Candidat #{cv.candidat_id}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {cv.competences?.slice(0, 5).map((c) => (
                              <span key={c.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{c.nom}</span>
                            ))}
                            {(cv.competences?.length ?? 0) > 5 && (
                              <span className="text-xs text-muted-foreground">+{cv.competences.length - 5}</span>
                            )}
                          </div>
                          {cv.experiences?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Briefcase size={11} /> {cv.experiences[0].poste} — {cv.experiences[0].entreprise}
                            </p>
                          )}
                          {cv.formations?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <GraduationCap size={11} /> {cv.formations[0].diplome} — {cv.formations[0].etablissement}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <MatchingScore score={pct} size="sm" />
                          <Link
                            href={`/recruiter/candidates/${cv.candidat_id}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Voir le profil →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
