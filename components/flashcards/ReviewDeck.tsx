'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface Flashcard {
  id: string
  question: string
  answer: string
  interval_days: number
  ease_factor: number
  review_count: number
}

interface ReviewDeckProps {
  flashcards: Flashcard[]
  studySetId: string
}

type Rating = 'hard' | 'good' | 'easy'

export default function ReviewDeck({ flashcards, studySetId }: ReviewDeckProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [ratings, setRatings] = useState<Rating[]>([])

  useEffect(() => setMounted(true), [])

  const isDark  = mounted && theme === 'dark'
  const isLight = mounted && theme === 'light'
  const isPink  = mounted && theme === 'pink'

  const frontFace = !mounted || isPink
    ? 'bg-gradient-to-br from-pink-300 to-violet-300'
    : isLight ? 'bg-white border-2 border-gray-200'
    : 'bg-gray-800 border border-gray-700'

  const backFace = !mounted || isPink
    ? 'bg-gradient-to-br from-violet-300 to-fuchsia-300'
    : isLight ? 'bg-gray-50 border-2 border-gray-200'
    : 'bg-gray-900 border border-gray-700'

  const textOnCard = !mounted || isPink ? 'text-white' : isLight ? 'text-gray-900' : 'text-gray-100'
  const mutedOnCard = !mounted || isPink ? 'text-pink-100' : isLight ? 'text-gray-400' : 'text-gray-500'

  const progressFill = isPink
    ? 'bg-gradient-to-r from-pink-300 to-purple-300'
    : isDark ? 'bg-white' : 'bg-gray-700'

  if (done) {
    const easyCount = ratings.filter(r => r === 'easy').length
    const goodCount = ratings.filter(r => r === 'good').length
    const hardCount = ratings.filter(r => r === 'hard').length

    return (
      <div className="max-w-md mx-auto text-center py-16 flex flex-col items-center gap-4">
        <div className="text-6xl mb-2">🎯</div>
        <h2 className="text-2xl font-black text-[var(--text)]">Review complete!</h2>
        <p className="text-[var(--muted)] text-sm">You reviewed {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}.</p>

        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <p className="text-2xl font-black text-green-500">{easyCount}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Easy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-500">{goodCount}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Good</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-500">{hardCount}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Hard</p>
          </div>
        </div>

        <a
          href={`/study-sets/${studySetId}`}
          className={`mt-4 rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity ${
            isPink ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'
            : isDark ? 'bg-white text-gray-900'
            : 'bg-gray-800 text-white'
          }`}
        >
          Back to study set
        </a>
      </div>
    )
  }

  const card = flashcards[index]
  const progress = ((index) / flashcards.length) * 100

  async function rate(rating: Rating) {
    setRatings(r => [...r, rating])
    await fetch(`/api/flashcards/${card.id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    })
    if (index + 1 >= flashcards.length) {
      setDone(true)
    } else {
      setFlipped(false)
      setTimeout(() => setIndex(i => i + 1), 150)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">

      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressFill}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--muted)] tabular-nums">{index + 1} / {flashcards.length}</span>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div
          className="relative w-full min-h-[260px] transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-2xl ${frontFace} p-8 flex flex-col justify-between shadow-lg`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className={`text-xs font-bold uppercase tracking-widest ${mutedOnCard}`}>Question</span>
            <p className={`text-xl font-bold leading-snug ${textOnCard}`}>{card.question}</p>
            <span className={`text-xs ${mutedOnCard}`}>Tap to reveal answer</span>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-2xl ${backFace} p-8 flex flex-col justify-between shadow-lg`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className={`text-xs font-bold uppercase tracking-widest ${mutedOnCard}`}>Answer</span>
            <p className={`text-xl font-bold leading-snug ${textOnCard}`}>{card.answer}</p>
            <span className={`text-xs ${mutedOnCard}`}>How well did you know this?</span>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show after flip */}
      {flipped ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => rate('hard')}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isDark ? 'border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40'
              : isLight ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            😓 Hard
          </button>
          <button
            onClick={() => rate('good')}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isDark ? 'border-blue-800 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40'
              : isLight ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100'
            }`}
          >
            🙂 Good
          </button>
          <button
            onClick={() => rate('easy')}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isDark ? 'border-green-800 bg-green-900/20 text-green-400 hover:bg-green-900/40'
              : isLight ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
              : 'border-green-200 bg-green-50 text-green-500 hover:bg-green-100'
            }`}
          >
            😊 Easy
          </button>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">Tap the card to reveal the answer, then rate yourself</p>
      )}
    </div>
  )
}
