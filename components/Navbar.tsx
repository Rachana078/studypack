'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const logoClass = mounted && theme === 'dark'
    ? 'text-white'
    : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent'

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" className={`text-xl font-black tracking-tight ${logoClass}`}>
          StudyPack ✦
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity ${
              mounted && theme === 'dark'
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white'
            }`}
          >
            + New Study Set
          </Link>
          <ThemeToggle />
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
