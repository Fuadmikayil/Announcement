
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'

export default async function FavoritesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Favoriləri və onlara bağlı elan məlumatlarını çəkirik
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      listing_id,
      listings (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Favoriləri çəkərkən xəta:', error)
  }

  const favoriteListings = favorites ? favorites.map(fav => fav.listings).filter(Boolean) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seçilmiş Elanlarım</h1>
      
      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Sizin heç bir seçilmiş elanınız yoxdur.</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                Elanlara baxın
            </Link>
        </div>
      )}
    </div>
  )
}