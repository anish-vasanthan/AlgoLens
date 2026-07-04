import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
})

// ── Problem Bank ──────────────────────────────────────────────────────────────

export async function getProblems(params = {}) {
  const { data } = await api.get('/problems', { params })
  return data
}

export async function getProblemById(id) {
  const { data } = await api.get(`/problems/${id}`)
  return data
}

// ── Approaches ────────────────────────────────────────────────────────────────

export async function getApproaches({ problemId, language, difficulty, customStatement }) {
  const { data } = await api.post('/approaches', { problemId, language, difficulty, customStatement })
  return data
}

// ── Interview Questions ───────────────────────────────────────────────────────

export async function getInterviewQuestions(approachId) {
  const { data } = await api.get(`/approaches/${approachId}/questions`)
  return data
}

export async function generateInterviewQuestions({ approachId, approachName, problemStatement }) {
  const { data } = await api.post(
    `/approaches/${approachId}/questions/generate`,
    { approachName, problemStatement }
  )
  return data
}

// ── Problem Analysis ──────────────────────────────────────────────────────────

export async function analyzeProblem(problemStatement) {
  const { data } = await api.post('/analyze', { problemStatement })
  return data
}

// ── Aptitude Analysis ─────────────────────────────────────────────────────────

export async function analyzeAptitude(questionText) {
  const { data } = await api.post('/aptitude', { questionText })
  return data
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function saveUserProfile({ name, displayName, role, deviceId }) {
  const { data } = await api.post('/users', { name, displayName, role, deviceId })
  return data
}

export async function getUserProfile(deviceId) {
  try {
    const { data } = await api.get(`/users/${deviceId}`)
    return data
  } catch (e) {
    if (e.response?.status === 404) return { user: null }
    throw e
  }
}

export async function checkUsername(username) {
  try {
    const { data } = await api.get(`/users/check/${encodeURIComponent(username)}`)
    return data // { available: bool }
  } catch {
    return { available: true } // fail open
  }
}

export default api
