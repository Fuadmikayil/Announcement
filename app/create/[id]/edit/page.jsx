'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSearchParams, useParams, notFound, useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'
import Image from 'next/image'
import { updateListing, deleteImage } from './actions'

// --- SVG Icons ---
const Trash2 = (props) => (
  <svg {...props} xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const UploadCloud = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
  </svg>
);
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

export default function EditListingPage() {
  const params = useParams();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listing, setListing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; }
        
        const listingId = params.id;
        const { data: listingData } = await supabase.from('listings').select('*').eq('id', listingId).single();
        if (!listingData) { notFound(); return; }
        
        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        
        const isUserAdmin = profileData?.role === 'admin';
        const isUserOwner = listingData.user_id === user.id;

        if (!isUserAdmin && !isUserOwner) { notFound(); return; }
        
        setListing(listingData);
        setFormData(listingData);
        setIsAdmin(isUserAdmin);
        setLoading(false);
    };

    fetchInitialData();
  }, [params.id, supabase]);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(current => current.filter((_, i) => i !== index));
    setPreviews(current => current.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (event) => {
      event.preventDefault();
      const submissionFormData = new FormData(event.currentTarget);
      newImages.forEach(file => {
          submissionFormData.append('new_images', file);
      });
      startTransition(() => updateListing(submissionFormData));
  };

  // === DÜZƏLİŞ BURADADIR: Şəkil silmək üçün yeni funksiya ===
  const handleDeleteImage = async (imageUrl) => {
    const data = new FormData();
    data.append('listingId', listing.id);
    data.append('imageUrl', imageUrl);

    startTransition(async () => {
        await deleteImage(data);
        // Səhifəni yeniləyərək silinmiş şəklin yox olmasını təmin edirik
        router.refresh();
    });
  };

  if (loading || !formData) {
    return <div className="container mx-auto max-w-4xl py-12 px-4 text-center">Yüklənir...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Elanı Redaktə Et</h1>
        
        {message && <p className="mb-4 text-center p-2 rounded-md bg-gray-100 text-gray-700">{message}</p>}

        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mövcud Şəkillər</h2>
            {listing.image_urls && listing.image_urls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listing.image_urls.map((url) => (
                        <div key={url} className="relative group">
                            <Image src={url} alt="Elan şəkli" width={200} height={150} className="rounded-md object-cover w-full h-32" />
                            
                            {/* === DÜZƏLİŞ BURADADIR: <form> əvəzinə <button> və onClick istifadə edirik === */}
                            <button 
                                type="button" 
                                onClick={() => handleDeleteImage(url)}
                                disabled={isPending}
                                title="Şəkli sil" 
                                className="absolute top-1 right-1 p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-400">
                                <Trash2 size={16} />
                            </button>

                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-500">Heç bir şəkil yoxdur.</p>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="hidden" name="listingId" value={listing.id} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şəkillər Əlavə Et</label>
            <label htmlFor="new_images_input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"><UploadCloud className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm font-semibold text-gray-600">Şəkil seçin</span><input type="file" name="new_images_input" id="new_images_input" multiple onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="sr-only"/></label>
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {previews.map((src, i) => (
                      <div key={i} className="relative group"><Image src={src} alt={`Preview ${i}`} width={150} height={150} className="rounded-md object-cover w-full h-28" /><button type="button" onClick={() => handleRemoveNewImage(i)} className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={16} /></button></div>
                  ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2"><hr /></div>

          <div className="md:col-span-2"><label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label><input type="text" name="brand" id="brand" required value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" required value={formData.model} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="year" className="block text-sm font-medium text-gray-700">Buraxılış İli</label><input type="number" name="year" id="year" required value={formData.year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="price" className="block text-sm font-medium text-gray-700">Qiymət (AZN)</label><input type="number" name="price" id="price" required value={formData.price} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Yürüş (km)</label><input type="number" name="mileage" id="mileage" required value={formData.mileage} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="engine_volume" className="block text-sm font-medium text-gray-700">Mühərrikin Həcmi</label><input type="number" step="0.1" name="engine_volume" id="engine_volume" required value={formData.engine_volume} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="color" className="block text-sm font-medium text-gray-700">Rəng</label><input type="text" name="color" id="color" required value={formData.color} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div><label htmlFor="city" className="block text-sm font-medium text-gray-700">Şəhər</label><input type="text" name="city" id="city" required value={formData.city} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
          <div className="md:col-span-2"><label htmlFor="description" className="block text-sm font-medium text-gray-700">Əlavə Məlumat</label><textarea name="description" id="description" rows="4" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"></textarea></div>

          {isAdmin && (
            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Elanın Statusu (Admin)</label>
              <select name="status" id="status" required value={formData.status} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900">
                <option value="pending">Gözləmədə</option>
                <option value="approved">Təsdiqlənib</option>
                <option value="rejected">Rədd edilib</option>
              </select>
            </div>
          )}
          
          <div className="md:col-span-2"><button type="submit" disabled={isPending} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">{isPending ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}</button></div>
        </form>
      </div>
    </div>
  )
}