import { createContext, useContext, useState, useEffect } from 'react'
import { saveUserProfile, getUserProfile, signInByUsername } from '../lib/api'

const UserContext = createContext(null)

const DEVICE_KEY  = 'algolens_device_id'
const PROFILE_KEY = 'algolens_profile'

function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

export function UserProvider({ children }) {
  // null = loading | false = no profile (show onboarding) | object = profile set
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function init() {
      // 1. Instant cache hit
      try {
        const cached = localStorage.getItem(PROFILE_KEY)
        if (cached) { setProfile(JSON.parse(cached)); return }
      } catch { /* malformed JSON — fall through */ }

      // 2. Try backend
      try {
        const deviceId = getOrCreateDeviceId()
        const { user } = await getUserProfile(deviceId)
        if (user) {
          const p = {
            username:    user.name,
            displayName: user.display_name || user.name, // fallback for old accounts
            role:        user.role,
            id:          user.id,
          }
          localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
          setProfile(p)
        } else {
          setProfile(false)
        }
      } catch {
        setProfile(false)
      }
    }
    init()
  }, [])

  /**
   * saveProfile(username, displayName, role)
   * Throws on error so calling components can show feedback.
   */
  const saveProfile = async (username, displayName, role) => {
    const deviceId = getOrCreateDeviceId()

    const { user } = await saveUserProfile({
      name:        username.trim(),
      displayName: displayName.trim(),
      role,
      deviceId,
    })

    const p = {
      username:    username.trim(),
      displayName: displayName.trim(),
      role,
      id:          user?.id,
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    setProfile(p)
    setEditing(false)
  }

  const editProfile = () => setEditing(true)
  const closeEdit   = () => setEditing(false)

  const logout = () => {
    localStorage.removeItem(PROFILE_KEY)
    setEditing(false)
    setProfile(false)
  }

  /** signIn — look up existing account by username, reassign to this device */
  const signIn = async (username) => {
    const deviceId = getOrCreateDeviceId()
    const { user } = await signInByUsername(username.trim(), deviceId)
    const p = {
      username:    user.name,
      displayName: user.display_name || user.name,
      role:        user.role,
      id:          user.id,
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  return (
    <UserContext.Provider value={{ profile, saveProfile, signIn, editProfile, closeEdit, editing, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
