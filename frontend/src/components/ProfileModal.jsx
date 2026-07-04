import { useState, useEffect, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { checkUsername } from '../lib/api'

function validateUsername(u) {
  if (!u) return null
  if (u.length < 3) return 'At least 3 characters'
  if (u.length > 20) return 'Max 20 characters'
  if (!/^[a-zA-Z0-9]+$/.test(u)) return 'Letters and numbers only'
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
    id: 'student', label: 'Student',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  },
  {
    id: 'teacher', label: 'Teacher',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  },
]

export default function ProfileModal() {
  const { profile, saveProfile, closeEdit, logout } = useUser()

  const [displayName,    setDisplayName]    = useState(profile?.displayName ?? '')
  const [username,       setUsername]       = useState(profile?.username    ?? '')
  const [role,           setRole]           = useState(profile?.role        ?? '')
  const [usernameStatus, setUsernameStatus] = useState('available')
  const [error,          setError]          = useState('')
  const [saving,         setSaving]         = useState(false)
  const [showLogout,     setShowLogout]     = useState(false)
  const debounceRef  = useRef(null)
  const backdropRef  = useRef(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeEdit() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeEdit])

  const handleUsernameChange = (val) => {
    const v = val.replace(/\s/g, '')
    setUsername(v); setError(''); setUsernameStatus(null)
    if (!v) return
    const validErr = validateUsername(v)
    if (validErr) { setUsernameStatus('invalid'); return }
    if (v.toLowerCase() === profile?.username?.toLowerCase()) {
      setUsernameStatus('available'); return
    }
    clearTimeout(debounceRef.current)
    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { available } = await checkUsername(v)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setError('')
    const dnErr = validateDisplayName(displayName)
    if (dnErr) { setError(dnErr); return }
    if (!username.trim()) { setError('Please enter a username'); return }
    const uErr = validateUsername(username.trim())
    if (uErr) { setError(uErr); return }
    if (usernameStatus === 'taken')    { setError('That username is already taken'); return }
    if (usernameStatus === 'checking') { setError('Please wait — checking availability…'); return }
    if (!role) { setError('Please select your role'); return }

    setSaving(true)
    try {
      await saveProfile(username.trim(), displayName.trim(), role)
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Something went wrong'
      if (e.response?.status === 409 || msg.toLowerCase().includes('taken')) {
        setUsernameStatus('taken')
        setError('That username is already taken. Try a different one.')
      } else {
        setError(msg)
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
      <span className="flex items-center gap-1 text-[11px]" style={{ color: '#E8C547' }}>
        <Spinner /><span>Checking...</span>
      </span>
    )
    if (usernameStatus === 'available') return (
      <span className="flex items-center gap-1 text-[11px]" style={{ color: '#22C55E' }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        Available
      </span>
    )
    if (usernameStatus === 'taken') return (
      <span className="flex items-center gap-1 text-[11px]" style={{ color: '#EF4444' }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        Taken
      </span>
    )
    if (usernameStatus === 'invalid') return (
      <span className="text-[11px]" style={{ color: '#EF4444' }}>{validateUsername(username)}</span>
    )
    return null
  }

  const hasChanges =
    displayName.trim() !== (profile?.displayName ?? '') ||
    username.trim()    !== (profile?.username    ?? '') ||
    role               !== (profile?.role        ?? '')

  const roleGrad = profile?.role === 'teacher'
    ? 'linear-gradient(135deg,#F59E0B,#D97706)'
    : 'linear-gradient(135deg,#E8C547,#D4A800)'

  return (
    <div ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) closeEdit() }}>

      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-up"
        style={{ background: 'rgba(10,11,12,0.99)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
              style={{ background: roleGrad, color: '#080909', boxShadow: '0 4px 12px rgba(232,197,71,0.25)' }}>
              {(profile?.displayName || profile?.username || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-[15px]">{profile?.displayName}</p>
              <p className="text-[11px] font-medium" style={{ color: '#4B5563' }}>
                @{profile?.username} · <span className="capitalize">{profile?.role}</span>
              </p>
            </div>
          </div>
          <button onClick={closeEdit} className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="px-6 py-6 space-y-4">

          {/* Display Name */}
          <div>
            <label className="section-label">Your Name</label>
            <input type="text" value={displayName}
              onChange={e => { setDisplayName(e.target.value); setError('') }}
              placeholder="e.g. Anish Kumar"
              maxLength={40}
              className="input w-full py-2.5"
            />
            <p className="text-[11px] mt-1" style={{ color: '#374151' }}>Shown in the app — can be anything.</p>
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="section-label mb-0">Username</label>
              <UsernameStatus />
            </div>
            <input type="text" value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              maxLength={20} autoComplete="off" spellCheck={false}
              placeholder="e.g. anish42"
              className="input w-full py-2.5"
              style={{ borderColor: inputBorder(usernameStatus) }}
            />
            <p className="text-[11px] mt-1" style={{ color: '#374151' }}>
              Unique ID — letters + numbers, must include both.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="section-label">Role</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 text-left"
                  style={{
                    background:  role === r.id ? 'rgba(232,197,71,0.07)' : 'rgba(255,255,255,0.02)',
                    borderColor: role === r.id ? 'rgba(232,197,71,0.35)' : 'rgba(255,255,255,0.07)',
                  }}>
                  <span style={{ color: role === r.id ? '#E8C547' : 'rgba(255,255,255,0.3)' }}>{r.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: role === r.id ? '#E8C547' : 'rgba(255,255,255,0.5)' }}>{r.label}</span>
                  {role === r.id && (
                    <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#E8C547' }}>
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#080909' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <svg className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeEdit} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button type="submit"
              disabled={saving || !hasChanges || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
              {saving ? <><Spinner />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

        {/* Sign out */}
        <div className="px-6 py-5">
          {!showLogout ? (
            <button onClick={() => setShowLogout(true)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150"
              style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out / Switch account
            </button>
          ) : (
            <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <p className="text-sm font-semibold text-white mb-1">Sign out?</p>
              <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
                Your saved approaches stay in this browser. You'll need to create a new profile to continue.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1 py-2 text-xs">Keep profile</button>
                <button onClick={logout}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border transition-all duration-150"
                  style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
