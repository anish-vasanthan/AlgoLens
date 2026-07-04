import { useState } from 'react'
import Editor from '@monaco-editor/react'

const LANGUAGE_MAP = {
  Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript', Java: 'java',
  C: 'c', 'C++': 'cpp', 'C#': 'csharp', Go: 'go', Rust: 'rust', Kotlin: 'kotlin', Swift: 'swift',
}

const monacoCompactOptions = {
  readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false,
  fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
  lineNumbers: 'on', folding: false, wordWrap: 'off', automaticLayout: true,
  scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4, alwaysConsumeMouseWheel: false },
  renderLineHighlight: 'none', contextmenu: false, quickSuggestions: false,
  overviewRulerBorder: false, glyphMargin: false, lineDecorationsWidth: 0,
  lineNumbersMinChars: 3, padding: { top: 10, bottom: 10 },
}

export default function ComparisonView({ approaches, language, isVerified, onSelectApproach }) {
  const [expandedCol, setExpandedCol] = useState(null)
  const monacoLang = LANGUAGE_MAP[language] || 'python'

  return (
    <div className="space-y-4">

      {/* Sticky summary */}
      <div className="card sticky top-14 z-10 px-4 py-4"
        style={{ background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(20px)' }}>
        <p className="section-label mb-3">At a Glance — click any card to open full detail</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${approaches.length}, minmax(0, 1fr))` }}>
          {approaches.map((a, i) => (
            <button key={i} onClick={() => onSelectApproach(i)}
              className="text-left rounded-xl p-3 border transition-all duration-150 group"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}>
              <p className="font-semibold text-white text-sm mb-2 truncate">{a.approach_name}</p>
              <div className="space-y-1">
                {[['Time', a.time_complexity], ['Space', a.space_complexity]].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <span className="w-11 shrink-0 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#374151' }}>{label}</span>
                    <span className="font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Full detail →
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-4" style={{ minWidth: `${approaches.length * 390}px` }}>
          {approaches.map((a, i) => (
            <div key={i} className="flex-1 card overflow-hidden transition-all duration-200"
              style={{
                minWidth: '370px',
                ...(expandedCol === i ? { boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.6)' } : {})
              }}>

              {/* Col header */}
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setExpandedCol(expandedCol === i ? null : i)}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-white">{a.approach_name}</h3>
                    {isVerified ? <span className="badge-verified">Curated</span> : <span className="badge-ai">AI</span>}
                  </div>
                  <div className="flex gap-2">
                    {[a.time_complexity, a.space_complexity].map((v, vi) => (
                      <span key={vi} className="text-[11px] font-mono px-2 py-0.5 rounded-lg border"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${expandedCol === i ? 'rotate-180' : ''}`}
                  style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Intuition always visible */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="section-label">Intuition</p>
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#6B7280' }}>{a.explanation}</p>
              </div>

              {/* Expanded */}
              {expandedCol === i && (
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-label">Algorithm</p>
                    <ol className="space-y-2">
                      {(a.algorithm_steps || []).map((step, si) => (
                        <li key={si} className="flex gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <span className="step-num shrink-0 mt-0.5">{si + 1}</span>
                          <span className="leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-label mb-2">Code — {language}</p>
                    <div className="monaco-container" onWheel={(e) => e.stopPropagation()}>
                      <Editor height="200px" language={monacoLang} value={a.code || '// No code available'}
                        theme="vs-dark" options={monacoCompactOptions}
                        loading={<div className="h-[200px] skeleton" />}
                      />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: '#374151' }}>Display only — not executed</p>
                  </div>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="section-label mb-0">Traced Dry Run</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                        Not executed
                      </span>
                    </div>
                    <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap rounded-xl p-3 overflow-x-auto max-h-44 overflow-y-auto"
                      style={{ background: '#050506', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                      {a.dry_run_trace || 'No trace available.'}
                    </pre>
                  </div>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-label">Complexity</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[['Time', a.time_complexity, a.time_justification], ['Space', a.space_complexity, a.space_justification]].map(([type, val, just]) => (
                        <div key={type} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{type}</p>
                          <p className="text-lg font-mono font-bold text-white mb-1">{val}</p>
                          <p className="text-[11px]" style={{ color: '#4B5563' }}>{just}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-label">Pros &amp; Cons</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(34,197,94,0.6)' }}>Pros</p>
                        <ul className="space-y-1">
                          {(a.pros || []).map((p, pi) => (
                            <li key={pi} className="text-xs flex gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                              <span style={{ color: '#22C55E' }}>+</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(239,68,68,0.6)' }}>Cons</p>
                        <ul className="space-y-1">
                          {(a.cons || []).map((c, ci) => (
                            <li key={ci} className="text-xs flex gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                              <span style={{ color: '#EF4444' }}>−</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="section-label">Best Use Case</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.best_use_case}</p>
                  </div>

                  {(a.interview_questions || []).length > 0 && (
                    <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="section-label">Interview Follow-ups</p>
                      <ul className="space-y-2">
                        {a.interview_questions.map((q, qi) => (
                          <li key={qi} className="flex gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border h-fit"
                              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)' }}>
                              Q{qi + 1}
                            </span>
                            <span>{typeof q === 'string' ? q : q.question_text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={() => onSelectApproach(i)} className="btn-primary w-full text-sm justify-center flex items-center gap-2">
                      Open Full Detail View
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {expandedCol !== i && (
                <div className="px-5 py-3 text-center">
                  <p className="text-[11px]" style={{ color: '#374151' }}>Click header to expand all details</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
