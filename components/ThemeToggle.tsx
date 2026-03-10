'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const THEMES = ['pink', 'light', 'dark']
const ICONS: Record<string, string> = { pink: '🌸', light: '☀️', dark: '🌙' }

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  const current = THEMES.includes(theme ?? '') ? theme! : 'pink'

  function cycle() {
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
    setTheme(next)
  }

  return (
    <button
      onClick={cycle}
      className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-[var(--surface-2)] transition-colors border border-[var(--border)]"
      title={`Switch theme (current: ${current})`}
    >
      {ICONS[current]}
    </button>
  )
}
