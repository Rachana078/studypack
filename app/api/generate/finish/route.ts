import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStudySet } from '@/lib/generator'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studySetId } = await request.json()
  if (!studySetId) return NextResponse.json({ error: 'Missing studySetId' }, { status: 400 })

  // Fetch extracted text (RLS ensures ownership)
  const { data: studySet, error: fetchError } = await supabase
    .from('study_sets')
    .select('extracted_text')
    .eq('id', studySetId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !studySet) {
    return NextResponse.json({ error: 'Study set not found' }, { status: 404 })
  }

  const { flashcards, quizQuestions } = await generateStudySet(studySet.extracted_text)

  if (flashcards.length > 0) {
    await supabase.from('flashcards').insert(
      flashcards.map(fc => ({ ...fc, study_set_id: studySetId }))
    )
  }

  if (quizQuestions.length > 0) {
    await supabase.from('quiz_questions').insert(
      quizQuestions.map(q => ({ ...q, study_set_id: studySetId }))
    )
  }

  return NextResponse.json({ success: true })
}
