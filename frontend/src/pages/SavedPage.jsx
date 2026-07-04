import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllSavedApproaches, unsaveApproach, clearAllSaved,
  getAllSavedAptitude, unsaveAptitude, clearAllAptitude,
} from '../lib/savedProblems'
import ApproachCard from '../components/ApproachCard'

const DIFF_COLORS = {
  Easy:   { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.18)'  },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)'  },
}

function AptitudeDetail({ item }) {
  const a = item.analysis
  if (!a) return <p className="text-sm p-4" style={{ color: '#4B5563' }}>No analysis data.</p>
  const diffColor = DIFF_COLORS[a?.difficulty] || DIFF_COLORS.Medium
  return (
    <div className="px-5 pb-5 pt-3 space-y-4">
      {a.what_is_asked && <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{a.what_is_asked}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {a.given_information?.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Given</p>
            <ul className="space-y-1.5">
              {a.given_information.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <span style={{ color: '#6B7280' }}>{g.label}: <code className="font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{g.value}</code></span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {a.to_find && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>To Find</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{a.to_find}</p>
            {a.formula_used && (
              <div className="mt-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <code className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{a.formula_used}</code>
              </div>
            )}
          </div>
        )}
      </div>
      {a.solution_steps?.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Solution Steps</p>
          <div className="space-y-0">
            {a.solution_steps.map((s, i) => (
              <div key={i} className="relative flex gap-3">
                {i < a.solution_steps.length - 1 && (
                  <div className="absolute left-[13px] top-7 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                )}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 mt-0.5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                  {s.step}
                </div>
                <div className="pb-4 flex-1">
                  <p className="text-sm font-semibold text-white mb-1">{s.description}</p>
                  {s.calculation && (
                    <div className="rounded-lg px-3 py-2 mb-1"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <code className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.calculation}</code>
                    </div>
                  )}
                  {s.result && <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>→ {s.result}</p>}
                </div>
              </div>
            ))}
          </div>
          {a.final_answer && (
            <div className="mt-2 rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
              <svg className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(34,197,94,0.6)' }}>Final Answer</p>
                <p className="text-sm font-bold" style={{ color: '#22C55E' }}>{a.final_answer}</p>
              </div>
            </div>
          )}
        </div>
      )}
      {a.shortcut_trick && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Shortcut / Trick</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{a.shortcut_trick}</p>
        </div>
      )}
    </div>
  )
}

