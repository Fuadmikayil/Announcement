
// FAYL: /app/page.jsx
import { createClient } from '../lib/supabase/server'
import ListingCard from './components/ListingCard.jsx'
import Link from 'next/link'
import SearchFilters from './components/SearchFilters.jsx'
import Pagination from './components/Pagination.jsx'
import Hero from './components/Hero.jsx'

const LISTINGS_PER_PAGE = 12;

async function getUniqueFilterValues(supabase) {
    const columns = ['brand', 'city', 'fuel_type', 'transmission'];
    const results = {};
    for (const column of columns) {
        const { data, error } = await supabase.from('listings').select(column).eq('status', 'approved');
        if (!error && data) {
            const uniqueSet = new Set(data.map(item => item[column]).filter(Boolean));
            results[column + 's'] = Array.from(uniqueSet).sort();
        } else { results[column + 's'] = []; }
    }
    return results;
}

export default async function HomePage({ searchParams }) {
  const page = searchParams['page'] ?? '1';
  const brand = searchParams['brand'] ?? '';
  const model = searchParams['model'] ?? '';
  const minPrice = searchParams['minPrice'] ?? '';
  const maxPrice = searchParams['maxPrice'] ?? '';
  const city = searchParams['city'] ?? '';
  const fuelType = searchParams['fuelType'] ?? '';
  const transmission = searchParams['transmission'] ?? '';

  const supabase = createClient();
  const currentPage = Number(page);

  let query = supabase.from('listings').select('*', { count: 'exact' }).eq('status', 'approved');
  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (model) query = query.ilike('model', `%${model}%`);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (city) query = query.eq('city', city);
  if (fuelType) query = query.eq('fuel_type', fuelType);
  if (transmission) query = query.eq('transmission', transmission);
  
  const from = (currentPage - 1) * LISTINGS_PER_PAGE;
  const to = from + LISTINGS_PER_PAGE - 1;
  query = query.range(from, to);
  
  const { data: listings, error, count } = await query.order('approved_at', { ascending: false });
  if (error) console.error("Elanları çəkərkən xəta:", error);
  
  const totalPages = Math.ceil((count || 0) / LISTINGS_PER_PAGE);
  const uniqueValues = await getUniqueFilterValues(supabase);
  const hasFilters = brand || model || minPrice || maxPrice || city || fuelType || transmission;

  return (
    <>
      <Hero />
      <div id="search-filters" className="container mx-auto px-4 -mt-16 relative z-10"><SearchFilters uniqueValues={uniqueValues} /></div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{hasFilters ? 'Axtarış Nəticələri' : 'Son Elanlar'}</h1>
        {listings && listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (<ListingCard key={listing.id} listing={listing} />))}
            </div>
            <Pagination totalPages={totalPages} />
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Axtarışınıza uyğun elan tapılmadı.</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">Bütün filtrləri təmizlə</Link>
          </div>
        )}
      </div>
    </>
  );
}