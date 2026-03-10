import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/extractor'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string) || 'Untitled Study Set'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload to storage
  const fileExt = file.name.split('.').pop()
  const storagePath = `${user.id}/${uuidv4()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from('study-files')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}`, phase: 'upload' }, { status: 500 })
  }

  // Extract text
  let extractedText: string
  try {
    extractedText = await extractText(buffer, file.type)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Text extraction failed', phase: 'extract' },
      { status: 500 }
    )
  }

  // Create study set row
  const { data: studySet, error: studySetError } = await supabase
    .from('study_sets')
    .insert({ user_id: user.id, title, source_file_url: storagePath, extracted_text: extractedText })
    .select('id')
    .single()

  if (studySetError || !studySet) {
    return NextResponse.json({ error: 'Failed to create study set', phase: 'extract' }, { status: 500 })
  }

  return NextResponse.json({ studySetId: studySet.id })
}
