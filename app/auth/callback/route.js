
// FAYL: /app/auth/callback/route.js
import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  console.error('Auth callback xətası');
  return NextResponse.redirect(`${origin}/login?message=Autentifikasiya xətası`)
}