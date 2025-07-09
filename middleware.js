
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aşağıdakılar xaricində BÜTÜN sorğu yolları ilə uyğunlaşdırın:
     * - _next/static (statik fayllar)
     * - _next/image (şəkil optimizasiya faylları)
     * - favicon.ico (favicon faylı)
     * Daxilində 'api' və ya 'trpc' olan istənilən yollar da istisna edilir.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}