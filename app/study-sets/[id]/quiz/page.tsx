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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/study-sets/${id}`} className="text-gray-500 hover:text-gray-700 truncate max-w-xs">
            {studySet.title}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Quiz</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <h1 className="mb-8 text-xl font-bold text-gray-900">Quiz</h1>
        <QuizPlayer questions={questions ?? []} />
      </main>
    </div>
  )
}
