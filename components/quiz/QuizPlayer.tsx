'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

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
  studySetId?: string
}

type Answer = 'A' | 'B' | 'C' | 'D'

interface ShuffledQuestion extends QuizQuestion {
  shuffled_options: { label: Answer; text: string }[]
  shuffled_correct: Answer
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildShuffled(questions: QuizQuestion[]): ShuffledQuestion[] {
  return shuffle(questions).map(q => {
    const opts = [
      { label: 'A' as Answer, text: q.option_a },
      { label: 'B' as Answer, text: q.option_b },
      { label: 'C' as Answer, text: q.option_c },
      { label: 'D' as Answer, text: q.option_d },
    ]
    const correctText = opts.find(o => o.label === q.correct_answer)!.text
    const shuffledOpts = shuffle(opts).map((o, i) => ({
      ...o,
      label: (['A', 'B', 'C', 'D'] as Answer[])[i],
    }))
    return {
      ...q,
      shuffled_options: shuffledOpts,
      shuffled_correct: shuffledOpts.find(o => o.text === correctText)!.label,
    }
  })
}

const SCORE_EMOJI = (score: number, total: number) => {
  const pct = score / total
  if (pct === 1)    return '🏆'
  if (pct >= 0.8)   return '🎉'
  if (pct >= 0.6)   return '👍'
  if (pct >= 0.4)   return '📚'
  return '💪'
}

const SCORE_MSG = (score: number, total: number) => {
  const pct = score / total
  if (pct === 1)    return 'Perfect score!'
  if (pct >= 0.8)   return 'Great job!'
  if (pct >= 0.6)   return 'Solid effort!'
  if (pct >= 0.4)   return 'Keep studying!'
  return 'You got this — try again!'
}

export default function QuizPlayer({ questions, studySetId }: QuizPlayerProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [shuffled] = useState<ShuffledQuestion[]>(() => buildShuffled(questions))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Answer | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark  = mounted && theme === 'dark'
  const isLight = mounted && theme === 'light'
  const isPink  = mounted && theme === 'pink'

  const progressFill = isPink
    ? 'bg-gradient-to-r from-pink-300 to-purple-300'
    : isDark ? 'bg-white' : 'bg-gray-700'

  const actionBtnClass = isPink
    ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'
    : isDark ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🧠</div>
        <p className="text-[var(--muted)]">No quiz questions generated for this set.</p>
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-7xl mb-4">{SCORE_EMOJI(score, questions.length)}</div>
        <div className="text-5xl font-black text-[var(--text)] mb-1">
          {score}<span className="text-2xl text-[var(--muted)]">/{questions.length}</span>
        </div>
        <div className="text-lg font-semibold text-[var(--accent)] mb-1">{pct}% correct</div>
        <div className="text-[var(--muted)] text-sm mb-8">{SCORE_MSG(score, questions.length)}</div>

        <div className="h-3 bg-[var(--surface-2)] rounded-full overflow-hidden mb-8">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressFill}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <button
          onClick={() => { setIndex(0); setScore(0); setSelected(null); setFinished(false) }}
          className={`rounded-full px-8 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm ${actionBtnClass}`}
        >
          Retake quiz
        </button>
      </div>
    )
  }

  const q = shuffled[index]
  const options = q.shuffled_options
  const progress = ((index + 1) / shuffled.length) * 100
  const isCorrect = selected === q.shuffled_correct

  function optionClass(label: Answer) {
    const base = 'w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm font-medium transition-all duration-150 flex items-center gap-3 '
    if (!selected) {
      if (isDark)  return base + 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--muted)] text-[var(--text)] cursor-pointer'
      return base + 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)] hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer'
    }
    if (label === (q.shuffled_correct)) {
      return base + (isDark ? 'border-green-700 bg-green-900/30 text-green-400' : 'border-green-400 bg-green-50 text-green-800')
    }
    if (label === selected) {
      return base + (isDark ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-red-400 bg-red-50 text-red-700')
    }
    return base + (isDark ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] cursor-default' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-default')
  }

  function optionBadge(label: Answer) {
    const base = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 '
    if (!selected) {
      if (isDark) return base + 'bg-[var(--surface)] text-[var(--muted)]'
      return base + 'bg-[var(--surface-2)] text-[var(--muted)]'
    }
    if (label === (q.shuffled_correct)) return base + 'bg-green-500 text-white'
    if (label === selected)                     return base + 'bg-red-500 text-white'
    return base + (isDark ? 'bg-[var(--surface)] text-[var(--muted)]' : 'bg-gray-100 text-gray-400')
  }

  function handleSelect(answer: Answer) {
    if (selected) return
    setSelected(answer)
    if (answer === q.shuffled_correct) setScore((s) => s + 1)
  }

  function handleNext() {
    setSelected(null)
    if (index + 1 >= shuffled.length) {
      setFinished(true)
      fetch('/api/streak', { method: 'POST' })
      if (studySetId) {
        fetch('/api/quiz-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ study_set_id: studySetId, score, total: shuffled.length }),
        })
      }
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-48 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressFill}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-[var(--muted)] tabular-nums">{index + 1}/{shuffled.length}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--surface-2)] text-[var(--text)] rounded-full px-3 py-1 text-sm font-semibold">
          ⭐ {score}
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl bg-[var(--surface)] border-2 border-[var(--border)] p-6 shadow-sm">
        <p className="font-bold text-[var(--text)] text-base leading-snug mb-5">{q.question}</p>
        <div className="flex flex-col gap-2.5">
          {options.map(({ label, text }) => (
            <button key={label} onClick={() => handleSelect(label)} className={optionClass(label)} disabled={!!selected}>
              <span className={optionBadge(label)}>{label}</span>
              <span>{text}</span>
              {selected && label === (q.shuffled_correct) && <span className="ml-auto">✓</span>}
              {selected && label === selected && label !== (q.shuffled_correct) && <span className="ml-auto">✗</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {selected && (
        <div className={`rounded-xl px-4 py-3.5 text-sm font-medium ${
          isCorrect
            ? isDark ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'
            : isDark ? 'bg-red-900/20 text-red-400 border border-red-800'       : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isCorrect ? '🎉 ' : '💡 '}
          {q.explanation || (isCorrect ? 'Correct!' : `Correct answer: ${q.shuffled_correct}`)}
        </div>
      )}

      {selected && (
        <button
          onClick={handleNext}
          className={`self-end rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm ${actionBtnClass}`}
        >
          {index + 1 >= shuffled.length ? 'See results →' : 'Next →'}
        </button>
      )}
    </div>
  )
}
