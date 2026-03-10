import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

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
    <div className="min-h-screen bg-rose-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-pink-400 hover:text-pink-600 transition-colors">Dashboard</Link>
          <span className="text-pink-200">/</span>
          <span className="text-gray-600 font-medium truncate">{studySet.title}</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-1">{studySet.title}</h1>
          <p className="text-sm text-pink-400">
            Created {new Date(studySet.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            href={`/study-sets/${id}/flashcards`}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-violet-400" />
            <div className="relative p-8">
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-xl font-bold text-gray-800">Flashcards</p>
              <p className="mt-1 text-gray-600 text-sm">{flashcardCount ?? 0} cards to review</p>
              <div className="mt-6 inline-flex items-center gap-1 text-gray-700 text-sm font-medium group-hover:gap-2 transition-all">
                Start studying →
              </div>
            </div>
          </Link>

          <Link
            href={`/study-sets/${id}/quiz`}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-300 to-pink-400" />
            <div className="relative p-8">
              <div className="text-5xl mb-4">🧠</div>
              <p className="text-xl font-bold text-gray-800">Quiz</p>
              <p className="mt-1 text-gray-600 text-sm">{quizCount ?? 0} questions</p>
              <div className="mt-6 inline-flex items-center gap-1 text-gray-700 text-sm font-medium group-hover:gap-2 transition-all">
                Test yourself →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
