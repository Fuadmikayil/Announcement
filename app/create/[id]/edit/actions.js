'use server'
import { createClient } from '../../../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListing(formData) {
  const listingId = formData.get('listingId')

  try {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return redirect('/login')
    }
    const user = authData.user

    if (!listingId) {
        throw new Error("Elan ID tapılmadı.")
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: listing } = await supabase.from('listings').select('user_id, image_urls').eq('id', listingId).single()

    if (!listing) {
      throw new Error("Elan tapılmadı.")
    }
    
    const isAdmin = profile?.role === 'admin'
    const isOwner = listing?.user_id === user.id

    if (!isAdmin && !isOwner) {
      throw new Error('Bu əməliyyat üçün səlahiyyətiniz yoxdur.')
    }

    const year = parseInt(formData.get('year'), 10)
    const price = parseInt(formData.get('price'), 10)
    const mileage = formData.get('mileage') ? parseInt(formData.get('mileage'), 10) : 0;
    const engine_volume = formData.get('engine_volume') ? parseFloat(formData.get('engine_volume')) : 0;

    if (isNaN(year) || isNaN(price) || isNaN(mileage) || isNaN(engine_volume)) {
        throw new Error("İl, Qiymət, Yürüş və Mühərrik Həcmi düzgün rəqəm formatında olmalıdır.")
    }

    const updatedData = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: year,
      price: price,
      mileage: mileage,
      engine_volume: engine_volume,
      color: formData.get('color'),
      description: formData.get('description'),
      city: formData.get('city'),
      status: isAdmin ? formData.get('status') : 'pending',
    }

    const newImages = formData.getAll('new_images').filter(f => f.size > 0)
    if (newImages.length > 0) {
      const newImageUrls = []
      for (const image of newImages) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, image)
        if (uploadError) { throw uploadError }
        
        const { data: urlData, error: urlError } = supabase.storage.from('images').getPublicUrl(fileName)
        if(urlError || !urlData?.publicUrl) { throw new Error("Yüklənmiş şəklin URL-ni almaq mümkün olmadı.") }
        
        newImageUrls.push(urlData.publicUrl)
      }
      updatedData.image_urls = [...(listing.image_urls || []), ...newImageUrls]
    }

    const { error: updateError } = await supabase.from('listings').update(updatedData).eq('id', listingId)
    if (updateError) { throw updateError }

    revalidatePath(`/create/${listingId}/edit`)
    revalidatePath(`/profil`)
    redirect(`/profil?message=Elan uğurla yeniləndi`)

  } catch (error) {
    console.error('Server Action Xətası:', error.message)
    const errorMessage = encodeURIComponent(error.message.replace(/_/g, ' '));
    if (listingId) {
        return redirect(`/create/${listingId}/edit?message=${errorMessage}`)
    } else {
        return redirect(`/profil?message=${errorMessage}`)
    }
  }
}

// === DÜZƏLİŞ BURADADIR ===
// Bütün məntiq vahid try...catch bloku içinə alınıb
export async function deleteImage(formData) {
    const listingId = formData.get('listingId')
    const imageUrlToDelete = formData.get('imageUrl')

    try {
        if (!listingId || !imageUrlToDelete) {
            throw new Error("Silinəcək şəkil məlumatları tapılmadı.")
        }
        
        const supabase = createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) {
            return redirect('/login')
        }
        const user = authData.user

        const { data: listing } = await supabase.from('listings').select('user_id, image_urls').eq('id', listingId).single()
        if (!listing) throw new Error("Elan tapılmadı.")

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const isAdmin = profile?.role === 'admin'
        const isOwner = listing.user_id === user.id

        if (!isAdmin && !isOwner) throw new Error('Bu əməliyyat üçün səlahiyyətiniz yoxdur.')

        // Storage-dən silməyə cəhd et
        try {
            const imagePath = new URL(imageUrlToDelete).pathname.split('/images/')[1]
            if(imagePath) await supabase.storage.from('images').remove([imagePath])
        } catch(e) {
            console.error("Storage-dən silərkən xəta (URL parse):", e.message)
            // Bu xəta kritik deyil, əsas olan DB-dən silməkdir, ona görə davam edirik
        }

        // Databazadan sil
        const newImageUrls = listing.image_urls.filter(url => url !== imageUrlToDelete)
        const { error: dbError } = await supabase.from('listings').update({ image_urls: newImageUrls }).eq('id', listingId)

        if (dbError) throw dbError

        // UĞURLU HAL: Səhifəni yenilə və mesajla birlikdə həmin səhifəyə yönləndir
        revalidatePath(`/create/${listingId}/edit`)
        redirect(`/create/${listingId}/edit?message=Şəkil uğurla silindi`)

    } catch (error) {
        return redirect(`/create/${listingId}/edit`)
    }
}