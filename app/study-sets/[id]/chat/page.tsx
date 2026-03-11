import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ChatInterface from '@/components/chat/ChatInterface'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!studySet) notFound()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Dashboard
          </Link>
          <span className="text-[var(--border)]">/</span>
          <Link href={`/study-sets/${id}`} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors truncate max-w-xs">
            {studySet.title}
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[var(--text)] font-medium">Chat</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6">
        <div className="mb-4">
          <h1 className="text-xl font-black text-[var(--text)]">Chat with your notes</h1>
          <p className="text-sm text-[var(--muted)]">{studySet.title}</p>
        </div>
        <ChatInterface studySetId={id} />
      </main>
    </div>
  )
}
