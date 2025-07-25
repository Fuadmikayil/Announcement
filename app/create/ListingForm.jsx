
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { createListing } from './actions'
import { SubmitButton } from '../components/SubmitButton.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import Image from 'next/image'

const equipmentList = [
    { key: 'has_alloy_wheels', label: 'Yüngül lehimli disklər' },
    { key: 'has_abs', label: 'ABS' },
    { key: 'has_sunroof', label: 'Lyuk' },
    { key: 'has_rain_sensor', label: 'Yağış sensoru' },
    { key: 'has_central_locking', label: 'Mərkəzi qapanma' },
    { key: 'has_park_assist', label: 'Park radarı' },
    { key: 'has_ac', label: 'Kondisioner' },
    { key: 'has_heated_seats', label: 'Oturacaqların isidilməsi' },
    { key: 'has_leather_seats', label: 'Dəri salon' },
    { key: 'has_xenon_lights', label: 'Ksenon lampalar' },
    { key: 'has_360_camera', label: '360° kamera' },
    { key: 'has_rear_camera', label: 'Arxa görüntü kamerası' },
    { key: 'has_side_curtains', label: 'Yan pərdələr' },
    { key: 'has_ventilated_seats', label: 'Oturacaqların ventilyasiyası' },
];

export default function ListingForm({ userProfile, formOptions }) {
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState('')
  const [brandId, setBrandId] = useState('')
  const [model, setModel] = useState('')
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  
  // DÜZƏLİŞ: Yeni state-lər əlavə edildi
  const [bodyType, setBodyType] = useState('')
  const [color, setColor] = useState('')
  const [city, setCity] = useState('')

  const preventInvalidNumberInput = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };
 
  useEffect(() => {
    const fetchModels = async () => {
      if (!brandId) { setModels([]); return; }
      setIsLoadingModels(true);
      try {
        const response = await fetch(`/api/models?brand_id=${brandId}`);
        const data = await response.json();
        setModels(data || []);
      } catch (error) { console.error("Modelləri çəkmək mümkün olmadı:", error); setModels([]); } 
      finally { setIsLoadingModels(false); }
    };
    fetchModels();
  }, [brandId]);

  const handleFileChange = (e) => { 
    if (e.target.files) { 
      if (e.target.files.length > 10) {
        alert("Maksimum 10 şəkil yükləyə bilərsiniz.");
        e.target.value = '';
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

    const selectedBrand = formOptions.brands.find(b => b.id === parseInt(brandId, 10));
    if (selectedBrand) {
        currentFormData.set('brand', selectedBrand.name);
    }
    // DÜZƏLİŞ: State-dən gələn dəyərləri FormData-ya əlavə edirik
    currentFormData.set('model', model);
    currentFormData.set('body_type', bodyType);
    currentFormData.set('color', color);
    currentFormData.set('city', city);

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
 
  const brandOptions = formOptions.brands.map(b => ({ value: b.id, label: b.name }));
  const modelOptions = models.map(m => ({ value: m.name, label: m.name }));
  const cityOptions = formOptions.cities.map(c => ({ value: c, label: c }));
  const bodyTypeOptions = formOptions.bodyTypes.map(bt => ({ value: bt, label: bt }));
  const colorOptions = formOptions.colors.map(c => ({ value: c.name, label: c.name, hex: c.hex_code }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Əsas Məlumatlar</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Marka</label><CustomSelect options={brandOptions} value={brandId} onChange={setBrandId} placeholder="Seçin" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Model</label><CustomSelect options={modelOptions} value={model} onChange={setModel} placeholder={isLoadingModels ? "Yüklənir..." : "Seçin"} disabled={!brandId || isLoadingModels} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Ban növü</label><CustomSelect options={bodyTypeOptions} value={bodyType} onChange={setBodyType} placeholder="Seçin" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Yürüş, km</label><input type="number" name="mileage" required min="0" onKeyDown={preventInvalidNumberInput} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Rəng</label><CustomSelect options={colorOptions} value={color} onChange={setColor} placeholder="Seçin" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Qiymət</label>
                <div className="flex items-center gap-2">
                    <input type="number" name="price" required min="1" onKeyDown={preventInvalidNumberInput} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md" />
                    <div className="flex items-center"><input type="checkbox" name="credit" className="h-4 w-4 rounded mr-1" /> <span className="text-sm">Kredit</span></div>
                    <div className="flex items-center"><input type="checkbox" name="barter" className="h-4 w-4 rounded mr-1" /> <span className="text-sm">Barter</span></div>
                </div>
            </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Texniki Göstəricilər</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-600">Yanacaq növü</label><select name="fuel_type" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"><option>Benzin</option><option>Dizel</option><option>Qaz</option><option>Hibrid</option><option>Elektro</option></select></div>
            <div><label className="block text-sm font-medium text-gray-600">Sürətlər qutusu</label><select name="transmission" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"><option>Avtomat</option><option>Mexaniki</option><option>Robotlaşdırılmış</option><option>Variator</option></select></div>
            <div><label className="block text-sm font-medium text-gray-600">Buraxılış ili</label><input type="number" name="year" required min="1900" onKeyDown={preventInvalidNumberInput} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
            <div><label className="block text-sm font-medium text-gray-600">Mühərrikin həcmi, sm³</label><input type="number" step="0.1" name="engine_volume" required min="0.1" onKeyDown={preventInvalidNumberInput} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Şəhər</label><CustomSelect options={cityOptions} value={city} onChange={setCity} placeholder="Seçin" /></div>
        </div>
      </fieldset>

      <fieldset className="border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Avtomobilin təchizatı</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipmentList.map(item => (
                <label key={item.key} className="flex items-center text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" name={item.key} className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]" />
                    <span className="ml-2">{item.label}</span>
                </label>
            ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-lg font-semibold text-gray-700 -mt-10 bg-white px-2">Əlavə Məlumat və Şəkillər</legend>
        <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-600">Əlaqə Nömrəsi</label>
            <input type="tel" name="phone_number" id="phone_number" required defaultValue={userProfile?.phone_number || ''} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm text-gray-900" placeholder="+994 (XX) XXX-XX-XX" />
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Əlavə Məlumat</label>
            <textarea name="description" id="description" rows="5" className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"></textarea>
        </div>
        <div>
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
        </div>
      </fieldset>

      <div className="pt-5">
        <SubmitButton 
          pendingText="Göndərilir..."
          className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-[#4F39F6] hover:opacity-90 disabled:bg-indigo-400"
        >
          Elanı Yerləşdir
        </SubmitButton>
      </div>
      {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
    </form>
  )
}