'use client'

interface EventImageProps {
  src: string
  alt: string
}

export default function EventImage({ src, alt }: EventImageProps) {
  return (
    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
    </div>
  )
} 