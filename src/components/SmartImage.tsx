"use client";

import Image from "next/image";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  priority?: boolean;
}

// List of domains that are configured in next.config.ts
const ALLOWED_DOMAINS = [
  'cdn.pixabay.com',
  'images.unsplash.com',
  'picsum.photos',
  'via.placeholder.com',
  'cdn.prod.website-files.com',
  'www.tastingtable.com',
  'images.pexels.com',
  'img.freepik.com',
  'static.vecteezy.com',
];

export default function SmartImage({
  src,
  alt,
  width = 200,
  height = 200,
  className = "",
  onError,
  priority = false,
}: SmartImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if the domain is allowed for Next.js Image
  const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
    src.includes(domain)
  );

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  // If domain is not allowed or we've had an error, use regular img tag
  if (!isAllowedDomain || useFallback || hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Use Next.js Image for allowed domains
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={(e) => {
        console.warn(`Next.js Image failed for ${src}, falling back to regular img tag`);
        setUseFallback(true);
        handleError(e);
      }}
    />
  );
} 