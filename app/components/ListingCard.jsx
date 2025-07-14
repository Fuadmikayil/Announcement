
import Image from 'next/image'
import Link from 'next/link'

export default function ListingCard({ listing }) {
  // Qiyməti formatlaşdırmaq üçün
  const formattedPrice = new Intl.NumberFormat('az-AZ').format(listing.price);

  return (
    <Link href={`/elanlar/${listing.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image
          src={listing.image_urls?.[0] || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'}
          alt={`${listing.brand} ${listing.model}`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'; }}
        />
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-indigo-600">{formattedPrice} AZN</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-1">{listing.brand} {listing.model}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {listing.year}, {listing.engine_volume} L, {listing.mileage} km
        </p>
        <p className="text-sm text-gray-500 mt-1">{listing.city}</p>
      </div>
    </Link>
  )
}