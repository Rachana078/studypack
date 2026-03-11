'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ReviewButtonProps {
  id: string
  dueCount: number
}

export default function ReviewButton({ id, dueCount }: ReviewButtonProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isPink = mounted && theme === 'pink'
  const isDark = mounted && theme === 'dark'

  if (dueCount === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] select-none">
        ✅ All caught up
      </span>
    )
  }

  return (
    <Link
      href={`/study-sets/${id}/review`}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity ${
        isPink ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'
        : isDark ? 'bg-white text-gray-900'
        : 'bg-gray-800 text-white'
      }`}
    >
      🔁 Review Due
      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
        isPink ? 'bg-white/30' : isDark ? 'bg-black/10' : 'bg-white/20'
      }`}>
        {dueCount}
      </span>
    </Link>
  )
}
