// FAYL: /app/components/SearchFilters.jsx (YENİLƏNMİŞ DİZAYN VƏ FUNKSİONALLIQ)
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchFilters({ uniqueValues }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Bütün axtarış sahələri üçün state-lər
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '')
  const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '')
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '')
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '')
  const [color, setColor] = useState(searchParams.get('color') || '')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minYear) params.set('minYear', minYear)
    if (maxYear) params.set('maxYear', maxYear)
    if (fuelType) params.set('fuelType', fuelType)
    if (transmission) params.set('transmission', transmission)
    if (color) params.set('color', color)
    
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
      router.push('/')
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {/* Marka */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-600 mb-1">Marka</label>
          <input type="text" id="brand" list="brands-list" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Bütün markalar" />
          <datalist id="brands-list">
            {uniqueValues?.brands?.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>
        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-600 mb-1">Model</label>
          <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Bütün modellər" />
        </div>
        {/* Şəhər */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">Şəhər</label>
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition">
            <option value="">Bütün şəhərlər</option>
            {uniqueValues?.cities?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Rəng */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-600 mb-1">Rəng</label>
          <input type="text" id="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="İstənilən" />
        </div>
        {/* Qiymət aralığı */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-600 mb-1">Qiymət, min.</label>
            <input type="number" id="min-price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="0" />
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-600 mb-1">maks.</label>
            <input type="number" id="max-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="∞" />
          </div>
        </div>
        {/* Buraxılış ili aralığı */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-year" className="block text-sm font-medium text-gray-600 mb-1">İl, min.</label>
            <input type="number" id="min-year" value={minYear} onChange={(e) => setMinYear(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="1980" />
          </div>
          <div>
            <label htmlFor="max-year" className="block text-sm font-medium text-gray-600 mb-1">maks.</label>
            <input type="number" id="max-year" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder={new Date().getFullYear()} />
          </div>
        </div>
        {/* Yanacaq növü */}
        <div>
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-600 mb-1">Yanacaq növü</label>
          <select id="fuelType" value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition">
            <option value="">Hamısı</option>
            {uniqueValues?.fuelTypes?.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Sürətlər qutusu */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-gray-600 mb-1">Sürətlər qutusu</label>
          <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition">
            <option value="">Hamısı</option>
            {uniqueValues?.transmissions?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        {/* Düymələr */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
           <button type="button" onClick={clearFilters} className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Filtri Təmizlə
           </button>
           <button type="submit" className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Axtar
           </button>
        </div>
      </form>
    </div>
  )
}
