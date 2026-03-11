import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ current_streak: 0, longest_streak: 0 })

  const { data } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json(data ?? { current_streak: 0, longest_streak: 0 })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    // First time — create row with streak of 1
    await supabase.from('user_streaks').insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_studied_date: today,
    })
    return NextResponse.json({ current_streak: 1, longest_streak: 1 })
  }

  const last = existing.last_studied_date

  if (last === today) {
    // Already studied today — nothing to do
    return NextResponse.json({
      current_streak: existing.current_streak,
      longest_streak: existing.longest_streak,
    })
  }

  const newStreak = last === yesterday ? existing.current_streak + 1 : 1
  const newLongest = Math.max(newStreak, existing.longest_streak)

  await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_studied_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return NextResponse.json({ current_streak: newStreak, longest_streak: newLongest })
}
