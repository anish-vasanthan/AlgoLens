import { Router } from 'express'
import { callGroqJSON } from '../lib/groq.js'
import { buildProblemAnalysisPrompt } from '../lib/prompts.js'

const router = Router()

// POST /api/analyze — analyze a custom problem statement
router.post('/', async (req, res, next) => {
  try {
    const { problemStatement } = req.body
    if (!problemStatement?.trim()) {
      return res.status(400).json({ error: 'problemStatement is required' })
    }

    const prompt = buildProblemAnalysisPrompt({ problemStatement })

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
