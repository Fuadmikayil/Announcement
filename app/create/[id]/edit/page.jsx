import { createClient } from '../../../../lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateListing, deleteImage } from './actions'
import Image from 'next/image'

// Silmək üçün SVG ikonu
const Trash2 = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);

export default async function EditListingPage({ params, searchParams }) {
  const supabase = createClient()
  const listingId = params.id

  // --- DÜZƏLİŞ: İstifadəçi sessiyası daha təhlükəsiz yoxlanılır ---
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect('/login')
  }
  const user = authData.user
  // --- Düzəlişin sonu ---

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()

  const isAdmin = profile?.role === 'admin'
  const isOwner = listing?.user_id === user.id

  if (!listing || (!isAdmin && !isOwner)) { notFound() }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Elanı Redaktə Et</h1>
        
        {/* === ŞƏKİLLƏRİ İDARƏ ETMƏ BÖLMƏSİ === */}
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mövcud Şəkillər</h2>
            {listing.image_urls && listing.image_urls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listing.image_urls.map((url) => (
                        <div key={url} className="relative group">
                            <Image
                                src={url}
                                alt="Elan şəkli"
                                width={200}
                                height={150}
                                className="rounded-md object-cover w-full h-32"
                            />
                            <div className="absolute top-1 right-1">
                                <form action={deleteImage}>
                                    <input type="hidden" name="listingId" value={listing.id} />
                                    <input type="hidden" name="imageUrl" value={url} />
                                    <button type="submit" title="Şəkli sil" className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Heç bir şəkil yoxdur.</p>
            )}
        </div>

        {/* === ƏSAS REDAKTƏ FORMASI === */}
        <form action={updateListing} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="hidden" name="listingId" value={listing.id} />
          
          {/* YENİ ŞƏKİLLƏR ƏLAVƏ ETMƏ SAHƏSİ */}
          <div className="md:col-span-2">
              <label htmlFor="new_images" className="block text-sm font-medium text-gray-700">Yeni Şəkillər Əlavə Et</label>
              <input 
                type="file" 
                name="new_images" 
                id="new_images" 
                multiple
                accept="image/png, image/jpeg, image/webp"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">Birdən çox şəkil seçə bilərsiniz (CTRL düyməsini basıb saxlayın).</p>
          </div>

          <div className="md:col-span-2"><hr /></div>

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
          
          <div className="md:col-span-2"><button type="submit" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Dəyişiklikləri Yadda Saxla</button></div>
        </form>
      </div>
    </div>
  )
}