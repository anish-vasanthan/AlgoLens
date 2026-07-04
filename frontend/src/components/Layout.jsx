import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import HistoryPanel from './HistoryPanel'

const NAV_ITEMS = [
  {
    to: '/problems', label: 'Problem Bank',
    matchPrefix: '/problems',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  },
  {
    to: '/solve', label: 'Custom Problem',
    matchPrefix: '/solve',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  },
  {
    to: '/aptitude', label: 'Aptitude',
    matchPrefix: '/aptitude',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    to: '/saved', label: 'Saved',
    matchPrefix: '/saved',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  },
]

export default function Layout() {
  const { profile, editProfile } = useUser()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const roleLabel = profile?.role === 'teacher' ? 'Teacher' : 'Student'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-ambient" />
      <div className="bg-ambient-mid" />

      {/* History panel (portal-like, sits above everything) */}
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          background: scrolled ? 'rgba(8,9,9,0.96)' : 'rgba(8,9,9,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ background: '#E8C547', boxShadow: '0 2px 8px rgba(232,197,71,0.3)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: '#080909' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-bold text-[15px] text-white tracking-tight">AlgoLens</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(({ to, label, icon, matchPrefix }) => {
                const isActive = location.pathname === to || (matchPrefix && location.pathname.startsWith(matchPrefix) && location.pathname !== '/')
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 text-[13px] font-medium transition-all duration-150 px-3 py-1.5 rounded-lg ${
                      isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                    style={isActive ? { background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' } : {}}
                  >
                    <span style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'currentColor' }}>{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side — History + Profile */}
            <div className="flex items-center gap-2">

              {/* History button */}
              <button
                onClick={() => setHistoryOpen(true)}
                title="View history"
                className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
                style={{
                  color: historyOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
                  background: historyOpen ? 'rgba(255,255,255,0.09)' : 'transparent',
                  border: historyOpen ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!historyOpen) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                  }
                }}
                onMouseLeave={e => {
                  if (!historyOpen) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Profile button */}
              {profile && (
                <button onClick={editProfile}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: '#E8C547', color: '#080909' }}>
                    {(profile.displayName || profile.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[13px] text-neutral-200 font-medium max-w-[90px] truncate">{profile.displayName || profile.username}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                    style={profile?.role === 'teacher'
                      ? { color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }
                      : { color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    {roleLabel}
                  </span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)', background: mobileOpen ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 space-y-0.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,9,9,0.98)' }}>
            {NAV_ITEMS.map(({ to, label, icon, matchPrefix }) => {
                const isActive = location.pathname === to || (matchPrefix && location.pathname.startsWith(matchPrefix) && location.pathname !== '/')
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive ? 'text-white' : 'text-neutral-500 hover:text-white'
                    }`}
                    style={isActive ? { background: 'rgba(255,255,255,0.07)' } : {}}
                  >
                    <span style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'currentColor' }}>{icon}</span>
                    {label}
                  </Link>
                )
              })}

            {/* Mobile history button */}
            <button
              onClick={() => { setMobileOpen(false); setHistoryOpen(true) }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>

            {profile && (
              <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={editProfile}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-xl transition-colors hover:bg-white/[0.04]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#E8C547', color: '#080909' }}>{(profile.displayName || profile.username || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm text-neutral-200 font-medium">{profile.displayName || profile.username}</p>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{roleLabel} · Edit profile</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      {/* ── Footer ── */}
      <footer className="py-8 mt-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: '#E8C547' }}>
              <svg className="w-2.5 h-2.5" style={{ color: '#080909' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: '#374151' }}>AlgoLens</span>
            <span className="text-xs" style={{ color: '#1F2937' }}>— Learn through approaches, not just answers.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-verified">Curated</span>
            <span className="badge-ai">AI-generated</span>
            <span className="text-xs" style={{ color: '#1F2937' }}>always distinguished</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
