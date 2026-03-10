'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface Props {
  count: number
}

export default function DashboardHero({ count }: Props) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Before mount: neutral surface — no theme-specific gradient
  const bannerClass = !mounted
    ? 'bg-[var(--surface-2)]'
    : theme === 'dark'
    ? 'bg-[var(--surface-2)]'
    : theme === 'light'
    ? 'bg-[var(--surface-2)]'
    : 'bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)]'

  return (
    <div className={`${bannerClass} px-6 py-10 transition-colors duration-200`}>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-[var(--text)] mb-1">Your Study Sets</h1>
        <p className="text-[var(--muted)] text-sm">
          {count} {count === 1 ? 'set' : 'sets'} ready to study
        </p>
      </div>
    </div>
  )
}
