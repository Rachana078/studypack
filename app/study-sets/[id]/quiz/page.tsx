import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QuizPlayer from '@/components/quiz/QuizPlayer'
import Navbar from '@/components/Navbar'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: PageProps) {
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

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, option_d, correct_answer, explanation')
    .eq('study_set_id', id)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">Dashboard</Link>
          <span className="text-[var(--border)]">/</span>
          <Link href={`/study-sets/${id}`} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors truncate max-w-xs">
            {studySet.title}
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text)] font-medium">Quiz</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <h1 className="mb-8 text-xl font-bold text-[var(--text)]">Quiz</h1>
        <QuizPlayer questions={questions ?? []} studySetId={id} />
      </main>
    </div>
  )
}
