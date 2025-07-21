
import { createClient } from '../../lib/supabase/server'
import Link from 'next/link'
import { signOut } from '../auth/actions'

export default async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">TurboClone</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/favorites" className="text-gray-600 hover:text-indigo-600 hidden sm:block">Favorilər</Link>
              <Link href="/profil" className="text-gray-600 hover:text-indigo-600 hidden sm:block">Profil</Link>
              <Link href="/create" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Elan Yerləşdir</Link>
              <form action={signOut}><button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Çıxış</button></form>
            </>
          ) : (<Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Daxil Ol</Link>)}
        </div>
      </nav>
    </header>
  )
}