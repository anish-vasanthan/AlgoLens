import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProgrammingHistory, getAptitudeHistory,
  clearProgrammingHistory, clearAptitudeHistory,
} from '../lib/history'

const DIFF_COLOR = {
  Easy:   '#22C55E',
  Medium: '#F59E0B',
  Hard:   '#EF4444',
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7)  return `${d}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function HistoryPanel({ open, onClose }) {
  const [tab, setTab] = useState('programming')
  const [programming, setProgramming] = useState([])
  const [aptitude, setAptitude]       = useState([])
  const panelRef = useRef(null)
  const navigate = useNavigate()

  // Reload history every time panel opens
  useEffect(() => {
    if (open) {
      setProgramming(getProgrammingHistory())
      setAptitude(getAptitudeHistory())
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleClearProgramming = () => {
    if (confirm('Clear all programming history?')) {
      clearProgrammingHistory(); setProgramming([])
    }
  }
  const handleClearAptitude = () => {
    if (confirm('Clear all aptitude history?')) {
      clearAptitudeHistory(); setAptitude([])
    }
  }

  const goToProblem = (entry) => {
    onClose()
    if (entry.problemId) {
      navigate(`/problems/${entry.problemId}`)
    } else {
      navigate(`/solve?statement=${encodeURIComponent(entry.statement || '')}`)
    }
  }

  const goToAptitude = (entry) => {
    onClose()
    // Pass question via sessionStorage so AptitudePage can pre-fill it
    try {
      sessionStorage.setItem('algolens_aptitude_prefill', entry.question)
    } catch {}
    navigate('/aptitude')
  }

  const list = tab === 'programming' ? programming : aptitude
  const totalCount = programming.length + aptitude.length

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: '360px',
          maxWidth: '95vw',
          background: 'rgba(10,11,12,0.99)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.7)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">History</p>
              <p className="text-[10px]" style={{ color: '#374151' }}>
                {totalCount} item{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            {
              id: 'programming', label: 'Programming', count: programming.length,
              icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
            },
            {
              id: 'aptitude', label: 'Aptitude', count: aptitude.length,
              icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
            },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-1 justify-center transition-all duration-150"
              style={tab === t.id
                ? { background: 'rgba(255,255,255,0.09)', color: '#ffffff' }
                : { color: '#4B5563' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = '#4B5563' }}>
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                No {tab} history yet
              </p>
              <p className="text-xs" style={{ color: '#374151' }}>
                {tab === 'programming'
                  ? 'Generate approaches on any problem to see them here.'
                  : 'Analyze an aptitude question to see it here.'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {list.map((entry, i) => (
                <HistoryItem
                  key={i}
                  entry={entry}
                  type={tab}
                  onClick={() => tab === 'programming' ? goToProblem(entry) : goToAptitude(entry)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer clear button */}
        {list.length > 0 && (
          <div className="shrink-0 px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={tab === 'programming' ? handleClearProgramming : handleClearAptitude}
              className="w-full py-2 text-xs font-semibold rounded-xl border transition-all duration-150"
              style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.5)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = 'rgba(239,68,68,0.5)' }}>
              Clear {tab} history
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function HistoryItem({ entry, type, onClick }) {
  const [hovered, setHovered] = useState(false)
  const diffColor = DIFF_COLOR[entry.difficulty] || DIFF_COLOR[entry.diff] || null

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition-colors duration-100 group"
      style={{ background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150"
          style={{
            background: hovered ? 'rgba(232,197,71,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hovered ? 'rgba(232,197,71,0.25)' : 'rgba(255,255,255,0.07)'}`,
          }}>
          {type === 'programming'
            ? <svg className="w-3.5 h-3.5" style={{ color: hovered ? '#E8C547' : 'rgba(255,255,255,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            : <svg className="w-3.5 h-3.5" style={{ color: hovered ? '#E8C547' : 'rgba(255,255,255,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium leading-snug truncate transition-colors duration-150"
            style={{ color: hovered ? '#ffffff' : 'rgba(255,255,255,0.7)' }}>
            {type === 'programming' ? entry.title : (entry.title || entry.question?.slice(0, 55))}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {type === 'programming' && entry.language && (
              <span className="text-[10px] font-medium"
                style={{ color: '#4B5563' }}>{entry.language}</span>
            )}
            {type === 'programming' && entry.language && entry.difficulty && (
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            )}
            {entry.difficulty && diffColor && (
              <span className="text-[10px] font-semibold" style={{ color: diffColor }}>{entry.difficulty}</span>
            )}
            {type === 'aptitude' && entry.category && (
              <>
                {entry.difficulty && <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>}
                <span className="text-[10px]" style={{ color: '#4B5563' }}>{entry.category}</span>
              </>
            )}
            {entry.timestamp && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                <span className="text-[10px]" style={{ color: '#374151' }}>{timeAgo(entry.timestamp)}</span>
              </>
            )}
          </div>

          {/* Statement preview for programming */}
          {type === 'programming' && entry.statement && (
            <p className="text-[11px] mt-1 line-clamp-1 leading-relaxed" style={{ color: '#374151' }}>
              {entry.statement}
            </p>
          )}
        </div>

        {/* Arrow */}
        <svg className="w-3.5 h-3.5 shrink-0 mt-1 transition-all duration-150"
          style={{ color: hovered ? 'rgba(255,255,255,0.4)' : 'transparent' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
