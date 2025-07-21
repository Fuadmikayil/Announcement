
import { createClient } from '../../../../lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateListing } from './actions'

export default async function EditListingPage({ params, searchParams }) {
  const supabase = createClient()
  const listingId = params.id

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()

  const isAdmin = profile?.role === 'admin'
  const isOwner = listing?.user_id === user.id

  if (!listing || (!isAdmin && !isOwner)) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Elanı Redaktə Et</h1>
        
        <form action={updateListing} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="hidden" name="listingId" value={listing.id} />
          
          {/* Ümumi Sahələr */}
          <div className="md:col-span-2"><label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label><input type="text" name="brand" id="brand" required defaultValue={listing.brand} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" required defaultValue={listing.model} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="year" className="block text-sm font-medium text-gray-700">Buraxılış İli</label><input type="number" name="year" id="year" required defaultValue={listing.year} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="price" className="block text-sm font-medium text-gray-700">Qiymət (AZN)</label><input type="number" name="price" id="price" required defaultValue={listing.price} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Yürüş (km)</label><input type="number" name="mileage" id="mileage" required defaultValue={listing.mileage} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="engine_volume" className="block text-sm font-medium text-gray-700">Mühərrikin Həcmi</label><input type="number" step="0.1" name="engine_volume" id="engine_volume" required defaultValue={listing.engine_volume} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="color" className="block text-sm font-medium text-gray-700">Rəng</label><input type="text" name="color" id="color" required defaultValue={listing.color} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="city" className="block text-sm font-medium text-gray-700">Şəhər</label><input type="text" name="city" id="city" required defaultValue={listing.city} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div className="md:col-span-2"><label htmlFor="description" className="block text-sm font-medium text-gray-700">Əlavə Məlumat</label><textarea name="description" id="description" rows="4" defaultValue={listing.description} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"></textarea></div>

          {/* Yalnız Admin üçün Sahə */}
          {isAdmin && (
            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Elanın Statusu (Admin)</label>
              <select name="status" id="status" required defaultValue={listing.status} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900">
                <option value="pending">Gözləmədə</option>
                <option value="approved">Təsdiqlənib</option>
                <option value="rejected">Rədd edilib</option>
              </select>
            </div>
          )}
          
          <div className="md:col-span-2"><button type="submit" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Yenilə</button></div>
          {searchParams?.message && <p className="md:col-span-2 text-center text-sm text-red-600">{searchParams.message.replace(/_/g, ' ')}</p>}
        </form>
      </div>
    </div>
  )
}