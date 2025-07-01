
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // `set` metodu Server Action-larda və Route Handler-lərdə çağırıla bilər.
            // Əgər Server Komponenti kimi "read-only" bir yerdə çağırılsa,
            // xəta baş verəcək, lakin bu, gözlənilən haldır və tətbiqin işinə mane olmur.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // `remove` metodu Server Action-larda və Route Handler-lərdə çağırıla bilər.
            // Əgər Server Komponenti kimi "read-only" bir yerdə çağırılsa,
            // xəta baş verəcək, lakin bu, gözlənilən haldır və tətbiqin işinə mane olmur.
          }
        },
      },
    }
  )
}