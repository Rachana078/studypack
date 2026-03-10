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
      {sets.map((set, i) => {
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
  )
}
