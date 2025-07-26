'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { createListing } from './actions'
import { SubmitButton } from '../components/SubmitButton.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import Image from 'next/image'

// --- SVG Icons (replaces lucide-react import) ---
const UploadCloud = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
// --- End SVG Icons ---

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

// --- Helper Components moved outside the main component ---
const FormSection = ({ title, children }) => (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {children}
        </div>
    </div>
);

const FormField = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
        {children}
    </div>
);

export default function ListingForm({ userProfile, formOptions }) {
  // --- State for all form fields to create a fully controlled component ---
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState('')
  
  // CustomSelect states
  const [brandId, setBrandId] = useState('')
  const [model, setModel] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [color, setColor] = useState('')
  const [city, setCity] = useState('')
  
  // Other input states
  const [isNew, setIsNew] = useState(false);
  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [credit, setCredit] = useState(false);
  const [barter, setBarter] = useState(false);
  const [fuelType, setFuelType] = useState('Benzin');
  const [transmission, setTransmission] = useState('Avtomat');
  const [year, setYear] = useState('');
  const [engineVolume, setEngineVolume] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState({});

  // State for dynamic model fetching
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)

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

  // --- DÜZƏLİŞ EDİLMİŞ HİSSƏ ---
  // Bu useEffect, "Yeni" və "Sürülmüş" seçimləri arasında keçid edərkən
  // "Yürüş" sahəsini düzgün idarə edir.
  useEffect(() => {
    if (isNew) {
        setMileage('0');
    } else {
        // Əgər istifadəçi "Sürülmüş" seçiminə qayıdırsa,
        // sahəni təmizləyərək yeni dəyər daxil etməyi asanlaşdırır.
        setMileage('');
    }
  }, [isNew]);
  // --- DÜZƏLİŞİN SONU ---

  const handleFileChange = (e) => { 
    if (e.target.files) { 
        const newFiles = Array.from(e.target.files);
        if (files.length + newFiles.length > 10) {
            setMessage("Maksimum 10 şəkil yükləyə bilərsiniz.");
            return;
        }
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    } 
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  }

  const handleEquipmentChange = (e) => {
    const { name, checked } = e.target;
    setEquipment(prev => ({ ...prev, [name]: checked }));
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage('Elan yerləşdirilir, lütfən gözləyin...');
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Xəta: İstifadəçi tapılmadı.'); return }
    
    setMessage('Şəkillər yüklənir...');
    const uploadedImageUrls = [];
    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('listings-images').upload(filePath, file);
      if (uploadError) { console.error(uploadError); setMessage(`'${file.name}' yüklənərkən xəta.`); return }
      const { data: { publicUrl } } = supabase.storage.from('listings-images').getPublicUrl(filePath);
      uploadedImageUrls.push(publicUrl)
    }
    
    setMessage('Məlumatlar göndərilir...');

    // --- Build FormData from state ---
    const dataToSend = new FormData();
    const selectedBrand = formOptions.brands.find(b => b.id === parseInt(brandId, 10));
    
    dataToSend.append('brand', selectedBrand ? selectedBrand.name : '');
    dataToSend.append('model', model);
    dataToSend.append('body_type', bodyType);
    dataToSend.append('color', color);
    dataToSend.append('city', city);
    dataToSend.append('is_new', isNew);
    dataToSend.append('price', price);
    dataToSend.append('mileage', isNew ? '0' : mileage);
    dataToSend.append('credit', credit);
    dataToSend.append('barter', barter);
    dataToSend.append('fuel_type', fuelType);
    dataToSend.append('transmission', transmission);
    dataToSend.append('year', year);
    dataToSend.append('engine_volume', engineVolume);
    dataToSend.append('phone_number', phoneNumber);
    dataToSend.append('description', description);
    dataToSend.append('image_urls', uploadedImageUrls.join(','));

    Object.entries(equipment).forEach(([key, value]) => {
        if (value) {
            dataToSend.append(key, 'on'); // 'on' is the standard value for a checked checkbox in FormData
        }
    });
    
    const result = await createListing(dataToSend);
    if (result?.error) {
        setMessage(`Xəta: ${result.error}`);
    } else {
        setMessage('Elan uğurla yerləşdirildi!');
        // Optionally reset form here
    }
  }
 
  const brandOptions = formOptions.brands.map(b => ({ value: b.id, label: b.name }));
  const modelOptions = models.map(m => ({ value: m.name, label: m.name }));
  const cityOptions = formOptions.cities.map(c => ({ value: c, label: c }));
  const bodyTypeOptions = formOptions.bodyTypes.map(bt => ({ value: bt, label: bt }));
  const colorOptions = formOptions.colors.map(c => ({ value: c.name, label: c.name, hex: c.hex_code }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-4xl mx-auto p-2 sm:p-4 md:p-0">
      <FormSection title="Əsas Məlumatlar">
        <FormField label="Marka"><CustomSelect options={brandOptions} value={brandId} onChange={setBrandId} placeholder="Marka seçin" /></FormField>
        <FormField label="Model"><CustomSelect options={modelOptions} value={model} onChange={setModel} placeholder={isLoadingModels ? "Yüklənir..." : "Model seçin"} disabled={!brandId || isLoadingModels} /></FormField>
        
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Vəziyyəti</label>
            <div className="flex rounded-lg border p-1 bg-gray-50 max-w-xs">
                <button type="button" onClick={() => setIsNew(false)} className={`w-1/2 py-2 text-sm rounded-md transition-colors ${!isNew ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-200'}`}>Sürülmüş</button>
                <button type="button" onClick={() => setIsNew(true)} className={`w-1/2 py-2 text-sm rounded-md transition-colors ${isNew ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-200'}`}>Yeni</button>
            </div>
        </div>

        <FormField label="Ban növü"><CustomSelect options={bodyTypeOptions} value={bodyType} onChange={setBodyType} placeholder="Ban növü seçin" /></FormField>
        <FormField label="Yürüş, km"><input type="number" name="mileage" required={!isNew} disabled={isNew} value={mileage} onChange={(e) => setMileage(e.target.value)} min="0" onKeyDown={preventInvalidNumberInput} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100" /></FormField>
        <FormField label="Rəng"><CustomSelect options={colorOptions} value={color} onChange={setColor} placeholder="Rəng seçin" /></FormField>
        <FormField label="Qiymət" className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <input type="number" name="price" required value={price} onChange={(e) => setPrice(e.target.value)} min="1" onKeyDown={preventInvalidNumberInput} className="w-full max-w-xs px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                <label className="flex items-center"><input type="checkbox" name="credit" checked={credit} onChange={(e) => setCredit(e.target.checked)} className="h-4 w-4 rounded mr-2 text-indigo-600 focus:ring-indigo-500" /> <span className="text-sm text-gray-700">Kredit</span></label>
                <label className="flex items-center"><input type="checkbox" name="barter" checked={barter} onChange={(e) => setBarter(e.target.checked)} className="h-4 w-4 rounded mr-2 text-indigo-600 focus:ring-indigo-500" /> <span className="text-sm text-gray-700">Barter</span></label>
            </div>
        </FormField>
      </FormSection>

      <FormSection title="Texniki Göstəricilər">
        <FormField label="Yanacaq növü"><select name="fuel_type" required value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option>Benzin</option><option>Dizel</option><option>Qaz</option><option>Hibrid</option><option>Elektro</option></select></FormField>
        <FormField label="Sürətlər qutusu"><select name="transmission" required value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option>Avtomat</option><option>Mexaniki</option><option>Robotlaşdırılmış</option><option>Variator</option></select></FormField>
        <FormField label="Buraxılış ili"><input type="number" name="year" required value={year} onChange={(e) => setYear(e.target.value)} min="1900" max={new Date().getFullYear()} onKeyDown={preventInvalidNumberInput} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></FormField>
        <FormField label="Mühərrikin həcmi, sm³"><input type="number" step="100" name="engine_volume" required value={engineVolume} onChange={(e) => setEngineVolume(e.target.value)} min="100" onKeyDown={preventInvalidNumberInput} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></FormField>
        <FormField label="Şəhər" className="md:col-span-2"><CustomSelect options={cityOptions} value={city} onChange={setCity} placeholder="Şəhər seçin" /></FormField>
      </FormSection>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Avtomobilin Təchizatı</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {equipmentList.map(item => (
                <label key={item.key} className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-indigo-600">
                    <input type="checkbox" name={item.key} checked={!!equipment[item.key]} onChange={handleEquipmentChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2">{item.label}</span>
                </label>
            ))}
        </div>
      </div>
      
      <FormSection title="Əlavə Məlumat və Şəkillər">
        <FormField label="Əlaqə Nömrəsi" className="md:col-span-2">
            <input type="tel" name="phone_number" id="phone_number" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="+994 (XX) XXX-XX-XX" />
        </FormField>
        <FormField label="Əlavə Məlumat" className="md:col-span-2">
            <textarea name="description" id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Avtomobil haqqında ətraflı məlumat..."></textarea>
        </FormField>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Şəkillər</label>
            <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm font-semibold text-gray-600">Şəkilləri seçin və ya bura atın</span>
                <span className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP (Maks. 10 şəkil)</span>
                <input type="file" name="images" id="images" multiple onChange={handleFileChange} className="sr-only"/>
            </label>
            {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                    {files.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                            <Image src={URL.createObjectURL(file)} alt={`Preview ${i}`} fill sizes="120px" className="object-cover" />
                            <button type="button" onClick={() => handleRemoveFile(i)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </FormSection>

      <div className="pt-2">
        {message && <p className="text-center text-sm text-gray-600 mb-4 p-3 bg-gray-100 rounded-md">{message}</p>}
        <SubmitButton 
          pendingText="Göndərilir..."
          className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
        >
          Elanı Yerləşdir
        </SubmitButton>
      </div>
    </form>
  )
}
