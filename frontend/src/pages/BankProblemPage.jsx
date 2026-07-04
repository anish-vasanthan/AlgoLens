/**
 * BankProblemPage — shows a single curated problem from the bank at /problems/:problemId
 * Has a back button, auto-generates on first visit, persists state across tab switches.
 * All the same approach/compare/analysis features as the custom solve page.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProblemById, getApproaches, analyzeProblem } from '../lib/api'
import { addProgrammingHistory } from '../lib/history'
import ApproachCard from '../components/ApproachCard'
import ComparisonView from '../components/ComparisonView'
import ProblemAnalysis from '../components/ProblemAnalysis'

const LANGUAGES   = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

const DIFF_STYLE = {
  Easy:   { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.18)'  },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)'  },
}

// ── Session helpers (keyed by problemId so each problem has its own state) ────
function sKey(id)       { return `algolens_bank_${id}` }
function loadSess(id)   { try { const r = sessionStorage.getItem(sKey(id)); return r ? JSON.parse(r) : null } catch { return null } }
function saveSess(id,d) { try { sessionStorage.setItem(sKey(id), JSON.stringify(d)) } catch {} }
function clearSess(id)  { try { sessionStorage.removeItem(sKey(id)) } catch {} }

export default function BankProblemPage() {
  const { problemId } = useParams()
  const navigate      = useNavigate()
  const cached        = loadSess(problemId)

  // Problem metadata
  const [problem,  setProblem]  = useState(null)
  const [probErr,  setProbErr]  = useState(null)

  // Solve state — restored from session or default
  const [language,       setLanguage]       = useState(cached?.language       ?? 'Python')
  const [difficulty,     setDifficulty]     = useState(cached?.difficulty     ?? 'Intermediate')
  const [approaches,     setApproaches]     = useState(cached?.approaches     ?? [])
  const [activeApproach, setActiveApproach] = useState(cached?.activeApproach ?? 0)
  const [viewMode,       setViewMode]       = useState(cached?.viewMode       ?? 'individual')
  const [hasGenerated,   setHasGenerated]   = useState(cached?.hasGenerated   ?? false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)

  // Analysis state — persisted in session too
  const [analysis,        setAnalysis]        = useState(cached?.analysis        ?? null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError,   setAnalysisError]   = useState(null)

  // Persist session whenever solve state changes
  useEffect(() => {
    if (!hasGenerated) return
    saveSess(problemId, { language, difficulty, approaches, activeApproach, viewMode, hasGenerated, analysis })
  }, [problemId, language, difficulty, approaches, activeApproach, viewMode, hasGenerated, analysis])

  // Fetch problem metadata
  useEffect(() => {
    getProblemById(problemId)
      .then(setProblem)
      .catch(e => setProbErr(e.message))
  }, [problemId])

  // Auto-generate on first visit (no cached result)
  useEffect(() => {
    if (problem && !cached?.hasGenerated) handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  const handleGenerate = async () => {
    setLoading(true); setError(null); setApproaches([]); setHasGenerated(false)
    clearSess(problemId)

    // Kick off problem analysis in parallel (uses the problem statement)
    if (problem?.statement) {
      setAnalysis(null); setAnalysisLoading(true); setAnalysisError(null)
      analyzeProblem(problem.statement)
        .then(d => setAnalysis(d.analysis || null))
        .catch(e => setAnalysisError(e.response?.data?.error || e.message))
        .finally(() => setAnalysisLoading(false))
    }

    try {
      const result = await getApproaches({ problemId, language, difficulty })
      setApproaches(result.approaches || [])
      setActiveApproach(0)
      setHasGenerated(true)
      addProgrammingHistory({
        title:      problem?.title || problemId,
        statement:  problem?.statement || '',
        language,
        difficulty,
        problemId,
      })
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const diff = DIFF_STYLE[problem?.difficulty]

  // ── Error loading problem ──────────────────────────────────────────────────
  if (probErr) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton onClick={() => navigate('/problems')} />
        <div className="text-center py-20">
          <p className="font-semibold text-white mb-2">Problem not found</p>
          <p className="text-sm mb-5" style={{ color: '#4B5563' }}>{probErr}</p>
          <button onClick={() => navigate('/problems')} className="btn-primary px-5 py-2 text-sm">Back to Problem Bank</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Back + header ── */}
      <div className="mb-6">
        <BackButton onClick={() => navigate('/problems')} />

        {/* Problem title + meta */}
        <div className="mt-4">
          {problem ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                <span className="badge-verified">Curated</span>
                {diff && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
                    {problem.difficulty}
                  </span>
                )}
                {/* Tags */}
                {(problem.tags || []).slice(0, 4).map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              {problem.statement && (
                <p className="text-sm leading-relaxed max-w-3xl" style={{ color: '#6B7280' }}>
                  {problem.statement}
                </p>
              )}
            </>
          ) : (
            /* Loading skeleton for title */
            <div className="space-y-2">
              <div className="h-6 skeleton rounded w-64" />
              <div className="h-3 skeleton rounded w-full max-w-xl" />
              <div className="h-3 skeleton rounded w-4/5 max-w-lg" />
            </div>
          )}
        </div>
      </div>

      {/* ── Config bar ── */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="section-label">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="select">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label">Depth</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="select">
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !problem}
            className="btn-primary flex items-center gap-2"
          >
            {loading
              ? <><Spinner />Generating...</>
              : <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {hasGenerated ? 'Regenerate' : 'Generate'}
                </>
            }
          </button>
          {/* Spacer to push info to the right */}
          <div className="flex-1" />
          {hasGenerated && !loading && (
            <p className="text-[11px]" style={{ color: '#374151' }}>
              {approaches.length} approach{approaches.length !== 1 ? 'es' : ''} · {language} · {difficulty}
            </p>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-sm text-white">Failed to generate approaches</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(239,68,68,0.7)' }}>{error}</p>
            <button onClick={handleGenerate} className="mt-2 text-xs font-semibold underline underline-offset-2" style={{ color: '#EF4444' }}>Try again</button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingSkeleton />}

      {/* ── Problem Analysis — shown when available, persists across tab switches ── */}
      {(analysisLoading || analysis || analysisError) && (
        <ProblemAnalysis
          analysis={analysis}
          loading={analysisLoading}
          error={analysisError}
          onRetry={() => {
            if (!problem?.statement) return
            setAnalysisError(null); setAnalysisLoading(true)
            analyzeProblem(problem.statement)
              .then(d => setAnalysis(d.analysis || null))
              .catch(e => setAnalysisError(e.response?.data?.error || e.message))
              .finally(() => setAnalysisLoading(false))
          }}
        />
      )}

      {/* ── Results ── */}
      {!loading && approaches.length > 0 && (
        <>
          {/* Approach tabs + view toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div className="flex gap-1 p-1 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              {approaches.map((a, i) => (
                <button key={i}
                  onClick={() => { setActiveApproach(i); setViewMode('individual') }}
                  className={`tab-pill ${viewMode === 'individual' && activeApproach === i ? 'active' : 'inactive'}`}>
                  {a.approach_name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <button onClick={() => setViewMode('individual')}
                className={`tab-pill flex items-center gap-1.5 ${viewMode === 'individual' ? 'active' : 'inactive'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Detail
              </button>
              <button onClick={() => setViewMode('comparison')}
                className={`tab-pill flex items-center gap-1.5 ${viewMode === 'comparison' ? 'active' : 'inactive'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Compare
              </button>
            </div>
          </div>

          {viewMode === 'individual'
            ? <ApproachCard
                approach={approaches[activeApproach]}
                language={language}
                isVerified={true}
                problemStatement={problem?.statement || ''}
                problemId={problemId}
              />
            : <ComparisonView
                approaches={approaches}
                language={language}
                isVerified={true}
                problemStatement={problem?.statement || ''}
                onSelectApproach={i => { setActiveApproach(i); setViewMode('individual') }}
              />
          }
        </>
      )}

      {/* ── Empty / first-load ── */}
      {!loading && !hasGenerated && !error && !problem && (
        <LoadingSkeleton />
      )}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-150 group"
      style={{ color: 'rgba(255,255,255,0.35)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
    >
      <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Problem Bank
    </button>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="card p-6 space-y-4">
          <div className="h-5 skeleton rounded w-1/3" />
          <div className="space-y-2">
            {[100, 85, 70].map(w => <div key={w} className="h-3 skeleton rounded" style={{ width: `${w}%` }} />)}
          </div>
          <div className="h-44 skeleton rounded-xl" />
        </div>
      ))}
    </div>
  )
}
