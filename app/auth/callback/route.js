// FAYL: app/auth/callback/route.js
// AÇIQLAMA: Bu yeni fayl Google OAuth prosesini tamamlamaq üçündür.
// Google istifadəçini təsdiqlədikdən sonra bu ünvana yönləndirir.
// Buradakı kod, Supabase-dən istifadəçi sessiyasını alır və istifadəçini ana səhifəyə yönləndirir.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  // URL-dən təsdiqləmə kodunu almaq üçün
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Əgər "next" parametri varsa, yönləndirmə üçün onu istifadə et
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    // Təsdiqləmə kodunu istifadəçi sessiyası ilə dəyişdir
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Uğurlu olarsa, istifadəçini ana səhifəyə və ya "next" ünvanına yönləndir
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Xəta baş verərsə və ya kod yoxdursa, istifadəçini xəta mesajı ilə login səhifəsinə yönləndir
  console.error('Authentication error: Could not exchange code for session.');
  return NextResponse.redirect(`${origin}/login?message=Google_hesabi_ile_tesdiqleme_ugursuz_oldu`)
}
