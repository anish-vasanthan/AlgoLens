import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Models in fallback order — try each on rate limit
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
]
const FAST_MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are an expert CS educator. You write correct algorithm code and explanations.
Always reply with valid JSON only — no markdown fences, no extra text outside the JSON.
CRITICAL: All string values inside JSON must use double quotes. Never use backticks inside JSON.
When writing code inside JSON, escape it as a regular JSON string with \\n for newlines.
Language rules (apply strictly):
C: #include <stdio.h>/<stdlib.h>, int arrays with size params, malloc/free, pointers. No classes.
Java: class Solution wrapper, import java.util.*, correct types (int[], HashMap<Integer,Integer>), .length for arrays, .size() for lists.
C++: include headers, std:: types, vector<int>.
C#: namespace/class, List<int>, Dictionary<int,int>.
TypeScript: typed annotations, no any.
Go: package main, []int, map[int]int.
Rust: Vec<i32>, HashMap<i32,i32>, use std::collections::HashMap.
Kotlin: fun, IntArray, mutableMapOf.
Swift: func, [Int], [Int:Int].`

/**
 * Call Groq with automatic model fallback on rate limit.
 * max_tokens kept at 6000 to stay within free tier TPM limits.
 */
export async function callGroqJSON(prompt, { temperature = 0.3 } = {}) {
  let lastError = null

  for (const model of MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        temperature,
        max_tokens: 6000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      })

      const raw = response.choices[0]?.message?.content || ''
      const parsed = parseJSON(raw)

      // For approaches endpoint, validate we got approaches back
      // For other endpoints (analyze, questions), any valid JSON is fine
      return parsed

    } catch (e) {
      lastError = e
      const status = e.status || 0
      if (status === 429 || status === 413 || status === 503) {
        const resetMatch = e.message?.match(/try again in ([\d\w.]+)/)
        const hint = resetMatch ? ` (retry in ${resetMatch[1]})` : ''
        console.warn(`[Groq] ${model} unavailable${hint} — trying fallback...`)
        continue
      }
      throw e
    }
  }

  const resetMatch = lastError?.message?.match(/try again in ([\d\w.]+)/)
  const hint = resetMatch ? ` Resets in ${resetMatch[1]}.` : ''
  throw new Error(
    `All AI models are currently rate-limited.${hint} ` +
    `Free tier: 6k tokens/min, 100k/day. Wait a moment and try again.`
  )
}

/**
 * Verification pass — non-fatal, uses smallest model.
 */
export async function callGroqVerification(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: FAST_MODEL,
      temperature: 0.1,
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'Complexity verifier. Valid JSON only.' },
        { role: 'user', content: prompt },
      ],
    })
    return parseJSON(response.choices[0]?.message?.content || '{}')
  } catch {
    return { verifications: [] }
  }
}

function parseJSON(raw) {
  // 1. Strip outer markdown fences if the whole response is wrapped
  const fenceMatch = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : raw.trim()

  // 2. Fix backtick-quoted strings (model sometimes uses `code` instead of "code")
  //    Replace backtick-delimited values with proper JSON strings
  const fixed = fixBacktickStrings(jsonStr)

  try {
    return JSON.parse(fixed)
  } catch {
    // 3. Last-ditch: extract outermost { ... }
    const start = fixed.indexOf('{')
    const end = fixed.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      try { return JSON.parse(fixed.slice(start, end + 1)) } catch { /* fall through */ }
    }
    throw new Error(`Malformed JSON from AI: ${fixed.slice(0, 200)}`)
  }
}

/**
 * Replace backtick-delimited strings with JSON-safe double-quoted strings.
 * Handles multiline backtick strings that models occasionally produce.
 */
function fixBacktickStrings(str) {
  // Replace: "key": `value` → "key": "value"
  // The backtick value may span multiple lines
  return str.replace(/:\s*`([\s\S]*?)`/g, (_, content) => {
    // Escape the content for JSON: escape backslashes, quotes, control chars
    const escaped = content
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r\n/g, '\\n')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\n')
      .replace(/\t/g, '\\t')
    return `: "${escaped}"`
  })
}
