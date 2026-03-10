import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicNavbar from '@/components/PublicNavbar'
import PublicStudyView from '@/components/PublicStudyView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicStudySetPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('id, title, created_at')
    .eq('id', id)
    .single()

  if (!studySet) notFound()

  const [{ data: flashcards }, { data: questions }] = await Promise.all([
    supabase.from('flashcards').select('id, question, answer').eq('study_set_id', id),
    supabase.from('quiz_questions').select('id, question, option_a, option_b, option_c, option_d, correct_answer, explanation').eq('study_set_id', id),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNavbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">Study Set</p>
          <h1 className="text-3xl font-black text-[var(--text)]">{studySet.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {flashcards?.length ?? 0} flashcards · {questions?.length ?? 0} quiz questions
          </p>
        </div>

        <PublicStudyView
          flashcards={flashcards ?? []}
          questions={questions ?? []}
        />
      </main>
    </div>
  )
}
