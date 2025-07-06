'use client'
import Image from 'next/image'

interface EventImageProps {
  src: string
  alt: string
}

export default function EventImage({ src, alt }: EventImageProps) {
  return (
    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={192}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
    </div>
  )
} 