// Language-specific type rules (kept very short to save tokens)
const LANG_RULES = {
  C: 'Use: #include <stdio.h> #include <stdlib.h> #include <string.h>. Use int arrays with size param, malloc/free for dynamic memory, pointers for pass-by-reference. No classes or objects.',
  Java: 'Use: public class Solution{}, import java.util.*; int[]/.length, List<Integer>/.size(), HashMap<Integer,Integer> map.put/get/containsKey. No Python syntax.',
  'C++': 'Use: #include<vector> #include<unordered_map>, std::vector<int>, std::unordered_map. No Python syntax.',
  'C#': 'Use: class Solution{}, int[], List<int>, Dictionary<int,int>, var locals.',
  TypeScript: 'Use: number[], Map<number,number>, typed params/returns, const/let, no any.',
  Go: 'Use: package main, func name(args) ret{}, []int, map[int]int. No classes.',
  Rust: 'Use: fn name(args)->ret{}, Vec<i32>, use std::collections::HashMap; HashMap<i32,i32>.',
  Kotlin: 'Use: fun name(args): ret{}, IntArray, MutableMap<Int,Int>=mutableMapOf().',
  Swift: 'Use: func name(_ args: [Int]) -> Int{}, [Int], [Int:Int].',
}

export function buildApproachesPrompt({ problemStatement, language, difficulty }) {
  const langRule = LANG_RULES[language] || ''
  const depthNote =
    difficulty === 'Beginner' ? 'Add inline comments in code.' :
    difficulty === 'Advanced' ? 'Include edge cases in code.' :
    'Clean readable code.'

  return `Problem: ${problemStatement}
Language: ${language}. ${langRule}
Difficulty: ${difficulty}. ${depthNote}

Return JSON with 2-3 approaches (brute-force first, then optimized). Schema:
{"approaches":[{"approach_name":"","explanation":"2-3 sentences","algorithm_steps":["step1","step2","step3"],"code":"full correct ${language} code","sample_io":[{"input":"concrete example input e.g. nums = [2,7,11,15], target = 9","output":"expected output e.g. [0,1]","explanation":"brief why e.g. nums[0]+nums[1]=9"}],"dry_run_trace":"show concrete input, step-by-step state, final result. Label: TRACED not executed","time_complexity":"O(?)","time_justification":"why","space_complexity":"O(?)","space_justification":"why","pros":[""],"cons":[""],"best_use_case":"","interview_questions":["q1","q2"]}]}

Rules: each approach uses different paradigm. dry_run_trace uses real values. sample_io must have 1-2 concrete examples. Return ONLY the JSON.`
}

export function buildVerificationPrompt(approaches) {
  const checks = approaches.map((a, i) => ({
    i, name: a.approach_name,
    time: a.time_complexity, space: a.space_complexity,
    code: a.code?.slice(0, 200),
  }))
  return `Check complexity vs code. Return ONLY: {"verifications":[{"index":0,"time_ok":true,"space_ok":true}]}
Data: ${JSON.stringify(checks)}`
}

export function buildInterviewQuestionsPrompt({ approachName, problemStatement }) {
  return `3-5 interview follow-up questions for "${approachName}" approach to: ${problemStatement}
Return ONLY: {"questions":["q1","q2","q3"]}`
}

/**
 * Analyze a custom problem statement — deep structured breakdown.
 */
export function buildProblemAnalysisPrompt({ problemStatement }) {
  return `You are a CS teacher. Deeply analyze this coding problem and explain it clearly.

Problem: ${problemStatement}

Return ONLY this JSON (no markdown, no extra text):
{
  "title": "short 2-5 word title",
  "problem_summary": "2-3 sentences restating the problem in plain English — what exactly needs to be done",
  "real_world_scenario": "2-3 sentences describing a relatable real-world situation this problem models. E.g. 'Imagine you have a playlist of songs and you want to find the 3 consecutive songs with the highest combined play count...'",
  "input_format": [
    {"name": "variable name", "type": "data type e.g. int[], string, int", "description": "what this input represents in the real-world context"}
  ],
  "output_format": {"type": "return type", "description": "what the output represents and what it means"},
  "step_by_step_io": [
    {
      "step": 1,
      "action": "what happens at this step — describe the transformation or check",
      "state": "what the data looks like after this step — use concrete values from the example"
    }
  ],
  "example": {
    "input": "concrete example input values",
    "output": "expected output",
    "explanation": "walk through why this input produces this output using actual values"
  },
  "constraints": ["constraint 1 e.g. 1 <= n <= 10^5", "constraint 2"],
  "edge_cases": ["edge case 1 to watch out for", "edge case 2"],
  "key_observations": ["insight 1 that hints at the efficient approach", "insight 2"]
}`
}

/**
 * Analyze an aptitude/reasoning/math question and produce a full breakdown.
 */
export function buildAptitudeAnalysisPrompt({ questionText }) {
  return `You are an expert aptitude trainer. Deeply analyze this aptitude/reasoning/math question.

Question: ${questionText}

Return ONLY this JSON (no markdown, no extra text):
{
  "title": "short 3-6 word title for this question",
  "category": "one of: Arithmetic, Percentage, Ratio & Proportion, Time & Work, Time Speed Distance, Probability, Permutation & Combination, Profit & Loss, Simple & Compound Interest, Number System, Logical Reasoning, Data Interpretation, Verbal Reasoning, Spatial Reasoning, Other",
  "difficulty": "Easy | Medium | Hard",
  "what_is_asked": "1-2 sentences: exactly what the question wants you to find",
  "key_concepts": ["concept 1 needed to solve this", "concept 2"],
  "given_information": [
    {"label": "what this value represents", "value": "the actual value from the question"}
  ],
  "to_find": "what exactly needs to be calculated or determined",
  "solution_steps": [
    {
      "step": 1,
      "description": "what you do in this step",
      "calculation": "the actual math or logic, e.g. Speed = Distance / Time = 120 / 2 = 60",
      "result": "result of this step"
    }
  ],
  "final_answer": "the complete final answer with units",
  "shortcut_trick": "1-2 sentences describing any shortcut or trick formula that makes this faster",
  "common_mistakes": ["mistake 1 students commonly make", "mistake 2"],
  "similar_variations": ["variation 1: how the question could be modified", "variation 2"],
  "formula_used": "the key formula(s) applied in this solution"
}`
}