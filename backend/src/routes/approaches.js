import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { callGroqJSON, callGroqVerification } from '../lib/groq.js'
import { buildApproachesPrompt, buildVerificationPrompt, buildInterviewQuestionsPrompt } from '../lib/prompts.js'

const router = Router()

// ── POST /api/approaches ──────────────────────────────────────────────────────
// Get or generate approaches for a problem.
// Body: { problemId?, language, difficulty, customStatement? }
router.post('/', async (req, res, next) => {
  try {
    const { problemId, language, difficulty, customStatement } = req.body

    if (!language) return res.status(400).json({ error: 'language is required' })
    if (!problemId && !customStatement) {
      return res.status(400).json({ error: 'Either problemId or customStatement is required' })
    }

    // ── 1. Check cache ────────────────────────────────────────────────────────
    if (problemId) {
      const { data: cached } = await supabase
        .from('approaches')
        .select('*')
        .eq('problem_id', problemId)
        .eq('language', language)
        .order('created_at', { ascending: true })

      if (cached && cached.length > 0) {
        // Also pull interview questions
        const ids = cached.map((a) => a.id)
        const { data: questions } = await supabase
          .from('interview_questions')
          .select('*')
          .in('approach_id', ids)

        const withQuestions = cached.map((a) => ({
          ...a,
          interview_questions: (questions || []).filter((q) => q.approach_id === a.id),
        }))

        return res.json({ approaches: withQuestions, source: 'cache' })
      }
    }

    // ── 2. Get problem statement ──────────────────────────────────────────────
    let problemStatement = customStatement
    let isCurated = false

    if (problemId) {
      const { data: problem, error } = await supabase
        .from('problems')
        .select('statement, is_curated')
        .eq('id', problemId)
        .single()

      if (error) return res.status(404).json({ error: 'Problem not found' })
      problemStatement = problem.statement
      isCurated = problem.is_curated
    }

    // ── 3. Call Groq ──────────────────────────────────────────────────────────
    const prompt = buildApproachesPrompt({ problemStatement, language, difficulty: difficulty || 'Intermediate' })
    let aiResult

    try {
      aiResult = await callGroqJSON(prompt)
    } catch (e) {
      return res.status(502).json({
        error: 'AI model failed to generate approaches. Please try again.',
        detail: e.message,
      })
    }

    const rawApproaches = aiResult.approaches || []
    if (rawApproaches.length === 0) {
      return res.status(502).json({ error: 'AI returned no approaches. Please try again.' })
    }
    // ── 4. Verification pass ──────────────────────────────────────────────────
    let verifications = []
    try {
      const vPrompt = buildVerificationPrompt(rawApproaches)
      const vResult = await callGroqVerification(vPrompt)
      verifications = vResult.verifications || []
    } catch {
      // Non-fatal — proceed without verification
    }

    // Merge verification flags
    const verifiedApproaches = rawApproaches.map((a, i) => {
      const v = verifications.find((v) => v.index === i)
      return {
        ...a,
        complexity_verified: v ? (v.time_ok && v.space_ok) : null,
        time_flag: v?.time_flag || null,
        space_flag: v?.space_flag || null,
        is_verified: isCurated,
        language,
      }
    })

    // ── 5. Persist to DB ──────────────────────────────────────────────────────
    let savedApproaches = verifiedApproaches

    if (problemId) {
      try {
        const rows = verifiedApproaches.map((a) => ({
          problem_id: problemId,
          language,
          approach_name: a.approach_name,
          explanation: a.explanation,
          algorithm_steps: a.algorithm_steps,
          code: a.code,
          dry_run_trace: a.dry_run_trace,
          time_complexity: a.time_complexity,
          time_justification: a.time_justification,
          space_complexity: a.space_complexity,
          space_justification: a.space_justification,
          pros: a.pros,
          cons: a.cons,
          best_use_case: a.best_use_case,
          is_verified: isCurated,
          complexity_verified: a.complexity_verified,
          time_flag: a.time_flag,
          space_flag: a.space_flag,
        }))

        const { data: inserted, error: insertError } = await supabase
          .from('approaches')
          .insert(rows)
          .select()

        if (!insertError && inserted) {
          // Save interview questions
          const questionRows = []
          inserted.forEach((dbApproach, i) => {
            const qs = verifiedApproaches[i]?.interview_questions || []
            qs.forEach((q) => {
              questionRows.push({
                approach_id: dbApproach.id,
                question_text: typeof q === 'string' ? q : q.question_text,
              })
            })
          })

          if (questionRows.length > 0) {
            await supabase.from('interview_questions').insert(questionRows)
          }

          // Return with IDs
          savedApproaches = inserted.map((dbA, i) => ({
            ...dbA,
            interview_questions: verifiedApproaches[i]?.interview_questions || [],
          }))
        }
      } catch {
        // Non-fatal: return generated approaches without persisting
      }
    }

    res.json({
      approaches: savedApproaches,
      source: 'ai',
      is_ai_generated: !isCurated,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/approaches/:id/questions ─────────────────────────────────────────
router.get('/:id/questions', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('approach_id', req.params.id)

    if (error) throw error
    res.json({ questions: data })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/approaches/:id/questions/generate ───────────────────────────────
router.post('/:id/questions/generate', async (req, res, next) => {
  try {
    const { approachName, problemStatement } = req.body

    if (!approachName || !problemStatement) {
      return res.status(400).json({ error: 'approachName and problemStatement are required' })
    }

    // Check if already exist
    const { data: existing } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('approach_id', req.params.id)

    if (existing && existing.length > 0) {
      return res.json({ questions: existing })
    }

    // Generate
    const prompt = buildInterviewQuestionsPrompt({ approachName, problemStatement })
    let result
    try {
      result = await callGroqJSON(prompt, { temperature: 0.5 })
    } catch (e) {
      return res.status(502).json({ error: 'AI failed to generate questions. Please retry.', detail: e.message })
    }

    const questions = result.questions || []

    // Persist if approach has a real ID
    const approachId = req.params.id
    if (approachId && approachId !== 'temp') {
      const rows = questions.map((q) => ({
        approach_id: approachId,
        question_text: q,
      }))
      try {
        const { data: saved } = await supabase
          .from('interview_questions')
          .insert(rows)
          .select()
        if (saved) return res.json({ questions: saved })
      } catch {
        // fall through
      }
    }

    res.json({ questions })
  } catch (err) {
    next(err)
  }
})

export default router