export default function SavedPage() {
  const [tab, setTab] = useState('programming')
  const [approaches, setApproaches] = useState([])
  const [aptitude, setAptitude] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { setApproaches(getAllSavedApproaches()); setAptitude(getAllSavedAptitude()) }, [])

  const handleUnsaveApproach = (key) => { unsaveApproach(key); setApproaches(getAllSavedApproaches()); if (expanded === key) setExpanded(null) }
  const handleUnsaveAptitude = (key) => { unsaveAptitude(key); setAptitude(getAllSavedAptitude()); if (expanded === key) setExpanded(null) }
  const handleClearProgramming = () => { if (confirm('Remove all saved programming approaches?')) { clearAllSaved(); setApproaches([]); setExpanded(null) } }
  const handleClearAptitude = () => { if (confirm('Remove all saved aptitude questions?')) { clearAllAptitude(); setAptitude([]); setExpanded(null) } }

  const count = tab === 'programming' ? approaches.length : aptitude.length

  const RemoveBtn = ({ onClick }) => (
    <button onClick={onClick} className="p-1.5 rounded-lg transition-colors"
      style={{ color: 'rgba(255,255,255,0.2)' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent' }}
      title="Remove">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )

  const ChevronIcon = ({ open }) => (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Saved</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {count > 0 ? `${count} item${count !== 1 ? 's' : ''} saved locally — no sign-in required.` : 'Save approaches or aptitude questions using the bookmark button.'}
          </p>
        </div>
        {count > 0 && (
          <button onClick={tab === 'programming' ? handleClearProgramming : handleClearAptitude}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-transparent transition-all"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border mb-6 w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
        {[
          { id: 'programming', label: 'Programming', count: approaches.length, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
          { id: 'aptitude', label: 'Aptitude', count: aptitude.length, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setExpanded(null) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
            style={tab === t.id
              ? { background: 'rgba(255,255,255,0.09)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }
              : { color: '#4B5563' }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = '#4B5563' }}>
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Programming tab */}
      {tab === 'programming' && (
        approaches.length === 0 ? (
          <EmptyState
            icon={<svg className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
            title="No programming approaches saved"
            subtitle={<>Hit the <span style={{ color: '#E8C547' }} className="font-medium">Save</span> button on any approach.</>}
            cta={{ to: '/problems', label: 'Browse Problems' }}
          />
        ) : (
          <div className="space-y-2">
            {approaches.map((approach) => {
              const key = approach.id || approach.approach_name
              const isOpen = expanded === key
              return (
                <div key={key} className="card overflow-hidden">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{approach.approach_name}</span>
                        {approach.language && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {approach.language}
                          </span>
                        )}
                        {approach.is_verified ? <span className="badge-verified">Curated</span> : <span className="badge-ai">AI</span>}
                      </div>
                      {approach.problemStatement && (
                        <p className="text-xs line-clamp-1" style={{ color: '#374151' }}>{approach.problemStatement}</p>
                      )}
                      <div className="flex gap-2 mt-1.5">
                        {[approach.time_complexity, approach.space_complexity].map((v, vi) => (
                          <span key={vi} className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px]" style={{ color: '#1F2937' }}>
                        {approach.savedAt ? new Date(approach.savedAt).toLocaleDateString() : ''}
                      </span>
                      <RemoveBtn onClick={(e) => { e.stopPropagation(); handleUnsaveApproach(key) }} />
                      <ChevronIcon open={isOpen} />
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {/* Link back to the problem if it came from the bank */}
                      {approach.problemId && (
                        <div className="px-5 pt-4">
                          <Link to={`/problems/${approach.problemId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Open in Problem Bank
                          </Link>
                        </div>
                      )}
                      <ApproachCard approach={approach} language={approach.language || 'Python'} isVerified={approach.is_verified ?? false} problemStatement={approach.problemStatement || ''} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Aptitude tab */}
      {tab === 'aptitude' && (
        aptitude.length === 0 ? (
          <EmptyState
            icon={<svg className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            title="No aptitude questions saved"
            subtitle={<>Analyze a question on the <span style={{ color: '#E8C547' }} className="font-medium">Aptitude</span> page and hit Save.</>}
            cta={{ to: '/aptitude', label: 'Go to Aptitude' }}
          />
        ) : (
          <div className="space-y-2">
            {aptitude.map((item) => {
              const key = item.key
              const a = item.analysis
              const isOpen = expanded === key
              const diffColor = DIFF_COLORS[a?.difficulty] || DIFF_COLORS.Medium
              return (
                <div key={key} className="card overflow-hidden">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {a?.title || item.question?.slice(0, 60) + (item.question?.length > 60 ? '…' : '')}
                        </span>
                        {a?.category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)' }}>
                            {a.category}
                          </span>
                        )}
                        {a?.difficulty && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={{ color: diffColor.color, background: diffColor.bg, borderColor: diffColor.border }}>
                            {a.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs line-clamp-1" style={{ color: '#374151' }}>{item.question}</p>
                      {a?.final_answer && (
                        <p className="text-[11px] mt-1 font-medium" style={{ color: '#22C55E' }}>Answer: {a.final_answer}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px]" style={{ color: '#1F2937' }}>
                        {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}
                      </span>
                      <RemoveBtn onClick={(e) => { e.stopPropagation(); handleUnsaveAptitude(key) }} />
                      <ChevronIcon open={isOpen} />
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <AptitudeDetail item={item} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

function EmptyState({ icon, title, subtitle, cta }) {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {icon}
      </div>
      <p className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</p>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#4B5563' }}>{subtitle}</p>
      {cta && <Link to={cta.to} className="btn-primary text-sm px-5 py-2">{cta.label}</Link>}
    </div>
  )
}
