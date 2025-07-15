
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link';

export default async function HomePage({ searchParams }) {
  const supabase = createClient();

  // Yalnız statusu 'approved' olan elanları çəkirik
  // Təsdiqlənmə tarixinə görə ən yeniləri yuxarıda göstəririk
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false });

  if (error) {
    console.error("Təsdiqlənmiş elanları çəkərkən xəta:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams?.message && (
        <div className="mb-6 p-4 text-center text-green-800 bg-green-100 rounded-md">
          {searchParams.message}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Son Elanlar</h1>
      
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Hələlik heç bir təsdiqlənmiş elan yoxdur.</p>
            <Link href="/elan-yerlesdir" className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                İlk Elanı Siz Yerləşdirin!
            </Link>
        </div>
      )}
    </div>
  );
}