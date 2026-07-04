/**
 * History store — tracks recently generated problems and aptitude questions.
 * Stored in localStorage. Max 50 entries per type.
 */

const KEYS = {
  programming: 'algolens_history_programming',
  aptitude:    'algolens_history_aptitude',
}
const MAX = 50

function getAll(type) {
  try {
    return JSON.parse(localStorage.getItem(KEYS[type]) || '[]')
  } catch { return [] }
}

function persist(type, data) {
  try { localStorage.setItem(KEYS[type], JSON.stringify(data)) } catch {}
}

/**
 * Add a programming history entry.
 * @param {{ title: string, statement: string, language: string, difficulty: string, problemId?: string }} entry
 */
export function addProgrammingHistory(entry) {
  const all = getAll('programming')
  // Deduplicate by title+language — move to top if already exists
  const filtered = all.filter(e =>
    !(e.title === entry.title && e.language === entry.language)
  )
  filtered.unshift({ ...entry, timestamp: Date.now() })
  persist('programming', filtered.slice(0, MAX))
}

/**
 * Add an aptitude history entry.
 * @param {{ question: string, title?: string, category?: string, difficulty?: string }} entry
 */
export function addAptitudeHistory(entry) {
  const all = getAll('aptitude')
  // Deduplicate by question text
  const filtered = all.filter(e => e.question !== entry.question)
  filtered.unshift({ ...entry, timestamp: Date.now() })
  persist('aptitude', filtered.slice(0, MAX))
}

export function getProgrammingHistory() { return getAll('programming') }
export function getAptitudeHistory()    { return getAll('aptitude') }

export function clearProgrammingHistory() { localStorage.removeItem(KEYS.programming) }
export function clearAptitudeHistory()    { localStorage.removeItem(KEYS.aptitude) }
