'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardDeckProps {
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ flashcards: initial }: FlashcardDeckProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [cards, setCards] = useState(initial)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [editing, setEditing] = useState(false)
  const streakCalled = useRef(false)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editing) return
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFlipped(f => !f)
      }
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, cards.length])

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🃏</div>
        <p className="text-[var(--muted)]">No flashcards generated for this set.</p>
      </div>
    )
  }

  const card = cards[index]
  const progress = ((index + 1) / cards.length) * 100

  const isDark  = mounted && theme === 'dark'
  const isLight = mounted && theme === 'light'
  const isPink  = mounted && theme === 'pink'

  // Card face styles
  const frontFace = !mounted || isPink
    ? 'bg-gradient-to-br from-pink-300 to-violet-300'
    : isLight
    ? 'bg-white border-2 border-gray-200'
    : 'bg-gray-800 border border-gray-700'

  const backFace = !mounted || isPink
    ? 'bg-gradient-to-br from-violet-300 to-fuchsia-300'
    : isLight
    ? 'bg-gray-50 border-2 border-gray-200'
    : 'bg-gray-900 border border-gray-700'

  const frontLabel = !mounted || isPink ? 'text-pink-100'   : isLight ? 'text-gray-400' : 'text-gray-500'
  const frontText  = !mounted || isPink ? 'text-white'      : isLight ? 'text-gray-900' : 'text-gray-100'
  const frontHint  = !mounted || isPink ? 'text-pink-200'   : isLight ? 'text-gray-400' : 'text-gray-500'
  const backLabel  = !mounted || isPink ? 'text-violet-100' : isLight ? 'text-gray-400' : 'text-gray-500'
  const backText   = !mounted || isPink ? 'text-white'      : isLight ? 'text-gray-900' : 'text-gray-100'
  const backHint   = !mounted || isPink ? 'text-violet-200' : isLight ? 'text-gray-400' : 'text-gray-500'

  function next() {
    setFlipped(false)
    setEditing(false)
    if (index === cards.length - 1 && !streakCalled.current) {
      streakCalled.current = true
      fetch('/api/streak', { method: 'POST' })
    }
    setTimeout(() => setIndex((i) => (i + 1) % cards.length), 150)
  }

  function prev() {
    setFlipped(false)
    setEditing(false)
    setTimeout(() => setIndex((i) => (i - 1 + cards.length) % cards.length), 150)
  }

  function startEdit() {
    setFlipped(false)
    setEditQuestion(card.question)
    setEditAnswer(card.answer)
    setEditing(true)
  }

  async function saveEdit() {
    const q = editQuestion.trim()
    const a = editAnswer.trim()
    if (!q || !a) return
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, question: q, answer: a } : c))
    setEditing(false)
    await fetch(`/api/flashcards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, answer: a }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">

      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isPink ? 'bg-gradient-to-r from-pink-300 to-purple-300' : isDark ? 'bg-[var(--text)]' : 'bg-[var(--accent)]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--muted)] tabular-nums">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => !editing && setFlipped((f) => !f)}
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
            className={`absolute inset-0 rounded-2xl ${frontFace} p-8 flex flex-col justify-between shadow-lg`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className={`text-xs font-bold uppercase tracking-widest ${frontLabel}`}>Question</span>
            <p className={`text-xl font-bold leading-snug ${frontText}`}>{card.question}</p>
            <span className={`text-xs ${frontHint}`}>Tap to reveal answer</span>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-2xl ${backFace} p-8 flex flex-col justify-between shadow-lg`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className={`text-xs font-bold uppercase tracking-widest ${backLabel}`}>Answer</span>
            <p className={`text-xl font-bold leading-snug ${backText}`}>{card.answer}</p>
            <span className={`text-xs ${backHint}`}>Tap to see question</span>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-[var(--muted)] text-center">
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono">Space</kbd> to flip &nbsp;·&nbsp;
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono">←</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono">→</kbd> to navigate
      </p>

      {/* Controls */}
      <div className="flex gap-3 w-full justify-center">
        <button
          onClick={prev}
          className="rounded-full border-2 border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={startEdit}
          className="rounded-full border-2 border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={next}
          className={`rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm ${isPink ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white' : isDark ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--accent)] text-white'}`}
        >
          Next →
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <p className="text-sm font-semibold text-[var(--text)]">Edit this card</p>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5 uppercase tracking-wide">Question</label>
            <textarea
              value={editQuestion}
              onChange={e => setEditQuestion(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5 uppercase tracking-wide">Answer</label>
            <textarea
              value={editAnswer}
              onChange={e => setEditAnswer(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="rounded-full bg-gradient-to-r from-pink-300 to-purple-300 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
