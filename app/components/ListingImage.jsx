'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ListingImage({ src, alt, className = '', ...props }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md">
      {!loaded && <div className="skeleton" />}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
        onError={() => {
          setImgSrc('https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image')
          setLoaded(true)
        }}
      />
      {/* Non-interactive shine layer (CSS-driven) */}
      <div className="shine-layer" />
    </div>
  )
}