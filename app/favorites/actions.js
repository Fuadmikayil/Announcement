
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(listingId, isFavorited) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Favorilərə əlavə etmək üçün daxil olmalısınız.')
  }

  if (isFavorited) {
    // Favorilərdən sil
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: user.id, listing_id: listingId })
    
    if (error) {
      console.error('Favorit silmə xətası:', error)
      throw new Error('Elan favorilərdən silinərkən xəta baş verdi.')
    }
  } else {
    // Favorilərə əlavə et
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, listing_id: listingId })

    if (error) {
      console.error('Favorit əlavə etmə xətası:', error)
      throw new Error('Elan favorilərə əlavə edilərkən xəta baş verdi.')
    }
  }

  // Aidiyyatı səhifələri yeniləyirik ki, dəyişiklik görünsün
  revalidatePath('/')
  revalidatePath('/favoriler')
}