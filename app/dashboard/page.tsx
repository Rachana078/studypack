import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudySetList from '@/components/dashboard/StudySetList'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: studySets } = await supabase
    .from('study_sets')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-rose-50">
      <Navbar />

      <div className="bg-gradient-to-br from-pink-300 to-violet-300 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-black text-gray-800 mb-1">Your Study Sets</h1>
          <p className="text-gray-600 text-sm">{studySets?.length ?? 0} {studySets?.length === 1 ? 'set' : 'sets'} ready to study</p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <StudySetList studySets={studySets ?? []} />
      </main>
    </div>
  )
}
