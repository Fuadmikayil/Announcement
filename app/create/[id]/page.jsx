
import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import ListingImage from '../../components/ListingImage.jsx'
import Link from 'next/link'

export default async function ListingDetailPage({ params }) {
  const supabase = createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles (
        full_name,
        phone_number
      )
    `)
    .eq('id', params.id)
    .single()

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user && user.id === listing?.user_id;

  if (error || !listing || (!isOwner && listing.status !== 'approved')) {
    notFound();
  }
  
  const formattedPrice = new Intl.NumberFormat('az-AZ').format(listing.price);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Şəkil Qalereyası */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg mb-4">
              <ListingImage
                src={listing.image_urls?.[0] || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'}
                alt={`${listing.brand} ${listing.model}`}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {listing.image_urls?.map((url, index) => (
                <div key={index} className="relative w-full h-24 rounded-md overflow-hidden">
                  <ListingImage 
                    src={url} 
                    alt={`Image ${index + 1}`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 640px) 33vw, 20vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Məlumatlar və Satıcı */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold text-gray-900">{listing.brand} {listing.model}</h1>
              <p className="text-4xl font-extrabold text-indigo-600 mt-2">{formattedPrice} AZN</p>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Satıcı ilə əlaqə</h3>
                <p className="text-gray-800 text-xl mt-2">{listing.profiles?.full_name || 'Ad qeyd edilməyib'}</p>
                <p className="text-gray-600 text-lg">{listing.profiles?.phone_number || 'Nömrə qeyd edilməyib'}</p>
              </div>

              {isOwner && (
                <div className="mt-6 border-t pt-4">
                  <Link 
                    href={`/create/${listing.id}/edit`} 
                    className="w-full inline-block text-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Elanı Redaktə Et
                  </Link>
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Xüsusiyyətlər</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between"><span>Buraxılış ili:</span> <span className="font-medium">{listing.year}</span></li>
                  <li className="flex justify-between"><span>Yürüş:</span> <span className="font-medium">{listing.mileage} km</span></li>
                  <li className="flex justify-between"><span>Mühərrik:</span> <span className="font-medium">{listing.engine_volume} L</span></li>
                  <li className="flex justify-between"><span>Yanacaq:</span> <span className="font-medium">{listing.fuel_type}</span></li>
                  <li className="flex justify-between"><span>Sürətlər qutusu:</span> <span className="font-medium">{listing.transmission}</span></li>
                  <li className="flex justify-between"><span>Rəng:</span> <span className="font-medium">{listing.color}</span></li>
                  <li className="flex justify-between"><span>Şəhər:</span> <span className="font-medium">{listing.city}</span></li>
                </ul>
            </div>
          </div>
        </div>

        {/* Ətraflı Məlumat */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Əlavə Məlumat</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {listing.description || 'Əlavə məlumat qeyd edilməyib.'}
          </p>
        </div>
      </div>
    </div>
  )
}