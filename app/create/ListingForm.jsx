
'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { createListing } from './actions'
import { SubmitButton } from '../components/SubmitButton.jsx'
import Image from 'next/image'

export default function ListingForm({ userProfile }) {
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState('')
 
  const handleFileChange = (e) => { 
    if (e.target.files) { 
      if (e.target.files.length > 10) {
        alert("Maksimum 10 şəkil yükləyə bilərsiniz.");
        e.target.value = ''; // Seçimi təmizlə
        return;
      }
      setFiles(Array.from(e.target.files));
    } 
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage('Şəkillər yüklənir...');
    
    const formElement = e.currentTarget;
    const currentFormData = new FormData(formElement);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Xəta: İstifadəçi tapılmadı.'); return }
    
    const uploadedImageUrls = [];
    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('listings-images').upload(filePath, file);
      if (uploadError) { console.error(uploadError); setMessage(`'${file.name}' yüklənərkən xəta.`); return }
      const { data: { publicUrl } } = supabase.storage.from('listings-images').getPublicUrl(filePath);
      uploadedImageUrls.push(publicUrl)
    }
    
    setMessage('Məlumatlar göndərilir...');

    const dataToSend = new FormData();
    for (const [key, value] of currentFormData.entries()) {
        if (key !== 'images') {
            dataToSend.append(key, value);
        }
    }
    dataToSend.append('image_urls', uploadedImageUrls.join(','));
    
    await createListing(dataToSend);
  }
 
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Əsas Məlumatlar */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Əsas Məlumatlar</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="brand" className="block text-sm font-medium text-gray-600">Marka</label><input type="text" name="brand" id="brand" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="model" className="block text-sm font-medium text-gray-600">Model</label><input type="text" name="model" id="model" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="year" className="block text-sm font-medium text-gray-600">Buraxılış İli</label><input type="number" name="year" id="year" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="price" className="block text-sm font-medium text-gray-600">Qiymət (AZN)</label><input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
        </div>
      </fieldset>

      {/* Texniki Göstəricilər */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Texniki Göstəricilər</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="mileage" className="block text-sm font-medium text-gray-600">Yürüş (km)</label><input type="number" name="mileage" id="mileage" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="engine_volume" className="block text-sm font-medium text-gray-600">Mühərrikin Həcmi</label><input type="number" step="0.1" name="engine_volume" id="engine_volume" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="fuel_type" className="block text-sm font-medium text-gray-600">Yanacaq Növü</label><select name="fuel_type" id="fuel_type" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"><option>Benzin</option><option>Dizel</option><option>Qaz</option><option>Hibrid</option><option>Elektro</option></select></div>
            <div><label htmlFor="transmission" className="block text-sm font-medium text-gray-600">Sürətlər Qutusu</label><select name="transmission" id="transmission" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"><option>Avtomat</option><option>Mexaniki</option><option>Robotlaşdırılmış</option><option>Variator</option></select></div>
            <div><label htmlFor="color" className="block text-sm font-medium text-gray-600">Rəng</label><input type="text" name="color" id="color" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            <div><label htmlFor="city" className="block text-sm font-medium text-gray-600">Şəhər</label><input type="text" name="city" id="city" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
        </div>
      </fieldset>

      {/* Əlaqə və Əlavə Məlumat */}
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Əlaqə və Əlavə Məlumat</legend>
        <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-600">Əlaqə Nömrəsi</label>
            <input type="tel" name="phone_number" id="phone_number" required defaultValue={userProfile?.phone_number || ''} className="mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" placeholder="+994 (XX) XXX-XX-XX" />
            <p className="mt-1 text-xs text-gray-500">Bu nömrə elanınızda göstəriləcək.</p>
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Əlavə Məlumat</label>
            <textarea name="description" id="description" rows="4" className="mt-1 pl-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
      </fieldset>

      {/* Şəkillər */}
      <fieldset className="border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Şəkillər</legend>
        <label htmlFor="images" className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-indigo-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="mt-2 block text-sm font-medium text-gray-600">Şəkilləri bura çəkib atın və ya seçin</span>
            <span className="mt-1 block text-xs text-gray-500">PNG, JPG, WEBP (Maks. 10 şəkil)</span>
            <input type="file" name="images" id="images" multiple required onChange={handleFileChange} className="sr-only"/>
        </label>
        {files.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
                {files.map((file, i) => (
                    <div key={i} className="relative h-20 rounded-md overflow-hidden">
                        <Image src={URL.createObjectURL(file)} alt={`Preview ${i}`} fill className="object-cover" />
                    </div>
                ))}
            </div>
        )}
      </fieldset>

      <div className="pt-5">
        <SubmitButton 
          pendingText="Göndərilir..."
          className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          Elanı Yerləşdir
        </SubmitButton>
      </div>
      {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
    </form>
  )
}