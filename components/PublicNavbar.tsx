'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function PublicNavbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark  = mounted && theme === 'dark'
  const isLight = mounted && theme === 'light'
  const isPink  = mounted && !isDark && !isLight

  const logoClass = isDark
    ? 'text-white'
    : isPink
    ? 'bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent'

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className={`text-xl font-black tracking-tight ${logoClass}`}>
          StudyPack ✦
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
