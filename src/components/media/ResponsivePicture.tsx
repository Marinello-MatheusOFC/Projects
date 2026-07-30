import { useState } from 'react';

interface ResponsivePictureProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ResponsivePicture({
  src,
  alt,
  srcSet,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  loading,
  width,
  height,
  className = '',
  priority = false,
}: ResponsivePictureProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`img-fallback ${className}`}
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
        role="img"
        aria-label={alt}
      >
        <div className="img-fallback-content">
          <span className="img-fallback-icon" aria-hidden="true">🐾</span>
          <span className="img-fallback-text">Fotografia em breve</span>
        </div>
      </div>
    );
  }

  return (
    <picture className={className}>
      {srcSet && <source srcSet={srcSet} sizes={sizes} />}
      <img
        src={src}
        alt={alt}
        loading={priority ? undefined : loading || 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        style={{
          objectFit,
          objectPosition,
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
        }}
        onError={() => setError(true)}
      />
    </picture>
  );
}
