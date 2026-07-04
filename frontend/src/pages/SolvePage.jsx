/**
 * SolvePage — Custom Problem only (/solve)
 * Bank problems are handled by BankProblemPage (/problems/:id)
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getApproaches, analyzeProblem } from '../lib/api'
import { addProgrammingHistory } from '../lib/history'
import ApproachCard from '../components/ApproachCard'
import ComparisonView from '../components/ComparisonView'
import ProblemInputForm from '../components/ProblemInputForm'
import ProblemAnalysis from '../components/ProblemAnalysis'

const LANGUAGES   = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

// ── Session persistence (custom solve only) ───────────────────────────────────
const SESS_KEY = 'algolens_solve_custom'
function loadSession() {
  try { const r = sessionStorage.getItem(SESS_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
function saveSession(data) {
  try { sessionStorage.setItem(SESS_KEY, JSON.stringify(data)) } catch {}
}
function clearSession() {
  try { sessionStorage.removeItem(SESS_KEY) } catch {}
}

export default function SolvePage() {
  const [searchParams] = useSearchParams()
  const cached = loadSession()

  // Pre-fill from URL ?statement= or history navigation, then fall back to session
  const initialStatement = searchParams.get('statement') ?? cached?.customStatement ?? ''

  const [customStatement, setCustomStatement] = useState(initialStatement)
  const [language,        setLanguage]        = useState(cached?.language       ?? 'Python')
  const [difficulty,      setDifficulty]      = useState(cached?.difficulty     ?? 'Intermediate')
  const [approaches,      setApproaches]      = useState(cached?.approaches     ?? [])
  const [activeApproach,  setActiveApproach]  = useState(cached?.activeApproach ?? 0)
  const [viewMode,        setViewMode]        = useState(cached?.viewMode       ?? 'individual')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [hasGenerated,    setHasGenerated]    = useState(cached?.hasGenerated   ?? false)

  // Problem analysis
  const [analysis,        setAnalysis]        = useState(cached?.analysis       ?? null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError,   setAnalysisError]   = useState(null)

  // Persist to session whenever meaningful state changes
  useEffect(() => {
    if (!hasGenerated) return
    saveSession({ customStatement, language, difficulty, approaches, activeApproach, viewMode, hasGenerated, analysis })
  }, [customStatement, language, difficulty, approaches, activeApproach, viewMode, hasGenerated, analysis])

  // If ?statement= is in URL, clear old session so fresh generation happens
  useEffect(() => {
    const stmtFromUrl = searchParams.get('statement')
    if (stmtFromUrl && stmtFromUrl !== cached?.customStatement) {
      clearSession()
      setApproaches([])
      setHasGenerated(false)
      setAnalysis(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    if (!customStatement.trim()) return
    setLoading(true); setError(null); setApproaches([]); setHasGenerated(false)
    clearSession()

    // Kick off analysis in parallel
    setAnalysis(null); setAnalysisLoading(true); setAnalysisError(null)
    analyzeProblem(customStatement)
      .then(d => setAnalysis(d.analysis || null))
      .catch(e => setAnalysisError(e.response?.data?.error || e.message))
      .finally(() => setAnalysisLoading(false))

    try {
      const result = await getApproaches({ language, difficulty, customStatement })
      setApproaches(result.approaches || [])
      setActiveApproach(0)
      setHasGenerated(true)
      addProgrammingHistory({
        title:     customStatement.trim().slice(0, 60) + (customStatement.trim().length > 60 ? '…' : ''),
        statement: customStatement.trim(),
        language,
        difficulty,
        problemId: null,
      })
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Custom Problem</h1>
        </div>
        <p className="text-sm" style={{ color: '#4B5563' }}>
          Paste any coding problem to get multi-approach solutions with traced walkthroughs.
        </p>
      </div>

      {/* ── Config bar ── */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="section-label">Problem Statement</label>
            <ProblemInputForm
              value={customStatement}
              onChange={v => {
                setCustomStatement(v)
                // If user changes the statement, clear the stale result
                if (v.trim() !== customStatement.trim() && hasGenerated) {
                  clearSession()
                  setApproaches([])
                  setHasGenerated(false)
                  setAnalysis(null)
                }
              }}
              onSubmit={handleGenerate}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-end shrink-0">
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
              disabled={loading || !customStatement.trim()}
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
          </div>
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

      {/* ── Loading skeleton ── */}
      {loading && <LoadingSkeleton />}

      {/* ── Problem Analysis (runs in parallel with generation) ── */}
      {(analysisLoading || analysis || analysisError) && (
        <ProblemAnalysis
          analysis={analysis}
          loading={analysisLoading}
          error={analysisError}
          onRetry={() => {
            setAnalysisError(null); setAnalysisLoading(true)
            analyzeProblem(customStatement)
              .then(d => setAnalysis(d.analysis || null))
              .catch(e => setAnalysisError(e.response?.data?.error || e.message))
              .finally(() => setAnalysisLoading(false))
          }}
        />
      )}

      {/* ── Results ── */}
      {!loading && approaches.length > 0 && (
        <>
          {/* AI notice */}
          <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <span className="badge-ai shrink-0">AI-generated</span>
            <p className="text-xs" style={{ color: 'rgba(245,158,11,0.65)' }}>
              Generated by AI for a custom problem. Always verify critical code independently.
            </p>
          </div>

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
            ? <ApproachCard approach={approaches[activeApproach]} language={language} isVerified={false} problemStatement={customStatement} />
            : <ComparisonView approaches={approaches} language={language} isVerified={false} problemStatement={customStatement} onSelectApproach={i => { setActiveApproach(i); setViewMode('individual') }} />
          }
        </>
      )}

      {/* ── Empty state ── */}
      {!loading && !hasGenerated && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <svg className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>No approaches yet</p>
          <p className="text-sm" style={{ color: '#4B5563' }}>Paste a problem statement above and hit Generate.</p>
        </div>
      )}
    </div>
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
