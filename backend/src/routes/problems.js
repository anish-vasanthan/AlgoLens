import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// GET /api/problems — list with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { q, tag, difficulty } = req.query

    let query = supabase
      .from('problems')
      .select('id, title, statement, tags, difficulty, is_curated')
      .order('title', { ascending: true })

    if (q) {
      query = query.ilike('title', `%${q}%`)
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query
    if (error) throw error

    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/problems/:id — single problem
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('id, title, statement, tags, difficulty, is_curated')
      .eq('id', req.params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Problem not found' })
      throw error
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
