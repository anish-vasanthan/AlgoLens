import { useState, useEffect, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { checkUsername } from '../lib/api'

function validateUsername(u) {
  if (!u) return null
  if (u.length < 3) return 'At least 3 characters'
  if (u.length > 20) return 'Max 20 characters'
  if (!/^[a-zA-Z0-9]+$/.test(u)) return 'Letters and numbers only, no spaces or symbols'
  if (!/[a-zA-Z]/.test(u)) return 'Must include at least one letter'
  if (!/[0-9]/.test(u)) return 'Must include at least one number (e.g. anish42)'
  return null
}

function validateDisplayName(n) {
  if (!n || !n.trim()) return 'Name is required'
  if (n.trim().length > 40) return 'Max 40 characters'
  return null
}

const ROLES = [
  {
    id: 'student', label: 'Student', desc: 'Learning DSA and preparing for interviews',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  },
  {
    id: 'teacher', label: 'Teacher', desc: 'Teaching or mentoring others in programming',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  },
]

export default function OnboardingPage() {
  const { saveProfile } = useUser()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [role, setRole]               = useState('')
  const [error, setError]             = useState('')
  const [serverError, setServerError] = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)
  const nameRef = useRef(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  // Auto-suggest username from display name
  const handleDisplayNameChange = (val) => {
    setDisplayName(val)
    setError(''); setServerError('')
    // Auto-fill username if it's still empty or was auto-generated
    if (!username || username === slugify(displayName)) {
      const suggested = slugify(val)
      if (suggested !== username) {
        handleUsernameChange(suggested)
      }
    }
  }

  // Convert display name to a username suggestion: "Anish Kumar" → "anish42" style
  // Just lowercase + strip non-alphanumeric, truncate to 15 chars
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)
  }

  const handleUsernameChange = (val) => {
    const v = val.replace(/\s/g, '')
    setUsername(v)
    setError(''); setServerError('')
    setUsernameStatus(null)
    if (!v) return
    const validErr = validateUsername(v)
    if (validErr) { setUsernameStatus('invalid'); return }
    clearTimeout(debounceRef.current)
    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { available } = await checkUsername(v)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setServerError('')

    const nameErr = validateDisplayName(displayName)
    if (nameErr) { setError(nameErr); return }

    if (!username.trim()) { setError('Please enter a username'); return }
    const uErr = validateUsername(username.trim())
    if (uErr) { setError(uErr); return }
    if (usernameStatus === 'taken')    { setError('That username is already taken'); return }
    if (usernameStatus === 'checking') { setError('Please wait — checking availability…'); return }
    if (usernameStatus === 'invalid')  { setError(validateUsername(username.trim()) || 'Invalid username'); return }
    if (!role) { setError('Please select your role'); return }

    setSaving(true)
    try {
      await saveProfile(username.trim(), displayName.trim(), role)
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Something went wrong'
      if (e.response?.status === 409 || msg.toLowerCase().includes('taken')) {
        setUsernameStatus('taken')
        setServerError('That username is already taken. Try a different one.')
      } else {
        setServerError(msg)
      }
      setSaving(false)
    }
  }

  const inputBorder = (status) => {
    if (status === 'available') return 'rgba(34,197,94,0.4)'
    if (status === 'taken' || status === 'invalid') return 'rgba(239,68,68,0.4)'
    if (status === 'checking') return 'rgba(232,197,71,0.3)'
    return 'rgba(255,255,255,0.08)'
  }

  const UsernameStatus = () => {
    if (!username) return null
    if (usernameStatus === 'checking') return (
      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#E8C547' }}>
        <Spinner size={3} />Checking...
      </span>
    )
    if (usernameStatus === 'available') return (
      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#22C55E' }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        Available
      </span>
    )
    if (usernameStatus === 'taken') return (
      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#EF4444' }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        Already taken
      </span>
    )
    if (usernameStatus === 'invalid') return (
      <span className="text-[11px]" style={{ color: '#EF4444' }}>{validateUsername(username)}</span>
    )
    return null
  }

  const displayError = error || serverError
  const canSubmit = !saving && usernameStatus !== 'checking' && usernameStatus !== 'taken' && usernameStatus !== 'invalid'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080909' }}>
      <div className="bg-ambient" />
      <div className="bg-ambient-mid" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: '#E8C547', boxShadow: '0 8px 28px rgba(232,197,71,0.3)' }}>
              <svg className="w-7 h-7" style={{ color: '#080909' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AlgoLens</h1>
            <p className="text-sm" style={{ color: '#4B5563' }}>Learn every algorithm approach. Understand every trade-off.</p>
          </div>

          {/* Card */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-1">Create your profile</h2>
            <p className="text-sm mb-7" style={{ color: '#4B5563' }}>No email needed — takes 15 seconds.</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Display Name */}
              <div>
                <label className="section-label" htmlFor="displayName">Your Name</label>
                <input
                  ref={nameRef}
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={e => handleDisplayNameChange(e.target.value)}
                  placeholder="e.g. Anish Kumar"
                  maxLength={40}
                  autoComplete="name"
                  className="input w-full text-base py-3"
                />
                <p className="text-[11px] mt-1.5" style={{ color: '#374151' }}>
                  This is what we'll show in the app — can be anything.
                </p>
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="section-label mb-0" htmlFor="username">Username</label>
                  <UsernameStatus />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="e.g. anish42, code99, dev007"
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  className="input w-full text-base py-3"
                  style={{ borderColor: inputBorder(usernameStatus) }}
                />
                <p className="text-[11px] mt-1.5" style={{ color: '#374151' }}>
                  Unique ID — letters and numbers only, must include both (e.g. anish42).
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="section-label">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button key={r.id} type="button"
                      onClick={() => { setRole(r.id); setError('') }}
                      className="relative flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center"
                      style={{
                        background:   role === r.id ? 'rgba(232,197,71,0.07)' : 'rgba(255,255,255,0.02)',
                        borderColor:  role === r.id ? 'rgba(232,197,71,0.35)' : 'rgba(255,255,255,0.08)',
                        transform:    role === r.id ? 'translateY(-1px)' : 'none',
                        boxShadow:    role === r.id ? '0 4px 20px rgba(232,197,71,0.1)' : 'none',
                      }}>
                      {role === r.id && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#E8C547' }}>
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#080909' }}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span style={{ color: role === r.id ? '#E8C547' : 'rgba(255,255,255,0.3)' }}>{r.icon}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: role === r.id ? '#E8C547' : 'rgba(255,255,255,0.6)' }}>{r.label}</p>
                        <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#374151' }}>{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {displayError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                  <svg className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs" style={{ color: '#EF4444' }}>{displayError}</p>
                </div>
              )}

              <button type="submit" disabled={!canSubmit}
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
                {saving
                  ? <><Spinner />Setting up...</>
                  : <>Start Learning <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></>
                }
              </button>
            </form>
          </div>

          {/* Feature pills */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {['946+ Problems', '11 Languages', 'AI Approaches', 'No Email'].map(f => (
              <div key={f} className="text-center py-2.5 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner({ size = 4 }) {
  return (
    <svg className={`animate-spin w-${size} h-${size}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
