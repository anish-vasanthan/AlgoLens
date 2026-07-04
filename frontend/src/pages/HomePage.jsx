import { Link } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

const features = [
  {
    title: 'Multiple Approaches',
    desc: 'Brute Force to HashMap to Two Pointers to Binary Search. See every technique that applies, not just one right answer.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  },
  {
    title: 'Traced Dry Runs',
    desc: 'Step-by-step state walkthroughs — pointer positions, hashmap contents, recursion stack — for every approach.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    title: 'Complexity With Reasoning',
    desc: 'Big-O notation plus a plain-language justification for every approach. Know the why, not just the notation.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  },
  {
    title: 'Interview Ready',
    desc: 'Every approach ships with 2–3 likely follow-up questions an interviewer would ask, specific to that technique.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
  },
  {
    title: 'Side-by-Side Compare',
    desc: 'Compare time and space complexity across all approaches before diving deep into any one of them.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
  },
  {
    title: 'AI for Any Problem',
    desc: 'Type any problem statement and get AI-generated approaches instantly. Curated problems are always pre-verified.',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
]

const sampleProblems = [
  { title: 'Two Sum',           difficulty: 'Easy',   dc: '#22C55E' },
  { title: 'Binary Search',     difficulty: 'Easy',   dc: '#22C55E' },
  { title: 'Longest Substring', difficulty: 'Medium', dc: '#F59E0B' },
  { title: 'Merge Intervals',   difficulty: 'Medium', dc: '#F59E0B' },
  { title: "Kadane's Algorithm", difficulty: 'Medium', dc: '#F59E0B' },
  { title: 'LRU Cache',         difficulty: 'Hard',   dc: '#EF4444' },
]

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift']

const steps = [
  {
    n: '01', title: 'Pick a problem',
    desc: 'Choose from 946+ curated classics or paste any problem statement.',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  },
  {
    n: '02', title: 'Select language and depth',
    desc: '11 languages. Beginner through Advanced — tailored explanations and code.',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  },
  {
    n: '03', title: 'Explore every approach',
    desc: 'Compare solutions, trace dry runs, study complexity, and prep for interviews.',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
]

export default function HomePage() {
  const { profile } = useUser()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(232,197,71,0.08)', border: '1px solid rgba(232,197,71,0.2)', color: '#E8C547' }}>
          <span className="glow-dot" />
          Learn the thought process, not just the answer
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-5 leading-[1.12] tracking-tight">
          {profile && (
            <><span style={{ color: 'rgba(255,255,255,0.6)' }}>Hi {profile.displayName || profile.username},</span><br /></>
          )}
          See Every Approach.
          <br />
          <span className="gradient-text-hero">Understand Every Trade-off.</span>
        </h1>

        <p className="text-[1.05rem] mb-10 leading-relaxed max-w-xl mx-auto" style={{ color: '#6B7280' }}>
          AlgoLens shows 2–4 solutions to any coding problem — brute force to optimal — with
          traced walkthroughs, complexity analysis, and interview prep baked in.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <Link to="/problems" className="btn-primary text-[15px] px-7 py-3 inline-flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Browse Problem Bank
          </Link>
          <Link to="/solve" className="btn-secondary text-[15px] px-7 py-3 inline-flex items-center justify-center gap-2">
            Try a Custom Problem
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Sample problem pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sampleProblems.map((p) => (
            <Link key={p.title} to={`/problems?q=${encodeURIComponent(p.title)}`}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
              <span style={{ color: '#6B7280' }}>{p.title}</span>
              <span className="text-[11px] font-semibold" style={{ color: p.dc }}>{p.difficulty}</span>
            </Link>
          ))}
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {LANGUAGES.map((lang) => (
            <span key={lang} className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {lang}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="pb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '946+', label: 'Curated Problems' },
            { value: '11',   label: 'Languages' },
            { value: '3',    label: 'Depth Levels' },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#4B5563' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="pb-20">
        <div className="text-center mb-12">
          <p className="section-heading mb-3">Why AlgoLens</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Built for how engineers actually learn
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#4B5563' }}>
            Not flashcards. Not memorization. Real pattern recognition through depth and comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-6 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-150 group-hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.6)' }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="pb-20">
        <div className="card overflow-hidden">
          <div className="px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="section-heading mb-1">Process</p>
            <h2 className="text-lg font-bold text-white">How it works</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
              <div className="hidden sm:block absolute top-5 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px"
                style={{ background: 'rgba(255,255,255,0.07)' }} />
              {steps.map((step) => (
                <div key={step.n} className="relative flex flex-col items-start sm:items-center sm:text-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center relative z-10"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4B5563' }}>{step.n}</p>
                    <p className="font-semibold text-white text-sm mb-1.5">{step.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="pb-16">
        <div className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: 'rgba(232,197,71,0.04)', border: '1px solid rgba(232,197,71,0.12)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,197,71,0.06) 0%, transparent 70%)' }} />
          <h2 className="text-xl font-bold text-white mb-2 relative z-10">Ready to go deeper?</h2>
          <p className="text-sm mb-6 relative z-10 max-w-sm mx-auto" style={{ color: '#6B7280' }}>
            Pick a classic problem or paste your own. Multiple approaches, zero fluff.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link to="/problems" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Start Now
            </Link>
            <Link to="/aptitude" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Try Aptitude Analyzer
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <p className="text-center text-[11px]" style={{ color: '#1F2937' }}>
          Phase 2 planned: code execution sandbox, progress tracking, practice tests.
        </p>
      </section>
    </div>
  )
}
