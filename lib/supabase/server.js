import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // await in Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // Use anon key for SSR auth client (safer; service key is for admin-only tasks)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {}
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch {}
        },
      },
    }
  )
}
