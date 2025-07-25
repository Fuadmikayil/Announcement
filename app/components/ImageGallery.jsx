
// AÇIQLAMA: Tam ekran şəkil üçün olan <Image> komponentindəki səhv atributlar düzəldildi.
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ListingImage from './ListingImage.jsx'
import Image from 'next/image'

export default function ImageGallery({ images, alt }) {
  const defaultImages = ['https://placehold.co/800x600/e2e8f0/e2e8f0?text=No+Image'];
  const imageList = (!images || images.length === 0) ? defaultImages : images;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fullscreenSrc, setFullscreenSrc] = useState(null);
  const timerRef = useRef(null);

  const nextImage = useCallback(() => {
    setActiveImageIndex((current) => (current + 1) % imageList.length);
  }, [imageList.length]);

  useEffect(() => {
    if (imageList.length > 1 && !isPaused) {
      timerRef.current = setInterval(nextImage, 2000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [imageList.length, nextImage, isPaused]);

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  const openFullscreen = () => {
    setFullscreenSrc(imageList[activeImageIndex]);
    setIsPaused(true);
  };

  const closeFullscreen = () => {
    setFullscreenSrc(null);
    setIsPaused(false);
  };

  return (
    <div>
      <div className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden shadow-lg mb-4 border bg-gray-200 cursor-pointer" onClick={openFullscreen}>
        {imageList.map((url, index) => (
            <div
                key={index}
                className={`transition-opacity duration-500 ease-in-out absolute inset-0 ${index === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
            >
                <ListingImage
                    src={url}
                    alt={alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                />
            </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {imageList.map((url, index) => (
          <div 
            key={index} 
            className={`relative w-full h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${activeImageIndex === index ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-indigo-300'}`}
            onClick={() => handleThumbnailClick(index)}
          >
            <ListingImage 
              src={url} 
              alt={`Şəkil ${index + 1}`} 
              fill 
              className="object-cover" 
              sizes="(max-width: 640px) 33vw, 20vw"
            />
          </div>
        ))}
      </div>

      {fullscreenSrc && (
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
            onClick={closeFullscreen}
        >
            <button className="absolute top-4 right-4 text-white text-4xl z-10">&times;</button>
            <div className="relative w-full h-full max-w-screen-lg max-h-screen-lg" onClick={(e) => e.stopPropagation()}>
                {/* DÜZƏLİŞ BURADADIR: Köhnəlmiş atributlar yeniləri ilə əvəz edildi */}
                <Image src={fullscreenSrc} alt={alt} fill style={{ objectFit: 'contain' }} />
            </div>
        </div>
      )}
    </div>
  )
}