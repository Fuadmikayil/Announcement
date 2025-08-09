import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12 border-t border-white/10 footer-3d">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="text-2xl font-bold gradient-text hover:opacity-90 transition-opacity">
            AvtoAZ
          </Link>
          <div className="flex space-x-6 mt-4">
            <Link href="/" className="hover:text-indigo-400 transition-colors hover-lift">Ana Səhifə</Link>
            <Link href="/elan-yerlesdir" className="hover:text-indigo-400 transition-colors hover-lift">Elan Yerləşdir</Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors hover-lift">Qaydalar</Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors hover-lift">Əlaqə</Link>
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            © {new Date().getFullYear()} AvtoAZ. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  )
}