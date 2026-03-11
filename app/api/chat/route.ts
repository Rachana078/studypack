import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { studySetId, messages } = await req.json()

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('extracted_text')
    .eq('id', studySetId)
    .single()

  if (!studySet) {
    return NextResponse.json({ error: 'Study set not found' }, { status: 404 })
  }

  const systemPrompt = `You are a helpful study assistant. Answer questions based only on the following study material:\n\n${studySet.extracted_text}\n\nIf the answer is not in the material, say so.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    })

    const reply = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Groq chat error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
