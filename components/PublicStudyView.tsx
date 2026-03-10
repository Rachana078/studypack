'use client'

import { useState } from 'react'
import FlashcardDeck from '@/components/flashcards/FlashcardDeck'
import QuizPlayer from '@/components/quiz/QuizPlayer'

interface Flashcard {
  id: string
  question: string
  answer: string
}

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

interface Props {
  flashcards: Flashcard[]
  questions: QuizQuestion[]
}

const TABS = ['Flashcards', 'Quiz'] as const
type Tab = typeof TABS[number]

export default function PublicStudyView({ flashcards, questions }: Props) {
  const [tab, setTab] = useState<Tab>('Flashcards')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t === 'Flashcards' ? `🗂️ Flashcards (${flashcards.length})` : `🧠 Quiz (${questions.length})`}
          </button>
        ))}
      </div>

      {tab === 'Flashcards' && <FlashcardDeck flashcards={flashcards} />}
      {tab === 'Quiz'       && <QuizPlayer questions={questions} />}
    </div>
  )
}
