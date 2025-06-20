
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import SearchFilters from '@/components/SearchFilters'
import Pagination from '@/components/Pagination' // Pagination komponentini import edirik

const LISTINGS_PER_PAGE = 12; // Hər səhifədə göstəriləcək elan sayı

export default async function HomePage({ searchParams }) {
  const supabase = createClient()
  const currentPage = Number(searchParams.page) || 1;

  // --- Axtarış və Filtrləmə Məntiqi ---
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' }) // 'count: exact' ilə ümumi sayı alırıq
    .eq('status', 'approved')

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

  // Səhifələmə üçün aralığı təyin edirik
  const from = (currentPage - 1) * LISTINGS_PER_PAGE;
  const to = from + LISTINGS_PER_PAGE - 1;
  query = query.range(from, to);

  // Nəticələri çəkirik
  const { data: listings, error, count } = await query.order('approved_at', { ascending: false })

  if (error) {
    console.error("Elanları çəkərkən xəta:", error)
  }
  
  const totalPages = Math.ceil(count / LISTINGS_PER_PAGE);

  // Marka siyahısını almaq üçün əlavə sorğu (bunu optimizasiya etmək olar)
  const { data: uniqueBrands } = await supabase
    .from('listings')
    .select('brand')
    .eq('status', 'approved');

  const brandSet = new Set(uniqueBrands?.map(item => item.brand));
  const distinctBrands = Array.from(brandSet).map(brand => ({ brand }));

  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams?.message && (
        <div className="mb-6 p-4 text-center text-green-800 bg-green-100 rounded-md">
          {searchParams.message}
        </div>
      )}

      <SearchFilters uniqueBrands={distinctBrands} />

      <h1 className="text-3xl font-bold mb-6">
        {Object.keys(searchParams).filter(k => k !== 'page').length > 0 ? 'Axtarış Nəticələri' : 'Son Elanlar'}
      </h1>
      
      {listings && listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination totalPages={totalPages} />
        </>
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