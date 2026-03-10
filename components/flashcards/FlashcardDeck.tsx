'use client'

import { useState } from 'react'

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardDeckProps {
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🃏</div>
        <p className="text-gray-500">No flashcards generated for this set.</p>
      </div>
    )
  }

  const card = flashcards[index]
  const progress = ((index + 1) / flashcards.length) * 100

  function next() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i + 1) % flashcards.length), 150)
  }

  function prev() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i - 1 + flashcards.length) % flashcards.length), 150)
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">

      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-pink-400 tabular-nums">
          {index + 1} / {flashcards.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full min-h-[260px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 p-8 flex flex-col justify-between shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-pink-100">Question</span>
            <p className="text-xl font-bold text-white leading-snug">{card.question}</p>
            <span className="text-pink-100 text-xs">Tap to reveal answer</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 p-8 flex flex-col justify-between shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-violet-100">Answer</span>
            <p className="text-xl font-bold text-white leading-snug">{card.answer}</p>
            <span className="text-violet-100 text-xs">Tap to see question</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full justify-center">
        <button
          onClick={prev}
          className="rounded-full border-2 border-pink-200 px-6 py-2.5 text-sm font-semibold text-pink-500 hover:bg-pink-50 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          className="rounded-full bg-gradient-to-r from-pink-400 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
