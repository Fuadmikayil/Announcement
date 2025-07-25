
// FAYL: /middleware.js
import { updateSession } from './lib/supabase/middleware'
export async function middleware(request) { return await updateSession(request) }
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/models|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
