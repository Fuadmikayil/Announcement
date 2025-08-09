import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative bg-gray-800 text-white py-20 sm:py-32 mb-8 overflow-hidden">
      {/* Arxa fon şəkli */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 animate-hero-zoom"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1925&auto=format&fit=crop')" }}
      ></div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>

      {/* 3D parallax blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="parallax-blob slow w-[44rem] h-[44rem] rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/30 -top-40 -left-32"></div>
        <div className="parallax-blob fast w-[34rem] h-[34rem] rounded-full bg-gradient-to-tr from-fuchsia-400/40 to-indigo-400/30 -bottom-32 -right-24"></div>
      </div>

      <div className="relative container mx-auto px-4 text-center perspective-1000">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight gradient-text fade-in-up">
          Arzunuzdakı Avtomobili Tapın
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto fade-in-up">
          Minlərlə elan arasında axtarış edin, müqayisə edin və ən yaxşı təklifi siz əldə edin.
        </p>
        <div className="mt-8 fade-in-up">
          <Link
            href="#search-filters"
            className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-lg btn-shine btn-3d bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Axtarışa Başla
          </Link>
        </div>
      </div>
    </div>
  )
}