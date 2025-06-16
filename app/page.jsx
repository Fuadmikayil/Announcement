
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import SearchFilters from '@/components/SearchFilters' // Yeni komponenti import edirik

export default async function HomePage({ searchParams }) {
  const supabase = createClient()

  // --- Axtarış Məntiqi ---
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')

  // Filtrləri tətbiq edirik
  if (searchParams.brand) {
    query = query.ilike('brand', `%${searchParams.brand}%`)
  }
  if (searchParams.model) {
    query = query.ilike('model', `%${searchParams.model}%`)
  }
  if (searchParams.minPrice) {
    query = query.gte('price', searchParams.minPrice)
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', searchParams.maxPrice)
  }

  // Nəticələri çəkirik
  const { data: listings, error } = await query.order('approved_at', { ascending: false })

  if (error) {
    console.error("Elanları çəkərkən xəta:", error)
  }
  
  // Marka siyahısını almaq üçün əlavə sorğu
  const { data: uniqueBrands } = await supabase
    .from('listings')
    .select('brand')
    .eq('status', 'approved');

  // Duplikatları aradan qaldırmaq
  const brandSet = new Set(uniqueBrands?.map(item => item.brand));
  const distinctBrands = Array.from(brandSet).map(brand => ({ brand }));


  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams?.message && (
        <div className="mb-6 p-4 text-center text-green-800 bg-green-100 rounded-md">
          {searchParams.message}
        </div>
      )}

      <SearchFilters uniqueBrands={distinctBrands} /> {/* Axtarış komponentini əlavə edirik */}

      <h1 className="text-3xl font-bold mb-6">
        {Object.keys(searchParams).length > 0 ? 'Axtarış Nəticələri' : 'Son Elanlar'}
      </h1>
      
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Axtarışınıza uyğun elan tapılmadı.</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                Bütün elanlara baxın
            </Link>
        </div>
      )}
    </div>
  )
}