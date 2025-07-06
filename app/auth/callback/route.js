
// FAYL: /app/auth/callback/route.js
// AÇIQLAMA: Supabase bəzi autentifikasiya proseslərindən sonra (məs. OAuth) istifadəçini
// bu yola yönləndirir. Bu, sessiyanın cookie-lərdə saxlanması üçün vacibdir.
// app/auth qovluğunda "callback" adlı yeni bir qovluq yaradıb bu faylı ora yerləşdirin.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // əgər varsa, növbəti yönləndirmə yolu
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // xəta baş verərsə və ya kod yoxdursa, xəta səhifəsinə yönləndir
  console.error('Auth callback xətası');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
