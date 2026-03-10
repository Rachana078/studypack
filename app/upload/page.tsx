import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadForm from '@/components/upload/UploadForm'
import Navbar from '@/components/Navbar'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Upload a file</h1>
        <p className="mb-8 text-sm text-gray-500">
          We&apos;ll extract text and generate flashcards and a quiz for you.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <UploadForm />
        </div>
      </main>
    </div>
  )
}
