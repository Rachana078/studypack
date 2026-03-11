import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import StudyModeCards from '@/components/StudyModeCards'
import QuizHistory from '@/components/quiz/QuizHistory'
import ShareButton from '@/components/ShareButton'
import ExportButton from '@/components/ExportButton'
import ReviewButton from '@/components/ReviewButton'

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

  const today = new Date().toISOString().slice(0, 10)

  const [{ count: flashcardCount }, { count: quizCount }, { data: quizResults }, { count: dueCount }, { data: flashcards }, { data: quizQuestions }] = await Promise.all([
    supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('study_set_id', id),
    supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('study_set_id', id),
    supabase.from('quiz_results').select('id, score, total, created_at').eq('study_set_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('study_set_id', id).lte('next_review_date', today),
    supabase.from('flashcards').select('question, answer').eq('study_set_id', id),
    supabase.from('quiz_questions').select('question, option_a, option_b, option_c, option_d, correct_answer').eq('study_set_id', id),
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
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] mb-1">{studySet.title}</h1>
            <p className="text-sm text-[var(--muted)]">
              Created {new Date(studySet.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReviewButton id={id} dueCount={dueCount ?? 0} />
            <ExportButton title={studySet.title} flashcards={flashcards ?? []} quizQuestions={quizQuestions ?? []} />
            <ShareButton id={id} />
          </div>
        </div>

        <StudyModeCards
          id={id}
          flashcardCount={flashcardCount ?? 0}
          quizCount={quizCount ?? 0}
        />
        <QuizHistory results={quizResults ?? []} />
      </main>
    </div>
  )
}
