
'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ListingImage({ src, alt, ...props }) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc('https://placehold.co/600x400/e2e8f0/e2e8f0?text=No+Image')
      }}
    />
  )
}