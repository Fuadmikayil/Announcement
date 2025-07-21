
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveListing, rejectListing } from './actions'
import Link from 'next/link'
import ListingImage from '../components/ListingImage.jsx'

// Status üçün rəngləri təyin edən yardımçı funksiya
const getStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Təsdiqlənib</span>
    case 'pending':
      return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Gözləmədə</span>
    case 'rejected':
      return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Rədd edilib</span>
    default:
      return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{status}</span>
  }
}

export default async function AdminPage({ searchParams }) {
  const message = searchParams.message;
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Giriş Qadağandır</h1>
        <p>Bu səhifəyə yalnız adminlər daxil ola bilər.</p>
        <Link href="/" className="text-indigo-600 mt-4 inline-block">Ana Səhifəyə Qayıt</Link>
      </div>
    )
  }

  // DÜZƏLİŞ: BÜTÜN elanları çəkirik, ən yenilər yuxarıda olmaqla
  const { data: listings, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
  if (error) { console.error("Elanları çəkərkən xəta:", error); return <p>Elanları yükləmək mümkün olmadı.</p> }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Paneli - Bütün Elanlar</h1>
      {message && (
        <div className="mb-6 p-4 text-center text-indigo-800 bg-indigo-100 rounded-md">
          {message.replace(/_/g, ' ')}
        </div>
      )}
      {listings.length === 0 ? (
        <p className="text-gray-500">Sistemdə heç bir elan yoxdur.</p>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 relative">
                  <ListingImage
                    src={listing.image_urls?.[0] || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image'}
                    alt={`${listing.brand} ${listing.model}`}
                    fill
                    className="rounded-md object-cover"
                  />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-xl font-bold">{listing.brand} {listing.model}</h2>
                    {getStatusBadge(listing.status)}
                </div>
                <p className="text-lg font-semibold text-indigo-600">{new Intl.NumberFormat('az-AZ').format(listing.price)} AZN</p>
                <p className="text-gray-600">{listing.year}, {listing.engine_volume} L, {listing.mileage} km</p>
                <p className="text-gray-600">{listing.city}</p>
                <p className="mt-2 text-sm text-gray-800 line-clamp-2">{listing.description}</p>
              </div>
              <div className="flex flex-row md:flex-col gap-2 justify-center items-center flex-shrink-0 w-full md:w-auto">
                {listing.status === 'pending' && (
                    <form action={approveListing} className="w-full">
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                            Təsdiqlə
                        </button>
                    </form>
                )}
                {listing.status !== 'rejected' && (
                    <form action={rejectListing} className="w-full">
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Rədd et
                        </button>
                    </form>
                )}
                <Link 
                    href={`/create/${listing.id}/edit`} 
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Redaktə Et
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}