'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

const FLOATING_ITEMS = ['📚', '✦', '🧠', '💡', '✏️', '⭐', '🎯', '📝']

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--bg)]">

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--hero-from)] via-[var(--bg)] to-[var(--hero-to)]" />

      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--accent)] rounded-full opacity-20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--accent-2)] rounded-full opacity-15 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[var(--accent)] rounded-full opacity-10 blur-3xl" />

      {/* Floating emoji items */}
      {FLOATING_ITEMS.map((item, i) => (
        <span
          key={i}
          className="absolute text-[var(--accent)]/20 select-none pointer-events-none"
          style={{
            top: `${10 + (i * 11) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            fontSize: i % 3 === 0 ? '2rem' : i % 3 === 1 ? '1.2rem' : '1.6rem',
            transform: `rotate(${(i * 37) % 60 - 30}deg)`,
          }}
        >
          {item}
        </span>
      ))}

      {/* Card */}
      <div className="relative z-10 m-auto w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface)]/60 backdrop-blur-sm mb-4 text-3xl shadow-lg">
            📚
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
            StudyPack ✦
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {mode === 'login' ? 'Welcome back! Ready to study?' : 'Turn your notes into smart study sets'}
          </p>
        </div>

        <div className="bg-[var(--surface)]/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)] mb-6">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg mt-2"
            >
              {loading ? '...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <a href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
                  Sign up free
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                  Sign in
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
