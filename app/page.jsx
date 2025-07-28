import { createClient } from '../lib/supabase/server'
import ListingCard from './components/ListingCard.jsx'
import Link from 'next/link'
import SearchFilters from './components/SearchFilters.jsx'
import Pagination from './components/Pagination.jsx'
import Hero from './components/Hero.jsx'

const LISTINGS_PER_PAGE = 12;

async function getFilterOptions(supabase) {
  const [brandsRes, citiesRes, bodyTypesRes, colorsRes] = await Promise.all([
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
    supabase.from('cities').select('name').order('name', { ascending: true }),
    supabase.from('body_types').select('name').order('name', { ascending: true }),
    supabase.from('colors').select('name, hex_code').order('id'),
  ]);

  return {
    brands: brandsRes.data || [],
    cities: citiesRes.data?.map(c => c.name) || [],
    bodyTypes: bodyTypesRes.data?.map(bt => bt.name) || [],
    colors: colorsRes.data || [],
  };
}

async function getNewTodayCount(supabase) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('approved_at', today.toISOString());
  if (error) {
    console.error("Bu günkü elan sayı çəkilərkən xəta:", error);
    return 0;
  }
  return count || 0;
}

export default async function HomePage({ searchParams }) {
  // Next.js 15+ searchParams asinxrondur, await etməliyik:
  const params = typeof searchParams.then === 'function' ? await searchParams : searchParams;

  const page = params['page'] ?? '1';
  const brand = params['brand'] ?? '';
  const model = params['model'] ?? '';
  const city = params['city'] ?? '';
  const minPrice = params['minPrice'] ?? '';
  const maxPrice = params['maxPrice'] ?? '';
  const minYear = params['minYear'] ?? '';
  const maxYear = params['maxYear'] ?? '';
  const bodyType = params['bodyType'] ?? '';
  const color = params['color'] ?? '';
  const credit = params['credit'] ?? '';
  const barter = params['barter'] ?? '';
  const condition = params['condition'] ?? '';

  // Supabase client yaradılır
  const supabase = createClient();

  // Sorğu yaradılır
  let query = supabase.from('listings').select('*', { count: 'exact' }).eq('status', 'approved');

  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (model) query = query.ilike('model', `%${model}%`);
  if (city) query = query.eq('city', city);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (minYear) query = query.gte('year', minYear);
  if (maxYear) query = query.lte('year', maxYear);
  if (bodyType) query = query.eq('body_type', bodyType);
  if (color) query = query.eq('color', color);
  if (credit === 'true') query = query.eq('credit', true);
  if (barter === 'true') query = query.eq('barter', true);
  if (condition === 'new') query = query.eq('is_new', true);
  if (condition === 'used') query = query.eq('is_new', false);

  const equipmentFilters = [
    'has_alloy_wheels',
    'has_abs',
    'has_sunroof',
    'has_rain_sensor',
    'has_central_locking',
    'has_park_assist',
    'has_ac',
    'has_heated_seats',
    'has_leather_seats',
    'has_xenon_lights',
    'has_360_camera',
    'has_rear_camera',
    'has_side_curtains',
    'has_ventilated_seats'
  ];
  equipmentFilters.forEach(filter => {
    if (params[filter] === 'true') {
      query = query.eq(filter, true);
    }
  });

  // Pagination
  const from = (Number(page) - 1) * LISTINGS_PER_PAGE;
  const to = from + LISTINGS_PER_PAGE - 1;
  query = query.range(from, to);

  // Sorğu icrası
  const { data: listings, error, count } = await query.order('approved_at', { ascending: false });
  if (error) console.error("Elanları çəkərkən xəta:", error);

  const totalPages = Math.ceil((count || 0) / LISTINGS_PER_PAGE);

  // Filtrlər və elan sayını çək
  const filterOptions = await getFilterOptions(supabase);
  const newTodayCount = await getNewTodayCount(supabase);

  // Filter olub olmadığını yoxla
  const hasFilters = Object.keys(params).length > 0 && (Object.keys(params).length > 1 || !params.page);

  return (
    <>
      <Hero />
      <div id="search-filters" className="container mx-auto px-4 -mt-16 relative z-10">
        <SearchFilters filterOptions={filterOptions} newTodayCount={newTodayCount} />
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{hasFilters ? 'Axtarış Nəticələri' : 'Son Elanlar'}</h1>
        {listings && listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
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
