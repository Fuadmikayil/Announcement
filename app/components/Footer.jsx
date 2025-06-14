
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="text-2xl font-bold text-white">
            TurboClone
          </Link>
          <div className="flex space-x-6 mt-4">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Ana Səhifə</Link>
            <Link href="/elan-yerlesdir" className="hover:text-indigo-400 transition-colors">Elan Yerləşdir</Link>
            {/* Gələcəkdə əlavə oluna biləcək linklər */}
            <Link href="#" className="hover:text-indigo-400 transition-colors">Qaydalar</Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors">Əlaqə</Link>
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            © {new Date().getFullYear()} TurboClone. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  )
}