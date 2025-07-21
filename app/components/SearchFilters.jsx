
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
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marka */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label>
          <input type="text" id="brand" list="brands-list" value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" placeholder="Bütün markalar" />
          <datalist id="brands-list">
            {uniqueValues?.brands?.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>
        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
          <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" placeholder="Bütün modellər" />
        </div>
        {/* Şəhər */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">Şəhər</label>
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900">
            <option value="">Bütün şəhərlər</option>
            {uniqueValues?.cities?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Yanacaq növü */}
        <div>
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Yanacaq növü</label>
          <select id="fuelType" value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900">
            <option value="">Hamısı</option>
            {uniqueValues?.fuelTypes?.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Sürətlər qutusu */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Sürətlər qutusu</label>
          <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900">
            <option value="">Hamısı</option>
            {uniqueValues?.transmissions?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {/* Qiymət aralığı */}
        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">Qiymət, min.</label>
            <input type="number" id="min-price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" placeholder="0" />
          </div>
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">maks.</label>
            <input type="number" id="max-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900" placeholder="∞" />
          </div>
        </div>
        {/* Düymələr */}
        <div className="lg:col-span-2 flex items-end gap-2">
           <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700">Axtar</button>
           <button type="button" onClick={clearFilters} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300">Təmizlə</button>
        </div>
      </form>
    </div>
  )
}