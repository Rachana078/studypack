import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, answer } = await request.json()
  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
  }

  // RLS ensures the user owns the parent study set
  const { error } = await supabase
    .from('flashcards')
    .update({ question: question.trim(), answer: answer.trim() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
