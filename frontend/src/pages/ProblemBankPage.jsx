import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProblems } from '../lib/api'

const TAGS = ['All', 'Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Search', 'Sorting', 'Linked List', 'Stack/Queue']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

const DIFF_STYLES = {
  Easy:   { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.18)'   },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)'  },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)'   },
}

const TAG_COLORS = [
  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
]

export default function ProblemBankPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const query      = searchParams.get('q') || ''
  const tag        = searchParams.get('tag') || 'All'
  const difficulty = searchParams.get('difficulty') || 'All'

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = {}
    if (query) params.q = query
    if (tag !== 'All') params.tag = tag
    if (difficulty !== 'All') params.difficulty = difficulty
    getProblems(params)
      .then(setProblems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [query, tag, difficulty])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    value && value !== 'All' ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  const activeFilters = (tag !== 'All' ? 1 : 0) + (difficulty !== 'All' ? 1 : 0) + (query ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Problem Bank</h1>
            <p className="text-xs text-gray-600 mt-0.5">Curated classics with pre-verified multi-approach solutions</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-2xl p-4 mb-6 border"
        style={{ background: 'rgba(12,13,14,0.98)', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search problems by name..."
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Tag filter */}
          <div className="relative">
            <select value={tag} onChange={(e) => setParam('tag', e.target.value)} className="select pr-8">
              {TAGS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <select value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)} className="select pr-8">
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {query && (
              <FilterChip label={`"${query}"`} onRemove={() => setParam('q', '')} />
            )}
            {tag !== 'All' && (
              <FilterChip label={tag} onRemove={() => setParam('tag', '')} />
            )}
            {difficulty !== 'All' && (
              <FilterChip
                label={difficulty}
                color={DIFF_STYLES[difficulty]?.color}
                onRemove={() => setParam('difficulty', '')}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Stats bar ── */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-gray-600">
            <span className="text-gray-400 font-semibold">{problems.length}</span>
            {' '}problem{problems.length !== 1 ? 's' : ''}
            {tag !== 'All' && <span> in <span style={{ color: 'rgba(255,255,255,0.6)' }}>{tag}</span></span>}
            {difficulty !== 'All' && <span> · <span style={{ color: DIFF_STYLES[difficulty]?.color }}>{difficulty}</span></span>}
          </p>
          {problems.length > 0 && (
            <div className="flex gap-3 text-[11px] text-gray-700">
              {['Easy','Medium','Hard'].map(d => {
                const count = problems.filter(p => p.difficulty === d).length
                if (!count) return null
                return (
                  <span key={d} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: DIFF_STYLES[d].color }} />
                    {count} {d}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <ProblemSkeleton />
      ) : error ? (
        <ErrorState error={error} />
      ) : problems.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, color, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: color || 'rgba(255,255,255,0.6)' }}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

function ProblemCard({ problem }) {
  const [hovered, setHovered] = useState(false)
  const diff = DIFF_STYLES[problem.difficulty] || { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.09)' }

  return (
    <Link
      to={`/problems/${problem.id}`}
      className="flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden"
      style={{
        background: hovered ? 'rgba(18,19,20,0.99)' : 'rgba(12,13,14,0.98)',
        borderColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title + difficulty */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-snug transition-colors duration-200"
          style={{ color: hovered ? '#ffffff' : 'rgba(255,255,255,0.8)' }}>
          {problem.title}
        </h3>
        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
          {problem.difficulty}
        </span>
      </div>

      {/* Statement */}
      <p className="text-xs line-clamp-2 leading-relaxed flex-1" style={{ color: '#4B5563' }}>{problem.statement}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap gap-1.5">
          {(problem.tags || []).slice(0, 3).map((tag, i) => {
            const c = TAG_COLORS[i % TAG_COLORS.length]
            return (
              <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{ background: c.bg, borderColor: c.border, color: c.color }}>
                {tag}
              </span>
            )
          })}
        </div>
        <span className="badge-verified text-[9px]">Curated</span>
      </div>

      {/* Hover arrow */}
      <div className="absolute right-4 bottom-4 transition-all duration-200"
        style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-4px)' }}>
        <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function ErrorState({ error }) {
  return (
    <div className="text-center py-24">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <svg className="w-6 h-6" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Failed to load problems</p>
      <p className="text-sm mb-5" style={{ color: '#4B5563' }}>{error}</p>
      <button className="btn-primary text-sm px-5 py-2">Retry</button>
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="text-center py-24">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <svg className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>No problems match your filters</p>
      <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
        {query ? `No results for "${query}"` : 'Try a broader search or different tag'}
      </p>
    </div>
  )
}

function ProblemSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex justify-between gap-2">
            <div className="h-4 skeleton rounded-lg w-2/3" />
            <div className="h-4 skeleton rounded-full w-14 shrink-0" />
          </div>
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-4/5" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 skeleton rounded-full w-14" />
            <div className="h-4 skeleton rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
