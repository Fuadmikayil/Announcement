
// FAYL: /app/elanlar/[id]/page.jsx (YENİLƏNMİŞ)
// AÇIQLAMA: SVG ikonlarındakı səhv xmlns atributu düzəldildi.
import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageGallery from '../../components/ImageGallery.jsx'
import React from 'react'

// DÜZƏLİŞ: xmlns atributu düzgün formatda yazıldı
const PhoneIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const UserIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

const equipmentList = [
    { key: 'has_alloy_wheels', label: 'Yüngül lehimli disklər' },
    { key: 'has_abs', label: 'ABS' },
    { key: 'has_sunroof', label: 'Lyuk' },
    { key: 'has_rain_sensor', label: 'Yağış sensoru' },
    { key: 'has_central_locking', label: 'Mərkəzi qapanma' },
    { key: 'has_park_assist', label: 'Park radarı' },
    { key: 'has_ac', label: 'Kondisioner' },
    { key: 'has_heated_seats', label: 'Oturacaqların isidilməsi' },
    { key: 'has_leather_seats', label: 'Dəri salon' },
    { key: 'has_xenon_lights', label: 'Ksenon lampalar' },
    { key: 'has_360_camera', label: '360° kamera' },
    { key: 'has_rear_camera', label: 'Arxa görüntü kamerası' },
    { key: 'has_side_curtains', label: 'Yan pərdələr' },
    { key: 'has_ventilated_seats', label: 'Oturacaqların ventilyasiyası' },
];


export default async function ListingDetailPage({ params }) {
  const supabase = createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`*, profiles (full_name, phone_number)`)
    .eq('id', params.id)
    .single()

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user && user.id === listing?.user_id;

  if (error || !listing || (!isOwner && listing.status !== 'approved')) {
    notFound();
  }
  
  const formattedPrice = new Intl.NumberFormat('az-AZ').format(listing.price);

  const specs = [
    { label: 'Buraxılış ili', value: listing.year },
    { label: 'Yürüş', value: `${listing.mileage} km` },
    { label: 'Mühərrik', value: `${listing.engine_volume} L` },
    { label: 'Yanacaq', value: listing.fuel_type },
    { label: 'Sürətlər qutusu', value: listing.transmission },
    { label: 'Rəng', value: listing.color },
    { label: 'Şəhər', value: listing.city },
    { label: 'Ban növü', value: listing.body_type },
  ];

  const availableEquipment = equipmentList.filter(item => listing[item.key]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{listing.brand} {listing.model}</h1>
            <p className="text-2xl text-gray-600">{listing.year}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <ImageGallery images={listing.image_urls} alt={`${listing.brand} ${listing.model}`} />
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-700 border-b pb-2">Əlavə Məlumat</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description || 'Əlavə məlumat qeyd edilməyib.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl font-extrabold text-indigo-600">{formattedPrice} AZN</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                    {listing.credit && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Kredit</span>}
                    {listing.barter && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Barter</span>}
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Satıcı ilə əlaqə</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <UserIcon />
                        <span className="text-gray-800 text-lg">{listing.profiles?.full_name || 'Ad qeyd edilməyib'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <PhoneIcon />
                        <span className="text-gray-600 text-lg font-medium">{listing.profiles?.phone_number || 'Nömrə qeyd edilməyib'}</span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-6 border-t pt-4">
                    <Link 
                      href={`/elanlar/${listing.id}/edit`} 
                      className="w-full inline-block text-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Elanı Redaktə Et
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Xüsusiyyətlər</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {specs.map(spec => (
                      spec.value && <React.Fragment key={spec.label}>
                        <span className="text-gray-500">{spec.label}:</span>
                        <span className="font-medium text-gray-800 text-right">{spec.value}</span>
                      </React.Fragment>
                    ))}
                  </div>
              </div>

              {availableEquipment.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Avtomobilin təchizatı</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {availableEquipment.map(item => (
                            <div key={item.key} className="flex items-center">
                                <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700 text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}