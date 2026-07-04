import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { generateInterviewQuestions } from '../lib/api'
import { saveApproach, unsaveApproach, isApproachSaved } from '../lib/savedProblems'

const LANGUAGE_MAP = {
  Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript', Java: 'java',
  C: 'c', 'C++': 'cpp', 'C#': 'csharp', Go: 'go', Rust: 'rust', Kotlin: 'kotlin', Swift: 'swift',
}

const monacoOptions = (fontSize = 13) => ({
  readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false,
  fontSize, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontLigatures: true,
  lineNumbers: 'on', folding: false, wordWrap: 'off', automaticLayout: true,
  tabSize: 4, insertSpaces: true, detectIndentation: false,
  scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4, alwaysConsumeMouseWheel: false },
  renderLineHighlight: 'none', cursorStyle: 'line', contextmenu: false,
  quickSuggestions: false, suggestOnTriggerCharacters: false, tabCompletion: 'off',
  overviewRulerBorder: false, hideCursorInOverviewRuler: true,
  occurrencesHighlight: false, selectionHighlight: false, renderValidationDecorations: 'off',
  lineDecorationsWidth: 0, lineNumbersMinChars: 3, glyphMargin: false,
  padding: { top: 12, bottom: 12 },
})

function codeHeight(code = '', minLines = 8, maxLines = 32) {
  const lines = Math.min(Math.max((code || '').split('\n').length + 1, minLines), maxLines)
  return `${lines * 20}px`
}

function normalizeIndentation(code = '', tabWidth = 4) {
  const spaces = ' '.repeat(tabWidth)
  return code.split('\n').map(line => {
    let i = 0, result = ''
    while (i < line.length && (line[i] === '\t' || line[i] === ' ')) {
      result += line[i] === '\t' ? spaces : ' '; i++
    }
    return result + line.slice(i)
  }).join('\n')
}

