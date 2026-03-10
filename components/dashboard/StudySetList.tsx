'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface StudySet {
  id: string
  title: string
  created_at: string
}

interface StudySetListProps {
  studySets: StudySet[]
}

const PINK_GRADIENTS = [
  'from-pink-300 to-rose-300',
  'from-violet-300 to-purple-300',
  'from-rose-300 to-pink-300',
  'from-fuchsia-300 to-violet-300',
  'from-pink-300 to-fuchsia-300',
  'from-purple-300 to-pink-300',
]

const LIGHT_GRADIENTS = [
  'from-slate-100 to-gray-200',
  'from-gray-100 to-slate-200',
  'from-zinc-100 to-gray-200',
  'from-slate-200 to-zinc-100',
  'from-gray-200 to-slate-100',
  'from-zinc-200 to-slate-200',
]

const DARK_GRADIENTS = [
  'from-gray-800 to-gray-900',
  'from-zinc-800 to-gray-900',
  'from-neutral-800 to-zinc-900',
  'from-gray-900 to-zinc-800',
  'from-zinc-900 to-neutral-800',
  'from-neutral-900 to-gray-800',
]

export default function StudySetList({ studySets }: StudySetListProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (studySets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-[var(--text)] text-lg font-medium mb-2">No study sets yet</p>
        <p className="text-[var(--muted)] text-sm mb-6">Upload a PDF or DOCX to get started</p>
        <Link
          href="/upload"
          className="inline-block rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition-opacity"
        >
          Upload your first file
        </Link>
      </div>
    )
  }

  const gradients =
    !mounted         ? null :
    theme === 'light' ? LIGHT_GRADIENTS :
    theme === 'dark'  ? DARK_GRADIENTS  :
    PINK_GRADIENTS

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {studySets.map((set, i) => {
        // Before mount: neutral surface card (no gradient) — same on server & client
        if (!gradients) {
          return (
            <Link
              key={set.id}
              href={`/study-sets/${set.id}`}
              className="group rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-6"
            >
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-bold text-[var(--text)] text-base leading-snug line-clamp-2">{set.title}</h3>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </Link>
          )
        }

        const gradient = gradients[i % gradients.length]
        const isLight = theme === 'light'
        const isDark  = theme === 'dark'

        return (
          <Link
            key={set.id}
            href={`/study-sets/${set.id}`}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            <div className="relative p-6">
              <div className="text-3xl mb-3">📖</div>
              <h3 className={`font-bold text-base leading-snug line-clamp-2 ${isLight ? 'text-gray-800' : isDark ? 'text-gray-100' : 'text-white'}`}>
                {set.title}
              </h3>
              <p className={`mt-2 text-xs ${isLight ? 'text-gray-500' : isDark ? 'text-gray-400' : 'text-white/70'}`}>
                {new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
