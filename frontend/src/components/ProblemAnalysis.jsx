export default function ProblemAnalysis({ analysis, loading, error, onRetry }) {
  if (loading) return <AnalysisSkeleton />
  if (error) return (
    <div className="rounded-2xl border p-4 mb-6 flex items-center justify-between"
      style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}>
      <p className="text-xs" style={{ color: '#EF4444' }}>Analysis failed — {error}</p>
      <button onClick={onRetry} className="text-xs font-semibold underline ml-4 shrink-0" style={{ color: '#EF4444' }}>Retry</button>
    </div>
  )
  if (!analysis) return null

  return (
    <div className="card mb-6 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Problem Breakdown</span>
          {analysis.title && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
              {analysis.title}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>AI Analyzed</span>
      </div>

      <div className="p-5 space-y-4">

        {analysis.problem_summary && (
          <InfoBox title="What This Problem Asks">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{analysis.problem_summary}</p>
          </InfoBox>
        )}

        {analysis.real_world_scenario && (
          <InfoBox title="Real-World Scenario">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{analysis.real_world_scenario}</p>
          </InfoBox>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.input_format?.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Input</p>
              <ul className="space-y-2.5">
                {analysis.input_format.map((inp, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <code className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.09)' }}>
                        {inp.name}
                      </code>
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{inp.type}</span>
                    </div>
                    <p className="text-xs leading-snug pl-0.5" style={{ color: '#4B5563' }}>{inp.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.output_format && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Output</p>
              <code className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded inline-block mb-2"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {analysis.output_format.type}
              </code>
              <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{analysis.output_format.description}</p>
            </div>
          )}
        </div>

        {analysis.step_by_step_io?.length > 0 && (
          <InfoBox title="Step-by-Step Input — Output Flow">
            <div className="space-y-0">
              {analysis.step_by_step_io.map((s, i) => (
                <div key={i} className="relative flex gap-3">
                  {i < analysis.step_by_step_io.length - 1 && (
                    <div className="absolute left-[13px] top-7 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  )}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                    {s.step}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{s.action}</p>
                    {s.state && (
                      <div className="rounded-lg px-3 py-2 mt-1"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>State</p>
                        <code className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.state}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </InfoBox>
        )}

        {analysis.example && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Worked Example</p>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#374151' }}>Input</p>
                <pre className="text-sm font-mono rounded-lg p-3 leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                  {analysis.example.input}
                </pre>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#374151' }}>Output</p>
                <pre className="text-sm font-mono rounded-lg p-3 leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                  {analysis.example.output}
                </pre>
              </div>
            </div>
            {analysis.example.explanation && (
              <div className="px-4 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#374151' }}>Why this output?</p>
                <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{analysis.example.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {analysis.constraints?.length > 0 && (
            <MiniSection title="Constraints">
              {analysis.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <code className="font-mono text-[11px] leading-relaxed">{c}</code>
                </li>
              ))}
            </MiniSection>
          )}
          {analysis.edge_cases?.length > 0 && (
            <MiniSection title="Edge Cases">
              {analysis.edge_cases.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="shrink-0" style={{ color: '#EF4444' }}>!</span>
                  <span className="leading-relaxed">{e}</span>
                </li>
              ))}
            </MiniSection>
          )}
          {analysis.key_observations?.length > 0 && (
            <MiniSection title="Key Insights">
              {analysis.key_observations.map((o, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>→</span>
                  <span className="leading-relaxed">{o}</span>
                </li>
              ))}
            </MiniSection>
          )}
        </div>

      </div>
    </div>
  )
}

function InfoBox({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{title}</p>
      {children}
    </div>
  )
}

function MiniSection({ title, children }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>{title}</p>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="card p-5 mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg skeleton" />
        <div className="h-4 skeleton rounded w-36" />
        <div className="h-4 skeleton rounded w-20" />
      </div>
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-5/6" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 skeleton rounded-xl" /><div className="h-24 skeleton rounded-xl" />
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-full skeleton shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 skeleton rounded w-3/4" /><div className="h-8 skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
