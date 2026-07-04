import { useState, useEffect, useRef } from 'react'
import { analyzeAptitude } from '../lib/api'
import { saveAptitude, unsaveAptitude, isAptitudeSaved } from '../lib/savedProblems'
import { addAptitudeHistory } from '../lib/history'

const SESSION_KEY = 'algolens_aptitude_session'
function loadSession() { try { const r = sessionStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null } catch { return null } }
function saveSession(data) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch {} }
function clearSession() { try { sessionStorage.removeItem(SESSION_KEY) } catch {} }

const NEUTRAL = { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }
const CATEGORY_COLORS = {
  default: NEUTRAL, Arithmetic: NEUTRAL, Percentage: NEUTRAL, 'Time & Work': NEUTRAL,
  'Time Speed Distance': NEUTRAL, Probability: NEUTRAL, 'Logical Reasoning': NEUTRAL,
}
const DIFF_COLORS = {
  Easy:   { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.18)'  },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)'  },
}

const SAMPLE_QUESTIONS = [
  'A train travels 120 km in 2 hours. What is its speed in km/h?',
  'If 20% of a number is 50, what is the number?',
  'A can do a work in 10 days, B in 15 days. How many days to finish together?',
  'Two numbers are in ratio 3:5 and their sum is 64. Find the numbers.',
  'Find the probability of getting an even number when rolling a dice.',
]

