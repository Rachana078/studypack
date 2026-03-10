'use client'

import { useState } from 'react'

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
}

interface QuizPlayerProps {
  questions: QuizQuestion[]
}

type Answer = 'A' | 'B' | 'C' | 'D'

const SCORE_EMOJI = (score: number, total: number) => {
  const pct = score / total
  if (pct === 1) return '🏆'
  if (pct >= 0.8) return '🎉'
  if (pct >= 0.6) return '👍'
  if (pct >= 0.4) return '📚'
  return '💪'
}

const SCORE_MSG = (score: number, total: number) => {
  const pct = score / total
  if (pct === 1) return 'Perfect score!'
  if (pct >= 0.8) return 'Great job!'
  if (pct >= 0.6) return 'Solid effort!'
  if (pct >= 0.4) return 'Keep studying!'
  return 'You got this — try again!'
}

export default function QuizPlayer({ questions }: QuizPlayerProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Answer | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🧠</div>
        <p className="text-gray-500">No quiz questions generated for this set.</p>
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-7xl mb-4">{SCORE_EMOJI(score, questions.length)}</div>
        <div className="text-5xl font-black text-gray-900 mb-1">{score}<span className="text-2xl text-gray-400">/{questions.length}</span></div>
        <div className="text-lg font-semibold text-pink-500 mb-1">{pct}% correct</div>
        <div className="text-gray-400 text-sm mb-8">{SCORE_MSG(score, questions.length)}</div>

        <div className="h-3 bg-pink-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <button
          onClick={() => { setIndex(0); setScore(0); setSelected(null); setFinished(false) }}
          className="rounded-full bg-gradient-to-r from-pink-400 to-violet-500 px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
        >
          Retake quiz
        </button>
      </div>
    )
  }

  const q = questions[index]
  const options: { label: Answer; text: string }[] = [
    { label: 'A', text: q.option_a },
    { label: 'B', text: q.option_b },
    { label: 'C', text: q.option_c },
    { label: 'D', text: q.option_d },
  ]
  const progress = ((index + 1) / questions.length) * 100

  function handleSelect(answer: Answer) {
    if (selected) return
    setSelected(answer)
    if (answer === q.correct_answer) setScore((s) => s + 1)
  }

  function handleNext() {
    setSelected(null)
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  function optionClass(label: Answer) {
    const base = 'w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm font-medium transition-all duration-150 flex items-center gap-3 '
    if (!selected) return base + 'border-pink-100 bg-white hover:border-pink-300 hover:bg-pink-50 text-gray-800 cursor-pointer'
    if (label === (q.correct_answer as Answer)) return base + 'border-violet-300 bg-violet-50 text-violet-800'
    if (label === selected) return base + 'border-rose-300 bg-rose-50 text-rose-800'
    return base + 'border-gray-100 bg-gray-50 text-gray-400 cursor-default'
  }

  function optionBadge(label: Answer) {
    const base = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 '
    if (!selected) return base + 'bg-pink-100 text-pink-500'
    if (label === (q.correct_answer as Answer)) return base + 'bg-violet-400 text-white'
    if (label === selected) return base + 'bg-rose-400 text-white'
    return base + 'bg-gray-100 text-gray-400'
  }

  const isCorrect = selected === q.correct_answer

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-48 bg-pink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-pink-400 tabular-nums">{index + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-pink-50 text-pink-500 rounded-full px-3 py-1 text-sm font-semibold">
          ⭐ {score}
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] p-6 shadow-sm">
        <p className="font-bold text-gray-900 text-base leading-snug mb-5">{q.question}</p>
        <div className="flex flex-col gap-2.5">
          {options.map(({ label, text }) => (
            <button key={label} onClick={() => handleSelect(label)} className={optionClass(label)} disabled={!!selected}>
              <span className={optionBadge(label)}>{label}</span>
              <span>{text}</span>
              {selected && label === (q.correct_answer as Answer) && <span className="ml-auto">✓</span>}
              {selected && label === selected && label !== (q.correct_answer as Answer) && <span className="ml-auto">✗</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {selected && (
        <div className={`rounded-xl px-4 py-3.5 text-sm font-medium ${isCorrect ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {isCorrect ? '🎉 ' : '💡 '}
          {q.explanation || (isCorrect ? 'Correct!' : `Correct answer: ${q.correct_answer}`)}
        </div>
      )}

      {selected && (
        <button
          onClick={handleNext}
          className="self-end rounded-full bg-gradient-to-r from-pink-400 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
        >
          {index + 1 >= questions.length ? 'See results →' : 'Next →'}
        </button>
      )}
    </div>
  )
}
