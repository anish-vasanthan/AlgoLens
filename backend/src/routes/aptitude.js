import { Router } from 'express'
import { callGroqJSON } from '../lib/groq.js'
import { buildAptitudeAnalysisPrompt } from '../lib/prompts.js'

const router = Router()

// POST /api/aptitude — analyze an aptitude question
router.post('/', async (req, res, next) => {
  try {
    const { questionText } = req.body
    if (!questionText?.trim()) {
      return res.status(400).json({ error: 'questionText is required' })
    }

    const prompt = buildAptitudeAnalysisPrompt({ questionText })

    try {
      const result = await callGroqJSON(prompt, { temperature: 0.2 })
      res.json({ analysis: result })
    } catch (e) {
      return res.status(502).json({
        error: 'AI analysis failed. Please try again.',
        detail: e.message,
      })
    }
  } catch (err) {
    next(err)
  }
})

export default router
