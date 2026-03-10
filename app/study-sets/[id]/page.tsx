import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import StudyModeCards from '@/components/StudyModeCards'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StudySetPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('id, title, created_at')
    .eq('id', id)
    .single()

  if (!studySet) notFound()

  const [{ count: flashcardCount }, { count: quizCount }] = await Promise.all([
    supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('study_set_id', id),
    supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('study_set_id', id),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Dashboard</Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text)] font-medium truncate">{studySet.title}</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[var(--text)] mb-1">{studySet.title}</h1>
          <p className="text-sm text-[var(--muted)]">
            Created {new Date(studySet.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <StudyModeCards
          id={id}
          flashcardCount={flashcardCount ?? 0}
          quizCount={quizCount ?? 0}
        />
      </main>
    </div>
  )
}
