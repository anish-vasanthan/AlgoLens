/**
 * Local-storage based "Saved" store.
 * Supports two categories: 'programming' (approaches) and 'aptitude' (questions).
 */

const STORAGE_KEY_PROGRAMMING = 'algolens_saved_approaches'
const STORAGE_KEY_APTITUDE    = 'algolens_saved_aptitude'

// ── Generic helpers ───────────────────────────────────────────────────────────

function getAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

function persist(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // storage quota exceeded — silently ignore
  }
}

// ── Programming (approaches) ──────────────────────────────────────────────────

export function saveApproach(approach) {
  const key = approach.id || approach.approach_name
  const all = getAll(STORAGE_KEY_PROGRAMMING)
  all[key] = { ...approach, savedAt: Date.now() }
  persist(STORAGE_KEY_PROGRAMMING, all)
}

export function unsaveApproach(key) {
  const all = getAll(STORAGE_KEY_PROGRAMMING)
  delete all[key]
  persist(STORAGE_KEY_PROGRAMMING, all)
}

export function isApproachSaved(key) {
  return key ? Boolean(getAll(STORAGE_KEY_PROGRAMMING)[key]) : false
}

export function getAllSavedApproaches() {
  const all = getAll(STORAGE_KEY_PROGRAMMING)
  return Object.values(all).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

// Legacy alias kept for backwards compat
export function getAllSaved() {
  return getAllSavedApproaches()
}

export function clearAllSaved() {
  localStorage.removeItem(STORAGE_KEY_PROGRAMMING)
}

// ── Aptitude ──────────────────────────────────────────────────────────────────

export function saveAptitude(item) {
  // item = { question, analysis }  — we derive a key from the question text
  const key = item.key || item.question?.slice(0, 80)
  const all = getAll(STORAGE_KEY_APTITUDE)
  all[key] = { ...item, key, savedAt: Date.now() }
  persist(STORAGE_KEY_APTITUDE, all)
}

export function unsaveAptitude(key) {
  const all = getAll(STORAGE_KEY_APTITUDE)
  delete all[key]
  persist(STORAGE_KEY_APTITUDE, all)
}

export function isAptitudeSaved(key) {
  return key ? Boolean(getAll(STORAGE_KEY_APTITUDE)[key]) : false
}

export function getAllSavedAptitude() {
  const all = getAll(STORAGE_KEY_APTITUDE)
  return Object.values(all).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

export function clearAllAptitude() {
  localStorage.removeItem(STORAGE_KEY_APTITUDE)
}
