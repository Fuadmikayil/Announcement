// FAYL: /app/components/SearchFilters.jsx (YENİLƏNMİŞ DİZAYN)
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchFilters({ uniqueValues }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '')
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (city) params.set('city', city)
    if (fuelType) params.set('fuelType', fuelType)
    if (transmission) params.set('transmission', transmission)
    
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
      router.push('/')
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-200">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-4">
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
        {/* Qiymət aralığı */}
        <div className="lg:col-span-1 xl:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-600 mb-1">Qiymət, min.</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₼</span>
                <input type="number" id="min-price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="0" />
            </div>
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-600 mb-1">maks.</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₼</span>
                <input type="number" id="max-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="∞" />
            </div>
          </div>
        </div>
        
        {/* Düymələr */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
