'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ListingImage({ src, alt, className = '', ...props }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [loaded, setLoaded] = useState(false)
  const [spot, setSpot] = useState({ x: 50, y: 50 })
  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-md has-spotlight"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setSpot({ x, y })
      }}
    >
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
      {/* Live spotlight follows cursor */}
      <div
        className="img-spotlight"
        style={{
          background: `radial-gradient(180px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,${hover ? 0.35 : 0}), transparent 55%)`
        }}
      />
      {/* Non-interactive shine layer (CSS-driven) */}
      <div className="shine-layer" />
    </div>
  )
}