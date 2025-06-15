
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchFilters({ uniqueBrands }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL-dən mövcud axtarış parametrlərini götürərək formanın ilkin vəziyyətini təyin edirik
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)

    // Yeni URL-ə yönləndiririk, bu da ana səhifənin yenidən yüklənməsinə və nəticələrin süzülməsinə səbəb olur
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label>
          <input
            type="text"
            id="brand"
            list="brands-list"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Bütün markalar"
          />
          <datalist id="brands-list">
            {uniqueBrands?.map((b) => <option key={b.brand} value={b.brand} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Bütün modellər"
          />
        </div>
        <div>
          <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">Qiymət, min.</label>
          <input
            type="number"
            id="min-price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">Qiymət, maks.</label>
          <input
            type="number"
            id="max-price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="∞"
          />
        </div>
        <div className="md:col-span-3 lg:col-span-1">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Axtar
          </button>
        </div>
      </form>
    </div>
  )
}