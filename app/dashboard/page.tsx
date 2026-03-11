import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudySetList from '@/components/dashboard/StudySetList'
import DashboardHero from '@/components/dashboard/DashboardHero'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const today = new Date().toISOString().slice(0, 10)

  const [{ data: studySets }, { data: streakData }] = await Promise.all([
    supabase.from('study_sets').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single(),
  ])

  const studySetIds = studySets?.map(s => s.id) ?? []

  const { data: dueCards } = studySetIds.length > 0
    ? await supabase
        .from('flashcards')
        .select('study_set_id')
        .lte('next_review_date', today)
        .in('study_set_id', studySetIds)
    : { data: [] }

  const dueCounts: Record<string, number> = {}
  dueCards?.forEach(c => {
    dueCounts[c.study_set_id] = (dueCounts[c.study_set_id] ?? 0) + 1
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <DashboardHero
        count={studySets?.length ?? 0}
        currentStreak={streakData?.current_streak ?? 0}
        longestStreak={streakData?.longest_streak ?? 0}
        userName={user.user_metadata?.full_name ?? null}
      />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <StudySetList studySets={studySets ?? []} dueCounts={dueCounts} />
      </main>
    </div>
  )
}
