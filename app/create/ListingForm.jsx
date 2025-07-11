
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createListing } from './actions'
import { useRouter } from 'next/navigation'

export default function ListingForm() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setMessage('Şəkillər yüklənir, zəhmət olmasa gözləyin...')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        setMessage('Xəta: İstifadəçi tapılmadı.')
        setUploading(false)
        return
    }

    // 1. Şəkilləri Supabase Storage-ə yüklə
    const uploadedImageUrls = []
    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('listings-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Şəkil yükləmə xətası:', uploadError)
        setMessage(`'${file.name}' yüklənərkən xəta baş verdi.`)
        setUploading(false)
        return
      }

      // 2. Yüklənmiş şəklin Public URL-ni al
      const { data: { publicUrl } } = supabase.storage
        .from('listings-images')
        .getPublicUrl(filePath)
      
      uploadedImageUrls.push(publicUrl)
    }

    setMessage('Məlumatlar göndərilir...')

    // 3. Form məlumatlarını və şəkil URL-lərini Server Action-a göndər
    const formData = new FormData(e.target)
    formData.append('image_urls', uploadedImageUrls.join(','))
    
    await createListing(formData)
    
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form inputs */}
      <div className="md:col-span-2">
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label>
        <input type="text" name="brand" id="brand" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
        <input type="text" name="model" id="model" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Buraxılış İli</label>
        <input type="number" name="year" id="year" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Qiymət (AZN)</label>
        <input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Yürüş (km)</label>
        <input type="number" name="mileage" id="mileage" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="engine_volume" className="block text-sm font-medium text-gray-700">Mühərrikin Həcmi</label>
        <input type="number" step="0.1" name="engine_volume" id="engine_volume" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">Yanacaq Növü</label>
        <select name="fuel_type" id="fuel_type" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option>Benzin</option>
          <option>Dizel</option>
          <option>Qaz</option>
          <option>Hibrid</option>
          <option>Elektro</option>
        </select>
      </div>
      <div>
        <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Sürətlər Qutusu</label>
        <select name="transmission" id="transmission" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option>Avtomat</option>
          <option>Mexaniki</option>
          <option>Robotlaşdırılmış</option>
          <option>Variator</option>
        </select>
      </div>
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">Rəng</label>
        <input type="text" name="color" id="color" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Şəhər</label>
        <input type="text" name="city" id="city" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Əlavə Məlumat</label>
        <textarea name="description" id="description" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Şəkillər</label>
        <input type="file" name="images" id="images" multiple required onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        <p className="mt-1 text-xs text-gray-500">Birdən çox şəkil seçə bilərsiniz.</p>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={uploading}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {uploading ? 'Göndərilir...' : 'Elanı Yerləşdir'}
        </button>
      </div>
      {message && <p className="md:col-span-2 text-center text-sm text-gray-600">{message}</p>}
    </form>
  )
}