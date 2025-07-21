
// FAYL: /app/admin/actions.js (YENİLƏNMİŞ)
'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveListing(formData) {
  const listingId = formData.get('listingId')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { return redirect('/login') }

  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      throw new Error('Səlahiyyətiniz yoxdur.')
    }

    const { error } = await supabase
      .from('listings')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', listingId)
    
    if (error) { throw error }

  } catch (error) {
    console.error("Elan təsdiqləmə xətası:", error.message)
    return redirect(`/admin?message=Xeta_bas_verdi`)
  }

  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin?message=Elan_tesdiqlendi')
}

export async function rejectListing(formData) {
  const listingId = formData.get('listingId')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { return redirect('/login') }

  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      throw new Error('Səlahiyyətiniz yoxdur.')
    }

    const { error } = await supabase
      .from('listings')
      .update({ status: 'rejected' })
      .eq('id', listingId)
    
    if (error) { throw error }

  } catch (error) {
    console.error("Elan rədd etmə xətası:", error.message)
    return redirect(`/admin?message=Xeta_bas_verdi`)
  }

  revalidatePath('/admin')
  redirect('/admin?message=Elan_redd_edildi')
}