'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const equipmentKeys = [
    'has_alloy_wheels', 'has_abs', 'has_sunroof', 'has_rain_sensor', 
    'has_central_locking', 'has_park_assist', 'has_ac', 'has_heated_seats',
    'has_leather_seats', 'has_xenon_lights', 'has_360_camera', 'has_rear_camera',
    'has_side_curtains', 'has_ventilated_seats'
];

export async function createListing(formData) {
  const supabase = await createClient()
  
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
        if (profileError) throw new Error(`Profil yenilənmədi: ${profileError.message}`);
    }

    const listingData = {
      user_id: user.id,
      brand: formData.get('brand'),
      model: formData.get('model'),
      body_type: formData.get('body_type'),
      is_new: formData.get('is_new'),
      city: formData.get('city'),
      color: formData.get('color'),
      year: parseInt(formData.get('year'), 10),
      price: parseInt(formData.get('price'), 10),
      mileage: parseInt(formData.get('mileage'), 10),
      engine_volume: parseFloat(formData.get('engine_volume')),
      fuel_type: formData.get('fuel_type'),
      transmission: formData.get('transmission'),
      description: formData.get('description'),
      credit: formData.get('credit') === 'on',
      barter: formData.get('barter') === 'on',
      image_urls: formData.get('image_urls').split(','),
    };

    equipmentKeys.forEach(key => {
        listingData[key] = formData.get(key) === 'on';
    });
    
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