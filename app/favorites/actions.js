
// FAYL: /app/favorites/actions.js (DƏYİŞMƏZ)
'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(listingId, isFavorited) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Favorilərə əlavə etmək üçün daxil olmalısınız.' }
    }

    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, listing_id: listingId })
      
      if (error) { throw error }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId })

      if (error) { throw error }
    }

    revalidatePath('/')
    revalidatePath('/favorites')
    return { success: true }
  } catch (error) {
    console.error('Toggle Favorite Xətası:', error.message)
    return { success: false, error: 'Əməliyyat zamanı xəta baş verdi.' }
  }
}
