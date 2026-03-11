'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserName(user?.user_metadata?.full_name ?? null)
    })
  }, [])

  const isDark  = mounted && theme === 'dark'
  const isLight = mounted && theme === 'light'
  const isPink  = mounted && !isDark && !isLight

  const logoClass = isDark
    ? 'text-white'
    : isPink
    ? 'bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent'

  const btnClass = isDark
    ? 'bg-[var(--text)] text-[var(--bg)]'
    : isPink
    ? 'bg-gradient-to-r from-pink-300 to-violet-300 text-white'
    : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white'

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" className={`text-xl font-black tracking-tight ${logoClass}`}>
          StudyPack ✦
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity ${btnClass}`}
          >
            + New Study Set
          </Link>

          <ThemeToggle />

          {userName && (
            <span className="text-sm font-medium text-[var(--muted)] hidden sm:inline">
              {userName.split(' ')[0]}
            </span>
          )}

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
