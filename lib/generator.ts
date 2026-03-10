import Groq from 'groq-sdk'

export interface Flashcard {
  question: string
  answer: string
}

export interface QuizQuestion {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation?: string
}

export interface StudySet {
  flashcards: Flashcard[]
  quizQuestions: QuizQuestion[]
}

function targetCounts(charCount: number): { flashcards: number; quiz: number } {
  // Scale linearly: ~2000 chars = short, ~20000 chars = long
  const t = Math.min(1, Math.max(0, (charCount - 2_000) / 18_000))
  return {
    flashcards: Math.round(10 + t * 10), // 10 → 20
    quiz: Math.round(8 + t * 4),          // 8  → 12
  }
}

export async function generateStudySet(extractedText: string): Promise<StudySet> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

  // Truncate to ~20k chars to stay within context limits
  const text = extractedText.slice(0, 20_000)
  const counts = targetCounts(text.length)

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert educator. Given source material, generate high-quality study aids in JSON.

Rules:
- Generate EXACTLY ${counts.flashcards} flashcards covering the most important concepts, definitions, and facts
- Generate EXACTLY ${counts.quiz} multiple-choice quiz questions testing real understanding
- All 4 options must be plausible — avoid obviously wrong distractors
- correct_answer must be exactly "A", "B", "C", or "D" matching the correct option
- Respond with ONLY valid JSON, no markdown, no explanation

Required JSON format:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ],
  "quizQuestions": [
    {
      "question": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A",
      "explanation": "..."
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Generate flashcards and quiz questions from this material:\n\n${text}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('No response from Groq')

  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quizQuestions)) {
    throw new Error('Invalid response structure from Groq')
  }

  return parsed as StudySet
}
