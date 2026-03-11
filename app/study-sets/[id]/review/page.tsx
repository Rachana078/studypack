import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ReviewDeck from '@/components/flashcards/ReviewDeck'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!studySet) notFound()

  const today = new Date().toISOString().slice(0, 10)

  const { data: dueCards } = await supabase
    .from('flashcards')
    .select('id, question, answer, interval_days, ease_factor, review_count')
    .eq('study_set_id', id)
    .lte('next_review_date', today)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Dashboard</Link>
          <span className="text-[var(--border)]">/</span>
          <Link href={`/study-sets/${id}`} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">{studySet.title}</Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text)] font-medium">Review</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[var(--text)] mb-1">Spaced Repetition Review</h1>
          <p className="text-sm text-[var(--muted)]">
            {dueCards?.length ?? 0} card{(dueCards?.length ?? 0) !== 1 ? 's' : ''} due today
          </p>
        </div>

        {!dueCards || dueCards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-[var(--text)] text-lg font-semibold mb-2">All caught up!</p>
            <p className="text-[var(--muted)] text-sm mb-6">No cards due for review today. Check back tomorrow.</p>
            <Link
              href={`/study-sets/${id}`}
              className="inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              ← Back to study set
            </Link>
          </div>
        ) : (
          <ReviewDeck flashcards={dueCards} studySetId={id} />
        )}
      </main>
    </div>
  )
}
