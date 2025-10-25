// FAYL: /app/profil/edit/[id]/actions.js 
'use server'

import { createClient } from '../../../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListing(formData) {
  const listingId = formData.get('listingId')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  try {
    const { data: existingListing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single()

    if (!existingListing || existingListing.user_id !== user.id) {
      throw new Error('Bu əməliyyatı etmək üçün səlahiyyətiniz yoxdur.')
    }

    const updatedData = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year'), 10),
      price: parseInt(formData.get('price'), 10),
      mileage: parseInt(formData.get('mileage'), 10),
      engine_volume: parseFloat(formData.get('engine_volume')),
      fuel_type: formData.get('fuel_type'),
      transmission: formData.get('transmission'),
      color: formData.get('color'),
      description: formData.get('description'),
      city: formData.get('city'),
      status: 'pending',
    }

    const { error } = await supabase
      .from('listings')
      .update(updatedData)
      .eq('id', listingId)

    if (error) {
      throw error
    }

  } catch (error) {
    console.error('Elanı yeniləmə xətası:', error.message)
    return redirect(`/profil/edit/${listingId}?message=Elan_yenilenmedi`)
  }

  revalidatePath('/profil')
  revalidatePath(`/elanlar/${listingId}`)
  redirect('/profil?message=Elan_yenilendi_ve_yoxlamaya_gonderildi')
}