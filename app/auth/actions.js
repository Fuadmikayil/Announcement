// FAYL: /app/auth/actions.js
// AÇIQLAMA: Bu fayl login və qeydiyyat üçün server tərəfində işləyəcək funksiyaları saxlayır.
// app qovluğunda "auth" adlı yeni bir qovluq yaradıb bu faylı ora yerləşdirin.

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData) {
  const supabase = createClient()

  // Formdan gələn məlumatları götürürük
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Supabase ilə login olmağa cəhd edirik
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login xətası:', error.message)
    // Real proyektlərdə burada daha yaxşı xəta mesajı göstərmək olar
    return redirect('/login?message=Daxil olmaq mümkün olmadı. Məlumatları yoxlayın.')
  }

  // Uğurlu olduqda ana səhifəyə yönləndiririk
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    options: {
      // Qeydiyyat zamanı əlavə məlumatları (məsələn, tam ad) göndəririk
      // Bu məlumat `handle_new_user` trigger-ı tərəfindən istifadə olunacaq
      data: {
        full_name: formData.get('fullName'),
      },
    },
  }

  // Supabase ilə yeni istifadəçi yaradırıq
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Qeydiyyat xətası:', error.message)
    return redirect('/qeydiyyat?message=Qeydiyyat baş tutmadı. Zəhmət olmasa, yenidən cəhd edin.')
  }

  // Uğurlu olduqda ana səhifəyə yönləndiririk
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    return redirect('/login')
  }

// YENİ FUNKSİYA
export async function signInWithGoogle() {
  const supabase = createClient()
  const origin = headers().get('origin') // Callback üçün host adını alırıq

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google ilə daxil olma xətası:', error)
    return redirect('/login?message=Google ilə daxil olmaq mümkün olmadı.')
  }

  // İstifadəçini Google-un autentifikasiya səhifəsinə yönləndiririk
  return redirect(data.url)
}