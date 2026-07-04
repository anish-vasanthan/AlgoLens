import { Router } from 'express'
import { supabase, verifyToken } from '../lib/supabase.js'

const router = Router()

// Middleware: require auth
async function requireAuth(req, res, next) {
  const user = await verifyToken(req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Authentication required' })
  req.user = user
  next()
}

// GET /api/favorites
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        approach_id,
        created_at,
        approaches (
          id,
          approach_name,
          explanation,
          time_complexity,
          space_complexity,
          is_verified,
          language,
          problems ( id, title, difficulty )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// POST /api/favorites
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { approachId } = req.body
    if (!approachId) return res.status(400).json({ error: 'approachId is required' })

    // Upsert to avoid duplicates
    const { data, error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: req.user.id, approach_id: approachId },
        { onConflict: 'user_id,approach_id' }
      )
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/favorites/:approachId
router.delete('/:approachId', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.user.id)
      .eq('approach_id', req.params.approachId)

    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
