
'use server'
import { createClient } from '../../../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListing(formData) {
  const listingId = formData.get('listingId')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: listing } = await supabase.from('listings').select('user_id').eq('id', listingId).single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = listing?.user_id === user.id

    if (!isAdmin && !isOwner) {
      throw new Error('Bu əməliyyat üçün səlahiyyətiniz yoxdur.')
    }

    const updatedData = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year'), 10),
      price: parseInt(formData.get('price'), 10),
      mileage: parseInt(formData.get('mileage'), 10),
      engine_volume: parseFloat(formData.get('engine_volume')),
      color: formData.get('color'),
      description: formData.get('description'),
      city: formData.get('city'),
      // Admin statusu dəyişə bilər, istifadəçi dəyişdikdə isə avtomatik "pending" olur
      status: isAdmin ? formData.get('status') : 'pending',
    }

    const { error } = await supabase.from('listings').update(updatedData).eq('id', listingId)
    if (error) { throw error }

  } catch (error) {
    console.error('Elanı yeniləmə xətası:', error.message)
    return redirect(`/elanlar/${listingId}/edit?message=Elan_yenilenmedi`)
  }

  revalidatePath('/admin')
  revalidatePath('/profil')
  revalidatePath(`/elanlar/${listingId}`)
  redirect('/profil?message=Elan_ugurla_yenilendi')
}