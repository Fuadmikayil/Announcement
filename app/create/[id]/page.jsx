// FAYL: /app/elanlar/[id]/page.jsx
// AÇIQLAMA: Bu faylın dizaynı daha müasir və cəlbedici olması üçün yeniləndi.
'use client' // Şəkil qalereyasının interaktivliyi üçün 'use client' əlavə edildi

import { createClient } from '../../../lib/supabase/client' // Client komponenti üçün
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import ListingImage from '../../components/ListingImage.jsx'
import Link from 'next/link'

// Xüsusiyyətlər üçün ikonları saxlayan komponent
const FeatureIcon = ({ children }) => (
    <span className="mr-2 text-indigo-500">{children}</span>
);

export default function ListingDetailPage({ params }) {
  const [listing, setListing] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0); // Aktiv şəkil indeksi üçün state

  useEffect(() => {
    const fetchListing = async () => {
      const supabase = createClient();
      
      const { data: listingData, error } = await supabase
        .from('listings')
        .select(`*, profiles (full_name, phone_number)`)
        .eq('id', params.id)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      const ownerCheck = user && user.id === listingData?.user_id;
      
      if (error || !listingData || (!ownerCheck && listingData.status !== 'approved')) {
        return notFound();
      }

      setListing(listingData);
      setIsOwner(ownerCheck);
      setLoading(false);
    };

    fetchListing();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-20">Yüklənir...</div>;
  }

  if (!listing) {
    return notFound();
  }
  
  const formattedPrice = new Intl.NumberFormat('az-AZ').format(listing.price);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Başlıq və Qiymət */}
        <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{listing.brand} {listing.model}</h1>
            <p className="text-2xl text-gray-600">{listing.year}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Şəkil Qalereyası */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg mb-4 bg-gray-200">
              <ListingImage
                src={listing.image_urls?.[activeImage] || 'https://placehold.co/800x600/e2e8f0/e2e8f0?text=No+Image'}
                alt={`${listing.brand} ${listing.model}`}
                fill
                priority
                className="object-cover transition-all duration-300"
              />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {listing.image_urls?.map((url, index) => (
                <div 
                    key={index} 
                    className={`relative w-full h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${activeImage === index ? 'border-indigo-500' : 'border-transparent hover:border-gray-400'}`}
                    onClick={() => setActiveImage(index)}
                >
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
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-5xl font-extrabold text-indigo-600">{formattedPrice} AZN</p>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-xl font-semibold text-gray-700">Satıcı ilə əlaqə</h3>
                <p className="text-gray-800 text-2xl mt-2 font-medium">{listing.profiles?.full_name || 'Ad qeyd edilməyib'}</p>
                <p className="text-gray-600 text-lg mt-1">{listing.profiles?.phone_number || 'Nömrə qeyd edilməyib'}</p>
              </div>

              {isOwner && (
                <div className="mt-6">
                  <Link 
                    href={`/profil/edit/${listing.id}`} 
                    className="w-full inline-block text-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Elanı Redaktə Et
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Xüsusiyyətlər</h3>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-center"><FeatureIcon>📅</FeatureIcon><span>Buraxılış ili:</span> <span className="font-medium ml-auto">{listing.year}</span></li>
                  <li className="flex items-center"><FeatureIcon>🛣️</FeatureIcon><span>Yürüş:</span> <span className="font-medium ml-auto">{listing.mileage} km</span></li>
                  <li className="flex items-center"><FeatureIcon>⚙️</FeatureIcon><span>Mühərrik:</span> <span className="font-medium ml-auto">{listing.engine_volume} L</span></li>
                  <li className="flex items-center"><FeatureIcon>⛽</FeatureIcon><span>Yanacaq:</span> <span className="font-medium ml-auto">{listing.fuel_type}</span></li>
                  <li className="flex items-center"><FeatureIcon>🕹️</FeatureIcon><span>Sürətlər qutusu:</span> <span className="font-medium ml-auto">{listing.transmission}</span></li>
                  <li className="flex items-center"><FeatureIcon>🎨</FeatureIcon><span>Rəng:</span> <span className="font-medium ml-auto">{listing.color}</span></li>
                  <li className="flex items-center"><FeatureIcon>🏙️</FeatureIcon><span>Şəhər:</span> <span className="font-medium ml-auto">{listing.city}</span></li>
                </ul>
            </div>
          </div>
        </div>

        {/* Ətraflı Məlumat */}
        <div className="mt-10 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Əlavə Məlumat</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p>{listing.description || 'Əlavə məlumat qeyd edilməyib.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
