
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import SearchFilters from '@/components/SearchFilters'
import Pagination from '@/components/Pagination'

const LISTINGS_PER_PAGE = 12;

// Unikal dəyərləri çəkmək üçün yardımçı funksiya
async function getUniqueFilterValues(supabase) {
    const columns = ['brand', 'city', 'fuel_type', 'transmission'];
    const results = {};

    for (const column of columns) {
        const { data, error } = await supabase
            .from('listings')
            .select(column)
            .eq('status', 'approved');

        if (!error && data) {
            const uniqueSet = new Set(data.map(item => item[column]).filter(Boolean));
            results[column + 's'] = Array.from(uniqueSet).sort();
        } else {
            results[column + 's'] = [];
        }
    }
    return results;
}

export default async function HomePage({ searchParams }) {
  const supabase = createClient()
  const currentPage = Number(searchParams.page) || 1;

  // --- Axtarış və Filtrləmə Məntiqi ---
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')

  // Yeni filtrləri tətbiq edirik
  if (searchParams.brand) query = query.ilike('brand', `%${searchParams.brand}%`);
  if (searchParams.model) query = query.ilike('model', `%${searchParams.model}%`);
  if (searchParams.minPrice) query = query.gte('price', searchParams.minPrice);
  if (searchParams.maxPrice) query = query.lte('price', searchParams.maxPrice);
  if (searchParams.city) query = query.eq('city', searchParams.city);
  if (searchParams.fuelType) query = query.eq('fuel_type', searchParams.fuelType);
  if (searchParams.transmission) query = query.eq('transmission', searchParams.transmission);

  // Səhifələmə
  const from = (currentPage - 1) * LISTINGS_PER_PAGE;
  const to = from + LISTINGS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: listings, error, count } = await query.order('approved_at', { ascending: false })

  if (error) console.error("Elanları çəkərkən xəta:", error);
  
  const totalPages = Math.ceil((count || 0) / LISTINGS_PER_PAGE);

  // Dropdown-lar üçün unikal dəyərləri çəkirik
  const uniqueValues = await getUniqueFilterValues(supabase);

  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams?.message && (
        <div className="mb-6 p-4 text-center text-green-800 bg-green-100 rounded-md">
          {searchParams.message}
        </div>
      )}

      <SearchFilters uniqueValues={uniqueValues} />

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
                Bütün filtrləri təmizlə
            </Link>
        </div>
      )}
    </div>
  )
}