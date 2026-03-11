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

  const [{ data: studySets }, { data: streakData }] = await Promise.all([
    supabase.from('study_sets').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single(),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <DashboardHero
        count={studySets?.length ?? 0}
        currentStreak={streakData?.current_streak ?? 0}
        longestStreak={streakData?.longest_streak ?? 0}
      />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <StudySetList studySets={studySets ?? []} />
      </main>
    </div>
  )
}
