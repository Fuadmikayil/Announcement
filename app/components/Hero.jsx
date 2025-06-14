
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative bg-gray-800 text-white py-20 sm:py-32 mb-8">
      {/* Arxa fon şəkli */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1925&auto=format&fit=crop')" }}
      ></div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Arzunuzdakı Avtomobili Tapın
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Minlərlə elan arasında axtarış edin, müqayisə edin və ən yaxşı təklifi siz əldə edin.
        </p>
        <div className="mt-8">
          <Link
            href="#search-filters"
            className="inline-block px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
          >
            Axtarışa Başla
          </Link>
        </div>
      </div>
    </div>
  )
}