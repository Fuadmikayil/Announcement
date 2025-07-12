
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Elanı təsdiqləmək üçün funksiya
export async function approveListing(formData) {
  const supabase = createClient()
  const listingId = formData.get('listingId')

  if (!listingId) {
    console.error('Listing ID tapılmadı.')
    return
  }

  // Admin rolunu yoxlayaq (əlavə təhlükəsizlik üçün)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/?message=Səlahiyyətiniz yoxdur.')
  }

  // Elanın statusunu 'approved' olaraq yeniləyirik
  const { error } = await supabase
    .from('listings')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', listingId)

  if (error) {
    console.error('Elan təsdiqləmə xətası:', error)
    return
  }

  // Admin panelini və ana səhifəni yeniləyirik
  revalidatePath('/admin')
  revalidatePath('/')
}

// Elanı rədd etmək üçün funksiya
export async function rejectListing(formData) {
  const supabase = createClient()
  const listingId = formData.get('listingId')

  if (!listingId) {
    console.error('Listing ID tapılmadı.')
    return
  }
  
  // Admin rolunu yoxlayaq
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/?message=Səlahiyyətiniz yoxdur.')
  }


  // Elanın statusunu 'rejected' olaraq yeniləyirik
  const { error } = await supabase
    .from('listings')
    .update({ status: 'rejected' })
    .eq('id', listingId)

  if (error) {
    console.error('Elan rədd etmə xətası:', error)
    return
  }

  revalidatePath('/admin')
}