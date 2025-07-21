
'use client'
import { useState, useTransition } from 'react'
import { toggleFavorite } from '../favorites/actions'

export default function FavoriteButton({ listingId, isInitiallyFavorited }) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleFavorite(listingId, isFavorited);
      if (result.success) {
        setIsFavorited(!isFavorited)
      } else {
        alert(result.error || 'Bir xəta baş verdi.')
      }
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending} className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors disabled:opacity-50" aria-label="Favorilərə əlavə et">
      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21.5l-7.682-7.682a4.5 4.5 0 010-6.364z"/></svg>
    </button>
  )
}