import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // DƏYİŞİKLİK BURADADIR: Public anon_key əvəzinə, secret_key istifadə edirik
    process.env.SUPABASE_SECRET_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component-də cookie set edərkən yaranan xəta ignore edilir
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component-də cookie silərkən yaranan xəta ignore edilir
          }
        },
      },
    }
  )
}
