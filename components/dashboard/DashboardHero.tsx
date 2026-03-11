'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface Props {
  count: number
  currentStreak: number
  longestStreak: number
}

export default function DashboardHero({ count, currentStreak, longestStreak }: Props) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const bannerClass = !mounted || theme !== 'pink'
    ? 'bg-[var(--surface-2)]'
    : 'bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)]'

  const streakTextClass = !mounted
    ? 'text-[var(--muted)]'
    : theme === 'dark'
    ? 'text-gray-400'
    : theme === 'light'
    ? 'text-gray-500'
    : 'text-pink-400'

  const streakValueClass = !mounted
    ? 'text-[var(--text)]'
    : theme === 'dark'
    ? 'text-white'
    : theme === 'light'
    ? 'text-gray-800'
    : 'text-pink-600'

  return (
    <div className={`${bannerClass} px-6 py-10 transition-colors duration-200`}>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-[var(--text)] mb-1">Your Study Sets</h1>
        <p className="text-[var(--muted)] text-sm">
          {count} {count === 1 ? 'set' : 'sets'} ready to study
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          {currentStreak > 0 ? (
            <span className={`text-sm font-semibold ${streakValueClass}`}>
              {currentStreak} day streak
            </span>
          ) : (
            <span className={`text-sm ${streakTextClass}`}>
              Start your streak today!
            </span>
          )}
          {currentStreak > 0 && longestStreak > currentStreak && (
            <span className={`text-xs ml-2 ${streakTextClass}`}>
              · best: {longestStreak}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
