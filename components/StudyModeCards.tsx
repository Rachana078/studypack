'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface Props {
  id: string
  flashcardCount: number
  quizCount: number
}

export default function StudyModeCards({ id, flashcardCount, quizCount }: Props) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Before mount: neutral cards — identical on server and client, no mismatch
  if (!mounted) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { href: `/study-sets/${id}/flashcards`, icon: '🗂️', label: 'Flashcards', sub: `${flashcardCount} cards to review`, cta: 'Start studying →' },
          { href: `/study-sets/${id}/quiz`,       icon: '🧠', label: 'Quiz',       sub: `${quizCount} questions`,           cta: 'Test yourself →' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-8 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">{card.icon}</div>
            <p className="text-xl font-bold text-[var(--text)]">{card.label}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{card.sub}</p>
            <div className="mt-6 text-sm font-medium text-[var(--muted)]">{card.cta}</div>
          </Link>
        ))}
      </div>
    )
  }

  const flashcardGradient =
    theme === 'light' ? 'from-slate-100 to-gray-200' :
    theme === 'dark'  ? 'from-gray-800 to-gray-900'  :
    'from-pink-300 to-violet-400'

  const quizGradient =
    theme === 'light' ? 'from-gray-100 to-slate-200' :
    theme === 'dark'  ? 'from-zinc-800 to-gray-900'  :
    'from-rose-300 to-pink-400'

  const isLight = theme === 'light'
  const isDark  = theme === 'dark'
  const textColor = isLight || isDark === false && theme === 'pink' ? 'text-gray-800' : isDark ? 'text-gray-100' : 'text-gray-800'
  const subColor  = isLight ? 'text-gray-500' : isDark ? 'text-gray-400' : 'text-gray-600'
  const linkColor = isLight ? 'text-gray-600' : isDark ? 'text-gray-300' : 'text-gray-700'

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {[
        { href: `/study-sets/${id}/flashcards`, icon: '🗂️', label: 'Flashcards', sub: `${flashcardCount} cards to review`, cta: 'Start studying →', gradient: flashcardGradient },
        { href: `/study-sets/${id}/quiz`,       icon: '🧠', label: 'Quiz',       sub: `${quizCount} questions`,           cta: 'Test yourself →', gradient: quizGradient       },
      ].map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
          <div className="relative p-8">
            <div className="text-5xl mb-4">{card.icon}</div>
            <p className={`text-xl font-bold ${textColor}`}>{card.label}</p>
            <p className={`mt-1 text-sm ${subColor}`}>{card.sub}</p>
            <div className={`mt-6 inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all ${linkColor}`}>
              {card.cta}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