// Neutral section box
function Section({ icon, title, children }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function AptitudePage() {
  const cached = loadSession()
  const [question, setQuestion] = useState(() => {
    // Check if navigated from history panel with a pre-fill
    try {
      const prefill = sessionStorage.getItem('algolens_aptitude_prefill')
      if (prefill) { sessionStorage.removeItem('algolens_aptitude_prefill'); return prefill }
    } catch {}
    return cached?.question ?? ''
  })
  const [analysis, setAnalysis] = useState(cached?.analysis ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saveAnim, setSaveAnim] = useState(false)
  const analysedQuestion = useRef(cached?.analysedQuestion ?? '')
  const [isSaved, setIsSaved] = useState(() => isAptitudeSaved((cached?.analysedQuestion ?? '').slice(0, 80)))

  useEffect(() => {
    if (!analysis) return
    saveSession({ question, analysis, analysedQuestion: analysedQuestion.current })
  }, [question, analysis])

  const handleQuestionChange = (val) => {
    setQuestion(val)
    if (val.trim() !== analysedQuestion.current.trim()) clearSession()
  }

  const handleAnalyze = async () => {
    if (!question.trim()) return
    setLoading(true); setError(null); setAnalysis(null); clearSession()
    try {
      const data = await analyzeAptitude(question.trim())
      analysedQuestion.current = question.trim()
      setAnalysis(data.analysis)
      setIsSaved(isAptitudeSaved(question.trim().slice(0, 80)))
      // Record to history
      addAptitudeHistory({
        question: question.trim(),
        title: data.analysis?.title || question.trim().slice(0, 60),
        category: data.analysis?.category || null,
        difficulty: data.analysis?.difficulty || null,
      })
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Analysis failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleSave = () => {
    const key = question.trim().slice(0, 80)
    if (isSaved) { unsaveAptitude(key); setIsSaved(false) }
    else {
      saveAptitude({ key, question: question.trim(), analysis })
      setIsSaved(true); setSaveAnim(true)
      setTimeout(() => setSaveAnim(false), 600)
    }
  }

  const catColor = CATEGORY_COLORS[analysis?.category] || CATEGORY_COLORS.default
  const diffColor = DIFF_COLORS[analysis?.difficulty] || DIFF_COLORS.Medium

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Aptitude Analyzer</h1>
        </div>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Paste any aptitude, reasoning, or math question to get a complete breakdown — solution steps, shortcuts, common mistakes, and variations.
        </p>
      </div>

      {/* Input card */}
      <div className="card p-5 mb-6">
        <label className="section-label">Question</label>
        <textarea
          value={question}
          onChange={e => handleQuestionChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnalyze() }}
          placeholder="Paste your aptitude question here..."
          rows={4}
          className="input w-full resize-none mb-3"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px]" style={{ color: '#374151' }}>Press Ctrl+Enter to analyze</p>
          <button onClick={handleAnalyze} disabled={loading || !question.trim()} className="btn-primary flex items-center gap-2 px-5 py-2">
            {loading
              ? <><Spinner />Analyzing...</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>Analyze Question</>
            }
          </button>
        </div>
      </div>

      {/* Sample questions */}
      {!analysis && !loading && (
        <div className="mb-6">
          <p className="section-label mb-3">Try a sample question</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => handleQuestionChange(q)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 text-left"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                {q.length > 55 ? q.slice(0, 55) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-white">Analysis failed</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(239,68,68,0.7)' }}>{error}</p>
            <button onClick={handleAnalyze} className="mt-2 text-xs font-semibold underline" style={{ color: '#EF4444' }}>Try again</button>
          </div>
        </div>
      )}

      {loading && <AptitudeSkeleton />}

      {/* Analysis result */}
      {analysis && !loading && (
        <div className="space-y-4">

          {/* Title + meta */}
          <div className="card px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{analysis.title}</h2>
                {analysis.category && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ color: catColor.color, background: catColor.bg, borderColor: catColor.border }}>
                    {analysis.category}
                  </span>
                )}
                {analysis.difficulty && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ color: diffColor.color, background: diffColor.bg, borderColor: diffColor.border }}>
                    {analysis.difficulty}
                  </span>
                )}
              </div>
              <button onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${saveAnim ? 'scale-110' : 'scale-100'}`}
                style={isSaved
                  ? { background: 'rgba(232,197,71,0.1)', color: '#E8C547', borderColor: 'rgba(232,197,71,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.08)' }}
                title={isSaved ? 'Remove from saved' : 'Save this question'}>
                <svg className={`w-3.5 h-3.5 transition-transform ${saveAnim ? 'scale-125' : ''}`}
                  fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            {analysis.what_is_asked && (
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{analysis.what_is_asked}</p>
            )}
          </div>

          {/* Given + To Find */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.given_information?.length > 0 && (
              <Section icon={<GivenIcon />} title="Given Information">
                <ul className="space-y-2">
                  {analysis.given_information.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                      <div>
                        <span style={{ color: '#6B7280' }}>{g.label}: </span>
                        <code className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{g.value}</code>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {analysis.to_find && (
              <Section icon={<TargetIcon />} title="To Find">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{analysis.to_find}</p>
                {analysis.formula_used && (
                  <div className="mt-3 rounded-lg px-3 py-2"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Formula</p>
                    <code className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{analysis.formula_used}</code>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Key Concepts */}
          {analysis.key_concepts?.length > 0 && (
            <Section icon={<ConceptIcon />} title="Key Concepts">
              <div className="flex flex-wrap gap-2">
                {analysis.key_concepts.map((c, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}>
                    {c}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Steps */}
          {analysis.solution_steps?.length > 0 && (
            <Section icon={<StepsIcon />} title="Step-by-Step Solution">
              <div className="space-y-0">
                {analysis.solution_steps.map((s, i) => (
                  <div key={i} className="relative flex gap-3">
                    {i < analysis.solution_steps.length - 1 && (
                      <div className="absolute left-[13px] top-7 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    )}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                      {s.step}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-sm font-semibold text-white mb-1">{s.description}</p>
                      {s.calculation && (
                        <div className="rounded-lg px-3 py-2 mb-1"
                          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <code className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.calculation}</code>
                        </div>
                      )}
                      {s.result && <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>→ {s.result}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {analysis.final_answer && (
                <div className="mt-2 rounded-xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                  <svg className="w-5 h-5 shrink-0" style={{ color: '#22C55E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(34,197,94,0.7)' }}>Final Answer</p>
                    <p className="text-base font-bold" style={{ color: '#22C55E' }}>{analysis.final_answer}</p>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Shortcut + Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.shortcut_trick && (
              <Section icon={<LightningIcon />} title="Shortcut / Trick">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{analysis.shortcut_trick}</p>
              </Section>
            )}
            {analysis.common_mistakes?.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: 'rgba(239,68,68,0.5)' }}><WarnIcon /></span>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(239,68,68,0.5)' }}>Common Mistakes</p>
                </div>
                <ul className="space-y-2">
                  {analysis.common_mistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: '#EF4444' }}>✗</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Variations */}
          {analysis.similar_variations?.length > 0 && (
            <Section icon={<VariantIcon />} title="Practice Variations">
              <ul className="space-y-2">
                {analysis.similar_variations.map((v, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span className="font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>V{i + 1}.</span>
                    <span className="leading-relaxed">{v}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function AptitudeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <div className="flex gap-2"><div className="h-5 skeleton rounded w-1/3" /><div className="h-5 skeleton rounded w-20" /></div>
        <div className="h-3 skeleton rounded w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 h-28" /><div className="card p-5 h-28" />
      </div>
      <div className="card p-5 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-full skeleton shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 skeleton rounded w-3/4" />
              <div className="h-8 skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>
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

const GivenIcon    = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
const TargetIcon   = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
const ConceptIcon  = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
const StepsIcon    = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
const LightningIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
const WarnIcon     = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
const VariantIcon  = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
