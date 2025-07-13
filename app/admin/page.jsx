
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveListing, rejectListing } from './actions'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient()

  // 1. İstifadəçi daxil olubmu?
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. İstifadəçinin rolu 'admin'dirmi?
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Giriş Qadağandır</h1>
        <p>Bu səhifəyə yalnız adminlər daxil ola bilər.</p>
        <Link href="/" className="text-indigo-600 mt-4 inline-block">Ana Səhifəyə Qayıt</Link>
      </div>
    )
  }

  // 3. Statusu 'pending' olan elanları çək
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Elanları çəkərkən xəta:", error)
    return <p>Elanları yükləmək mümkün olmadı.</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Paneli - Gözləyən Elanlar</h1>
      
      {listings.length === 0 ? (
        <p className="text-gray-500">Təsdiq üçün gözləyən elan yoxdur.</p>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
              <Image
                src={listing.image_urls[0]}
                alt={`${listing.brand} ${listing.model}`}
                width={200}
                height={150}
                className="rounded-md object-cover w-full md:w-48 h-48 md:h-auto"
              />
              <div className="flex-grow">
                <h2 className="text-xl font-bold">{listing.brand} {listing.model}</h2>
                <p className="text-lg font-semibold text-indigo-600">{listing.price} AZN</p>
                <p className="text-gray-600">{listing.year}, {listing.engine_volume} L, {listing.mileage} km</p>
                <p className="text-gray-600">{listing.city}</p>
                <p className="mt-2 text-sm text-gray-800">{listing.description}</p>
              </div>
              <div className="flex flex-row md:flex-col gap-2 justify-center items-center">
                <form action={approveListing}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    Təsdiqlə
                  </button>
                </form>
                <form action={rejectListing}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    Rədd et
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