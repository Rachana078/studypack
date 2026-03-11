import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })

    if (!error) {
      await supabase.auth.signOut()
      return NextResponse.redirect(
        `${origin}/login?message=Email+confirmed!+Please+sign+in.`
      )
    }
  }

  return NextResponse.redirect(`${origin}/login?message=Invalid+or+expired+confirmation+link.`)
}
