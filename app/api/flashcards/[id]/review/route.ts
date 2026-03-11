import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rating } = await request.json() as { rating: 'easy' | 'good' | 'hard' }

  const { data: card } = await supabase
    .from('flashcards')
    .select('interval_days, ease_factor, review_count')
    .eq('id', id)
    .single()

  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { interval_days, ease_factor, review_count } = card

  let newInterval: number
  let newEase: number

  if (rating === 'easy') {
    newEase = ease_factor + 0.1
    newInterval = Math.max(1, Math.round(interval_days * newEase))
  } else if (rating === 'good') {
    newEase = ease_factor
    newInterval = Math.max(1, Math.round(interval_days * ease_factor))
  } else {
    newEase = Math.max(1.3, ease_factor - 0.2)
    newInterval = 1
  }

  const nextDate = new Date(Date.now() + newInterval * 86_400_000)
  const nextReviewDate = nextDate.toISOString().slice(0, 10)

  await supabase
    .from('flashcards')
    .update({
      interval_days: newInterval,
      ease_factor: newEase,
      review_count: review_count + 1,
      next_review_date: nextReviewDate,
    })
    .eq('id', id)

  return NextResponse.json({ interval_days: newInterval, ease_factor: newEase, next_review_date: nextReviewDate })
}
