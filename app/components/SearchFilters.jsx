
// AÇIQLAMA: Standart <select> elementləri yeni <CustomSelect> komponenti ilə əvəz edildi.
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import CustomSelect from './CustomSelect.jsx'

export default function SearchFilters({ uniqueValues }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [brandId, setBrandId] = useState(searchParams.get('brandId') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '')
  const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '')
  const [color, setColor] = useState(searchParams.get('color') || '')

  useEffect(() => {
    const fetchModels = async () => {
      if (!brandId) {
        setModels([]);
        setModel('');
        return;
      }
      setIsLoadingModels(true);
      try {
        const response = await fetch(`/api/models?brand_id=${brandId}`);
        const data = await response.json();
        setModels(data || []);
      } catch (error) {
        console.error("Modelləri çəkmək mümkün olmadı:", error);
        setModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, [brandId]);

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    const selectedBrand = uniqueValues.brands.find(b => b.id === parseInt(brandId, 10));
    if (selectedBrand) params.set('brand', selectedBrand.name);
    
    if (model) params.set('model', model)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minYear) params.set('minYear', minYear)
    if (maxYear) params.set('maxYear', maxYear)
    if (color) params.set('color', color)
    
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
      router.push('/')
  }

  // CustomSelect üçün datanı düzgün formata salırıq
  const brandOptions = uniqueValues.brands.map(b => ({ value: b.id, label: b.name }));
  const modelOptions = models.map(m => ({ value: m.name, label: m.name }));
  const cityOptions = uniqueValues.cities.map(c => ({ value: c, label: c }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Marka</label>
          <CustomSelect
            options={brandOptions}
            value={brandId}
            onChange={(value) => setBrandId(value)}
            placeholder="Bütün markalar"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Model</label>
          <CustomSelect
            options={modelOptions}
            value={model}
            onChange={(value) => setModel(value)}
            placeholder={isLoadingModels ? "Yüklənir..." : "Bütün modellər"}
            disabled={!brandId || isLoadingModels}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Şəhər</label>
          <CustomSelect
            options={cityOptions}
            value={city}
            onChange={(value) => setCity(value)}
            placeholder="Bütün şəhərlər"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-600 mb-1">Qiymət, min.</label>
            <input type="number" id="min-price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md" placeholder="0" />
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-600 mb-1">maks.</label>
            <input type="number" id="max-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md" placeholder="∞" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-year" className="block text-sm font-medium text-gray-600 mb-1">İl, min.</label>
            <input type="number" id="min-year" value={minYear} onChange={(e) => setMinYear(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md" placeholder="1980" />
          </div>
          <div>
            <label htmlFor="max-year" className="block text-sm font-medium text-gray-600 mb-1">maks.</label>
            <input type="number" id="max-year" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md" placeholder={new Date().getFullYear()} />
          </div>
        </div>
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-600 mb-1">Rəng</label>
          <input type="text" id="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md" placeholder="İstənilən" />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
           <button type="button" onClick={clearFilters} className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Filtri Təmizlə
           </button>
           <button type="submit" className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Axtar
           </button>
        </div>
      </form>
    </div>
  )
}