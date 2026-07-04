import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import problemsRouter from './routes/problems.js'
import approachesRouter from './routes/approaches.js'
import favoritesRouter from './routes/favorites.js'
import usersRouter from './routes/users.js'
import analyzeRouter from './routes/analyze.js'
import aptitudeRouter from './routes/aptitude.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/problems', problemsRouter)
app.use('/api/approaches', approachesRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/users', usersRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/aptitude', aptitudeRouter)

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 AlgoLens backend running on http://localhost:${PORT}`)
})
