
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { deleteListing } from './actions'

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

export default async function ProfilePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // İstifadəçinin profil məlumatlarını və bütün elanlarını eyni anda çək
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      full_name,
      listings (
        *,
        created_at
      )
    `)
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error("Profil məlumatları çəkilərkən xəta:", error)
    return <p>Profil məlumatlarını yükləmək mümkün olmadı.</p>
  }

  // Elanları yaradılma tarixinə görə sırala
  const sortedListings = profile.listings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{profile.full_name}</h1>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <h2 className="text-2xl font-bold mb-6">Mənim Elanlarım</h2>
      
      {sortedListings.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Sizin heç bir elanınız yoxdur.</p>
          <Link href="/create" className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            İndi Elan Yerləşdirin
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedListings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={listing.image_urls?.[0] || '[https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image](https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image)'}
                  alt={`${listing.brand} ${listing.model}`}
                  width={100}
                  height={75}
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{listing.brand} {listing.model}</h3>
                  <p className="text-sm text-gray-600">{listing.price} AZN</p>
                  <p className="text-xs text-gray-500">
                    {new Date(listing.created_at).toLocaleDateString('az-AZ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(listing.status)}
                {/* YENİ ƏLAVƏ OLUNAN LİNK */}
                <Link href={`/create/${listing.id}/edit`} className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-300 rounded-md transition-colors">
                  Redaktə et
                </Link>
                <form action={deleteListing}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="px-3 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-md transition-colors">
                    Sil
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}