
import { createClient } from '../lib/supabase/server'
import ListingCard from './components/ListingCard.jsx'
import Link from 'next/link'
import SearchFilters from './components/SearchFilters.jsx'
import Pagination from './components/Pagination.jsx'
import Hero from './components/Hero.jsx'

const LISTINGS_PER_PAGE = 12;

async function getUniqueFilterValues(supabase) {
    // Şəhərləri yeni "cities" cədvəlindən çəkirik
    const [brandsRes, citiesRes, fuelTypesRes, transmissionsRes] = await Promise.all([
        supabase.from('brands').select('id, name').order('name', { ascending: true }),
        supabase.from('cities').select('name').order('name', { ascending: true }), // Dəyişdirildi
        supabase.from('listings').select('fuel_type').eq('status', 'approved'),
        supabase.from('listings').select('transmission').eq('status', 'approved'),
    ]);

    const getUniqueValues = (response) => {
        if (!response.error && response.data) {
            return Array.from(new Set(response.data.map(item => Object.values(item)[0]).filter(Boolean))).sort();
        }
        return [];
    };

    return {
        brands: brandsRes.data || [],
        cities: citiesRes.data.map(c => c.name) || [], // Dəyişdirildi
        fuelTypes: getUniqueValues(fuelTypesRes),
        transmissions: getUniqueValues(transmissionsRes)
    };
}

export default async function HomePage({ searchParams }) {
  const page = searchParams['page'] ?? '1';
  const brand = searchParams['brand'] ?? '';
  const model = searchParams['model'] ?? '';
  const city = searchParams['city'] ?? '';
  const minPrice = searchParams['minPrice'] ?? '';
  const maxPrice = searchParams['maxPrice'] ?? '';
  const minYear = searchParams['minYear'] ?? '';
  const maxYear = searchParams['maxYear'] ?? '';
  const fuelType = searchParams['fuelType'] ?? '';
  const transmission = searchParams['transmission'] ?? '';
  const color = searchParams['color'] ?? '';

  const supabase = createClient();
  const currentPage = Number(page);

  let query = supabase.from('listings').select('*', { count: 'exact' }).eq('status', 'approved');
  
  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (model) query = query.ilike('model', `%${model}%`);
  if (city) query = query.eq('city', city);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (minYear) query = query.gte('year', minYear);
  if (maxYear) query = query.lte('year', maxYear);
  if (fuelType) query = query.eq('fuel_type', fuelType);
  if (transmission) query = query.eq('transmission', transmission);
  if (color) query = query.ilike('color', `%${color}%`);
  
  const from = (currentPage - 1) * LISTINGS_PER_PAGE;
  const to = from + LISTINGS_PER_PAGE - 1;
  query = query.range(from, to);
  
  const { data: listings, error, count } = await query.order('approved_at', { ascending: false });
  if (error) console.error("Elanları çəkərkən xəta:", error);
  
  const totalPages = Math.ceil((count || 0) / LISTINGS_PER_PAGE);
  const uniqueValues = await getUniqueFilterValues(supabase);
  const hasFilters = brand || model || city || minPrice || maxPrice || minYear || maxYear || fuelType || transmission || color;

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