
'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(formData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { 
    return redirect('/login') 
  }

  try {
    const phoneNumber = formData.get('phone_number');

    if (phoneNumber) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ phone_number: phoneNumber })
            .eq('id', user.id);
        
        if (profileError) {
            throw new Error(`Profil yenilənmədi: ${profileError.message}`);
        }
    }

    const listingData = {
      user_id: user.id,
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
      image_urls: formData.get('image_urls').split(','),
    }
    
    const { error: listingError } = await supabase.from('listings').insert([listingData])
    
    if (listingError) { 
      throw listingError;
    }
    
  } catch (error) {
    console.error("Elan yaratma xətası:", error.message);
    return redirect(`/create?message=Elan_yaradilarken_xeta_bas_verdi`) 
  }

  revalidatePath('/')
  revalidatePath('/profil')
  redirect('/?message=Elaniniz_ugurla_gonderildi')
}