'use client'

import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import { signOut } from '../auth/actions'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation' // Route dəyişimini izləmək üçün

export default function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname(); // Route hər dəyişəndə trigger olur

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    };

    fetchUser();
  }, [pathname]); // Route dəyişdikcə təkrar fetch edir

  return (
    <header className={`header-3d transition-all ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white/60 backdrop-blur-sm shadow'}`}>
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">AvtoAZ</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-500 px-3 py-1.5 rounded-md">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/favorites" className="text-gray-600 hover:text-indigo-600">Favorilər</Link>
                  <Link href="/profil" className="text-gray-600 hover:text-indigo-600">Profil</Link>
                  <Link href="/create" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Elan Yerləşdir</Link>
                  <form action={signOut}>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800">Çıxış</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Daxil Ol</Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {!loading && user && (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            )}
             {!loading && !user && (
                 <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Daxil Ol</Link>
             )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && !loading && user && (
          <div className="md:hidden mt-4 space-y-2">
            {isAdmin && (
              <Link href="/admin" className="block text-center text-sm font-semibold text-red-600 hover:text-red-700 border border-red-500 px-3 py-2 rounded-md">
                Admin Panel
              </Link>
            )}
            <Link href="/favorites" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Favorilər</Link>
            <Link href="/profil" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Profil</Link>
            <Link href="/create" className="block text-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Elan Yerləşdir</Link>
            <form action={signOut} className="w-full">
              <button type="submit" className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800">Çıxış</button>
            </form>
          </div>
        )}
      </nav>
    </header>
  )
}
