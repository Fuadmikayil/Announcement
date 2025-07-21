'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(formData) {
  const supabase = createClient()
  
  // 1. İstifadəçini yoxla
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { 
    // İstifadəçi yoxdursa, login səhifəsinə yönləndir
    return redirect('/login') 
  }

  // 2. Məlumatları bazaya yazmağa cəhd et
  try {
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
    
    // Məlumatları 'listings' cədvəlinə əlavə edirik
    const { error } = await supabase.from('listings').insert([listingData])
    
    // Əgər Supabase tərəfindən bir xəta gələrsə, onu "catch" bloku tutacaq
    if (error) { 
      throw error;
    }
    
  } catch (error) {
    console.error("Elan yaratma xətası:", error.message);
    // Xəta baş verdikdə istifadəçini xəta mesajı ilə birlikdə geri yönləndiririk
    // URL-də boşluq olmaması üçün mesajları "_" ilə yazırıq
    return redirect(`/create?message=Xeta_bas_verdi`) 
  }

  // 3. Hər şey uğurlu olarsa, cache-i təmizlə və ana səhifəyə yönləndir
  revalidatePath('/')
  redirect('/?message=Elaniniz_ugurla_gonderildi')
}
