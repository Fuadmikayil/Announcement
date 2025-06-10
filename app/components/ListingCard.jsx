
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from './FavoriteButton' // Yeni komponenti import edirik

export default async function ListingCard({ listing }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isFavorited = false
  if (user) {
    const { data: favorite, error } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .single()
    
    if (favorite) {
      isFavorited = true
    }
  }

  const formattedPrice = new Intl.NumberFormat('az-AZ').format(listing.price)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-shadow duration-300 hover:shadow-xl">
      <div className="relative">
        <Link href={`/elanlar/${listing.id}`} className="block">
          <div className="relative w-full h-48">
            <Image
              src={listing.image_urls?.[0] || '[https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image](https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image)'}
              alt={`${listing.brand} ${listing.model}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.src='[https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image](https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image)'; }}
            />
          </div>
        </Link>
        {/* Favori düyməsini bura əlavə edirik */}
        {user && <FavoriteButton listingId={listing.id} isInitiallyFavorited={isFavorited} />}
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-indigo-600">{formattedPrice} AZN</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-1 truncate">{listing.brand} {listing.model}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {listing.year}, {listing.engine_volume} L, {listing.mileage} km
        </p>
        <p className="text-sm text-gray-500 mt-1">{listing.city}</p>
      </div>
    </div>
  )
}