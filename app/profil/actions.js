'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteListing(formData) {
  const supabase = await createClient()
  const listingId = formData.get('listingId')

  if (!listingId) {
    console.error('Silinəcək elanın ID-si tapılmadı.')
    return
  }

  // 1. İstifadəçinin autentifikasiyasını yoxla
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Elanın məlumatlarını, xüsusən də şəkil URL-lərini əldə et
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('user_id, image_urls')
    .eq('id', listingId)
    .single()

  if (fetchError || !listing) {
    console.error('Elan tapılmadı və ya sahibi yoxlanıla bilmədi:', fetchError)
    return
  }

  // 3. Təhlükəsizlik yoxlaması: Silməyə cəhd edən istifadəçi elanın sahibidirmi?
  // RLS bunu onsuz da təmin edir, lakin server tərəfində yoxlamaq daha təhlükəsizdir.
  if (listing.user_id !== user.id) {
    console.error('Səlahiyyət xətası: İstifadəçi başqasının elanını silməyə cəhd etdi.')
    return
  }

  // 4. Əlaqəli şəkilləri Supabase Storage-dən sil
  if (listing.image_urls && listing.image_urls.length > 0) {
    // URL-dən fayl yollarını çıxarmaq
    const filePaths = listing.image_urls.map(url => {
      const parts = url.split('/listings-images/')
      return parts.length > 1 ? parts[1] : null
    }).filter(Boolean)

    if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('listings-images')
            .remove(filePaths)
        
        if (storageError) {
            console.error('Storage-dən şəkilləri silərkən xəta:', storageError)
            // Prosesi dayandırmırıq, çünki əsas məqsəd bazadakı qeydi silməkdir.
        }
    }
  }

  // 5. Elanı verilənlər bazasından sil
  const { error: deleteError } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (deleteError) {
    console.error('Elanı silərkən xəta:', deleteError)
    return
  }

  // Profil səhifəsini yeniləyərək silinmiş elanın anında yox olmasını təmin et
  revalidatePath('/profil')
}