const IC = 'rgba(255,255,255,0.4)'  // icon color
const Icons = {
  Intuition:  () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Algorithm:  () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  Code:       () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Trace:      () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Complexity: () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  ProsCons:   () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Target:     () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>,
  Interview:  () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  IO:         () => <svg className="w-4 h-4" style={{ color: IC }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
}

export default function ApproachCard({ approach, language, isVerified, problemStatement, problemId = null }) {
  const [isSaved, setIsSaved] = useState(() => isApproachSaved(approach.id || approach.approach_name))
  const [saveAnim, setSaveAnim] = useState(false)
  const [interviewQs, setInterviewQs] = useState(approach.interview_questions || [])
  const [loadingQs, setLoadingQs] = useState(false)
  const [qsError, setQsError] = useState(null)
  const [copied, setCopied] = useState(false)

  const monacoLang = LANGUAGE_MAP[language] || 'plaintext'
  const height = codeHeight(approach.code)
  const normalizedCode = normalizeIndentation(approach.code || '')

  const handleCopy = useCallback(() => {
    if (!approach.code) return
    navigator.clipboard.writeText(normalizedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }, [approach.code, normalizedCode])

  const handleSave = useCallback(() => {
    const key = approach.id || approach.approach_name
    if (isSaved) { unsaveApproach(key); setIsSaved(false) }
    else { saveApproach({ ...approach, language, problemStatement, problemId, savedAt: Date.now() }); setIsSaved(true); setSaveAnim(true); setTimeout(() => setSaveAnim(false), 600) }
  }, [approach, isSaved, language, problemStatement, problemId])

  const handleLoadQuestions = async () => {
    if (interviewQs.length > 0) return
    setLoadingQs(true); setQsError(null)
    try {
      const data = await generateInterviewQuestions({ approachId: approach.id, approachName: approach.approach_name, problemStatement })
      setInterviewQs(data.questions || [])
    } catch (e) { setQsError(e.response?.data?.error || e.message) }
    finally { setLoadingQs(false) }
  }

  return (
    <div className="card overflow-hidden" style={{ background: 'rgba(12,13,14,0.99)' }}>

      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2.5">
              <h2 className="text-lg font-bold text-white">{approach.approach_name}</h2>
              {isVerified ? <span className="badge-verified">Curated</span> : <span className="badge-ai">AI-generated</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <ComplexityChip label="Time" value={approach.time_complexity} />
              <ComplexityChip label="Space" value={approach.space_complexity} />
            </div>
          </div>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${saveAnim ? 'scale-110' : 'scale-100'}`}
            style={isSaved
              ? { background: 'rgba(232,197,71,0.1)', color: '#E8C547', borderColor: 'rgba(232,197,71,0.25)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.08)' }}
            title={isSaved ? 'Remove from saved' : 'Save this approach'}>
            <svg className={`w-3.5 h-3.5 transition-transform ${saveAnim ? 'scale-125' : ''}`}
              fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ '--divide-color': 'rgba(255,255,255,0.04)' }} className="divide-y divide-white/[0.04]">

        <Section Icon={Icons.Intuition} title="Intuition">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{approach.explanation}</p>
        </Section>

        <Section Icon={Icons.Algorithm} title="Step-by-Step Algorithm">
          <ol className="space-y-2.5">
            {(approach.algorithm_steps || []).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span className="step-num mt-0.5 shrink-0">{i + 1}</span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section Icon={Icons.Code} title={`Code — ${language}`}
          action={
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all duration-200"
              style={copied
                ? { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
              title="Copy code">
              {copied
                ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
              }
            </button>
          }>
          <div className="monaco-container" onWheel={(e) => e.stopPropagation()}>
            <Editor height={height} language={monacoLang} value={normalizedCode || '// No code available'}
              theme="vs-dark" options={monacoOptions(13)}
              onMount={(editor) => {
                editor.getDomNode()?.addEventListener('wheel', (e) => {
                  const dom = editor.getDomNode()
                  const atTop = dom.scrollTop === 0 && e.deltaY < 0
                  const atBottom = dom.scrollTop + dom.clientHeight >= dom.scrollHeight && e.deltaY > 0
                  if (atTop || atBottom) e.preventDefault()
                }, { passive: false })
              }}
              loading={<div className="animate-pulse rounded-xl" style={{ height, background: '#050506' }} />}
            />
          </div>
          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: '#374151' }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Display only — not executed
          </p>
        </Section>

        {/* Sample I/O */}
        {approach.sample_io?.length > 0 && (
          <Section Icon={Icons.IO} title="Sample Input / Output">
            <div className="space-y-3">
              {approach.sample_io.map((ex, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {approach.sample_io.length > 1 && (
                    <div className="px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Example {i + 1}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="p-3" style={{ background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Input</p>
                      <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{ex.input}</pre>
                    </div>
                    <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Output</p>
                      <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{ex.output}</pre>
                    </div>
                  </div>
                  {ex.explanation && (
                    <div className="px-3 py-2" style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-[11px] leading-relaxed" style={{ color: '#4B5563' }}>
                        <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Why: </span>{ex.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section Icon={Icons.Trace} title="Traced Dry Run">
          <div className="rounded-xl overflow-hidden" style={{ background: '#050506', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#374151' }}>Traced Output</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                Not executed
              </span>
            </div>
            <pre className="text-xs sm:text-sm font-mono leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {approach.dry_run_trace || 'No trace available.'}
            </pre>
          </div>
        </Section>

        <Section Icon={Icons.Complexity} title="Complexity Analysis">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ComplexityBlock type="Time" value={approach.time_complexity} justification={approach.time_justification} />
            <ComplexityBlock type="Space" value={approach.space_complexity} justification={approach.space_justification} />
          </div>
        </Section>

        <Section Icon={Icons.ProsCons} title="Pros & Cons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4 border" style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(34,197,94,0.6)' }}>Pros</p>
              <ul className="space-y-2">
                {(approach.pros || []).map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: '#22C55E' }}>+</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(239,68,68,0.6)' }}>Cons</p>
              <ul className="space-y-2">
                {(approach.cons || []).map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: '#EF4444' }}>−</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section Icon={Icons.Target} title="Best Use Case">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{approach.best_use_case}</p>
        </Section>

        <Section Icon={Icons.Interview} title="Interview Follow-up Questions"
          action={interviewQs.length === 0 && (
            <button onClick={handleLoadQuestions} disabled={loadingQs}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}>
              {loadingQs
                ? <><SpinnerXS />Generating...</>
                : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Generate</>
              }
            </button>
          )}>
          {qsError && <p className="text-xs mb-2" style={{ color: '#EF4444' }}>{qsError}</p>}
          {interviewQs.length > 0 ? (
            <ul className="space-y-3">
              {interviewQs.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border h-fit"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)' }}>
                    Q{i + 1}
                  </span>
                  <span className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{typeof q === 'string' ? q : q.question_text}</span>
                </li>
              ))}
            </ul>
          ) : !loadingQs ? (
            <p className="text-sm italic" style={{ color: '#374151' }}>Click Generate to get AI-powered interview follow-ups for this approach.</p>
          ) : null}
        </Section>
      </div>
    </div>
  )
}

function Section({ Icon, title, children, action }) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <Icon /><span>{title}</span>
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function ComplexityChip({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border"
      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}>
      <span className="font-sans font-semibold text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  )
}

function ComplexityBlock({ type, value, justification }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{type} Complexity</p>
      <p className="text-2xl font-mono font-bold mb-2 text-white">{value}</p>
      <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{justification}</p>
    </div>
  )
}

function SpinnerXS() {
  return (
    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
