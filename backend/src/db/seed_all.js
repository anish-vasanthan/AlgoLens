import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { NEW_PROBLEMS } from './problems_data.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function run() {
  console.log(`Total new problems to insert: ${NEW_PROBLEMS.length}`)

  // Fetch existing titles to skip duplicates
  const { data: existing } = await supabase.from('problems').select('title')
  const existingSet = new Set((existing || []).map(p => p.title))
  console.log(`Already in DB: ${existingSet.size}`)

  const toInsert = NEW_PROBLEMS.filter(p => !existingSet.has(p.title))
  console.log(`Will insert: ${toInsert.length} new problems`)

  if (toInsert.length === 0) {
    console.log('Nothing to insert — all problems already exist.')
    return
  }

  // Insert in batches of 50
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50)
    const { error } = await supabase.from('problems').insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i/50)+1} error:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r  Inserted ${inserted}/${toInsert.length}...`)
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nDone! Inserted ${inserted} problems.`)

  // Final count per tag
  const { data: all } = await supabase.from('problems').select('tags, difficulty')
  const tagCount = {}
  const diffCount = {}
  for (const p of (all || [])) {
    for (const t of (p.tags || [])) tagCount[t] = (tagCount[t] || 0) + 1
    diffCount[p.difficulty] = (diffCount[p.difficulty] || 0) + 1
  }
  console.log('\nFinal counts by tag:')
  Object.entries(tagCount).sort((a,b) => b[1]-a[1]).forEach(([tag, count]) => {
    const bar = '█'.repeat(Math.min(Math.floor(count/10), 20))
    console.log(`  ${tag.padEnd(25)} ${String(count).padStart(4)}  ${bar}`)
  })
  console.log('\nBy difficulty:', diffCount)
}

run().catch(console.error)
