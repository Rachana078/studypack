'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

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

export default function StudySetList({ studySets: initial }: StudySetListProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sets, setSets] = useState(initial)
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    const close = () => setOpenMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  function startRename(set: StudySet) {
    setOpenMenuId(null)
    setRenamingId(set.id)
    setRenameValue(set.title)
  }

  async function submitRename(id: string) {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    setSets(prev => prev.map(s => s.id === id ? { ...s, title: trimmed } : s))
    setRenamingId(null)
    await fetch(`/api/study-sets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    setOpenMenuId(null)
    if (!confirm('Delete this study set? This cannot be undone.')) return
    setSets(prev => prev.filter(s => s.id !== id))
    await fetch(`/api/study-sets/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (sets.length === 0) {
    const emptyBtnClass = mounted && theme === 'dark'
      ? 'bg-white text-gray-900'
      : mounted && theme === 'light'
      ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white'
      : 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'

    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-[var(--text)] text-lg font-medium mb-2">No study sets yet</p>
        <p className="text-[var(--muted)] text-sm mb-6">Upload a PDF or DOCX to get started</p>
        <Link
          href="/upload"
          className={`inline-block rounded-full px-6 py-3 text-sm font-semibold shadow hover:opacity-90 transition-opacity ${emptyBtnClass}`}
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

  const filtered = query.trim()
    ? sets.filter(s => s.title.toLowerCase().includes(query.toLowerCase().trim()))
    : sets

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search study sets..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Empty search state */}
      {filtered.length === 0 && query && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-[var(--text)] font-medium mb-1">No study sets found</p>
          <p className="text-[var(--muted)] text-sm">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((set, i) => {
        const isRenaming = renamingId === set.id
        const menuOpen = openMenuId === set.id
        const gradient = gradients ? gradients[i % gradients.length] : null
        const isLight = theme === 'light'
        const isDark  = theme === 'dark'
        const titleColor = !gradients ? 'text-[var(--text)]' : isLight ? 'text-gray-800' : isDark ? 'text-gray-100' : 'text-white'
        const dateColor  = !gradients ? 'text-[var(--muted)]' : isLight ? 'text-gray-500' : isDark ? 'text-gray-400' : 'text-white/70'
        const formattedDate = new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

        const cardInner = (
          <div className="relative p-6">
            <div className="text-3xl mb-3">📖</div>
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitRename(set.id)
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                onBlur={() => submitRename(set.id)}
                onClick={e => e.preventDefault()}
                className="w-full font-bold text-base bg-transparent border-b-2 border-[var(--accent)] outline-none pb-0.5"
                style={{ color: 'inherit' }}
              />
            ) : (
              <h3 className={`font-bold text-base leading-snug line-clamp-2 ${titleColor}`}>{set.title}</h3>
            )}
            <p className={`mt-2 text-xs ${dateColor}`}>{formattedDate}</p>
          </div>
        )

        return (
          <div key={set.id} className="relative group">
            {/* Card */}
            {isRenaming ? (
              <div className={
                gradient
                  ? `rounded-2xl overflow-hidden shadow-sm ${titleColor}`
                  : 'rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shadow-sm'
              }>
                {gradient && <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />}
                {cardInner}
              </div>
            ) : (
              <Link
                href={`/study-sets/${set.id}`}
                className={
                  gradient
                    ? 'block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5'
                    : 'block rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5'
                }
              >
                {gradient && <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />}
                {cardInner}
              </Link>
            )}

            {/* ⋯ menu button */}
            {!isRenaming && (
              <button
                onClick={e => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : set.id) }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/20 text-white text-sm leading-none"
                title="More options"
              >
                ···
              </button>
            )}

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute top-11 right-3 z-30 w-36 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
                <button
                  onClick={() => startRename(set)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  ✏️ Rename
                </button>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--surface-2)] transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
    </div>
  )
}
