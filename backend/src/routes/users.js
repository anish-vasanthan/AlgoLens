import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Username: 3–20 chars, alphanumeric, must include at least one letter + one digit */
function isValidUsername(u) {
  return /^[a-zA-Z0-9]{3,20}$/.test(u) && /[a-zA-Z]/.test(u) && /[0-9]/.test(u)
}

/** Display name: 1–40 chars, anything except leading/trailing whitespace */
function isValidDisplayName(d) {
  return typeof d === 'string' && d.trim().length >= 1 && d.trim().length <= 40
}

// ── POST /api/users — create or update profile ────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, displayName, role, deviceId } = req.body

    // username validation
    if (!name?.trim()) return res.status(400).json({ error: 'Username is required' })
    if (!isValidUsername(name.trim())) {
      return res.status(400).json({
        error: 'Username must be 3–20 characters, letters and numbers only, and must include both a letter and a number (e.g. anish42)',
      })
    }

    // display name validation
    if (!displayName?.trim()) return res.status(400).json({ error: 'Name is required' })
    if (!isValidDisplayName(displayName)) {
      return res.status(400).json({ error: 'Name must be 1–40 characters' })
    }

    if (!role || !['student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or teacher' })
    }
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' })

    // Check username taken by a DIFFERENT device
    const { data: existing } = await supabase
      .from('app_users')
      .select('id, device_id')
      .eq('name', name.trim())
      .maybeSingle()

    if (existing && existing.device_id !== deviceId) {
      return res.status(409).json({ error: 'That username is already taken. Try a different one.' })
    }

    const { data, error } = await supabase
      .from('app_users')
      .upsert(
        {
          name:         name.trim(),
          display_name: displayName.trim(),
          role,
          device_id:    deviceId,
          updated_at:   new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      )
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message?.includes('name')) {
        return res.status(409).json({ error: 'That username is already taken. Try a different one.' })
      }
      console.warn('[users] DB error:', error.message)
      // Fallback — return local data even if DB fails
      return res.json({ user: { name: name.trim(), display_name: displayName.trim(), role, device_id: deviceId } })
    }

    res.json({ user: data })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/users/check/:username — MUST be before /:deviceId ───────────────
router.get('/check/:username', async (req, res, next) => {
  try {
    const username = req.params.username?.trim()
    if (!username) return res.json({ available: false })

    const { data } = await supabase
      .from('app_users')
      .select('device_id')
      .eq('name', username)
      .maybeSingle()

    res.json({ available: !data })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/users/signin/:username — sign in by username ────────────────────
// Looks up account by username, reassigns it to the current device.
router.get('/signin/:username', async (req, res, next) => {
  try {
    const username = req.params.username?.trim()
    const deviceId = req.query.deviceId

    if (!username) return res.status(400).json({ error: 'Username is required' })
    if (!deviceId) return res.status(400).json({ error: 'deviceId is required' })

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, name, display_name, role, device_id, created_at')
      .eq('name', username)
      .maybeSingle()

    if (error) throw error
    if (!user) return res.status(404).json({ error: 'Username not found. Check your username or create a new account.' })

    // Re-associate this device with the account (allows signing in from a new device)
    await supabase
      .from('app_users')
      .update({ device_id: deviceId, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    res.json({ user: { ...user, device_id: deviceId } })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/users/:deviceId — fetch profile by device ───────────────────────
router.get('/:deviceId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, name, display_name, role, created_at')
      .eq('device_id', req.params.deviceId)
      .single()

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return res.json({ user: null })
      }
      throw error
    }

    res.json({ user: data })
  } catch (err) {
    next(err)
  }
})

export default router
