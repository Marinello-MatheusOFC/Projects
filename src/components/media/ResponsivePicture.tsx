import { useState } from 'react';

const FALLBACK_MAP: Record<string, string> = {
  hero: '/images/placeholders/hero-dog.svg',
  animal: '/images/placeholders/animal-dog.svg',
  cat: '/images/placeholders/animal-cat.svg',
  story: '/images/placeholders/story.svg',
  gallery: '/images/placeholders/gallery.svg',
  care: '/images/placeholders/care.svg',
  help: '/images/placeholders/help.svg',
  event: '/images/placeholders/event.svg',
};

interface ResponsivePictureProps {
  src?: string;
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
  fallback?: keyof typeof FALLBACK_MAP;
  supabaseBucket?: string;
  supabasePath?: string;
}

function resolveSrc(props: ResponsivePictureProps): string {
  if (props.src) return props.src;
  if (props.supabaseBucket && props.supabasePath) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${props.supabaseBucket}/${props.supabasePath}`;
    }
  }
  return '';
}

export function ResponsivePicture(props: ResponsivePictureProps) {
  const {
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
    fallback = 'animal',
  } = props;

  const [error, setError] = useState(false);
  const resolved = resolveSrc(props);

  const showFallback = error || !resolved;

  if (showFallback) {
    const fallbackSrc = FALLBACK_MAP[fallback] || FALLBACK_MAP.animal;
    return (
      <picture className={className}>
        <img
          src={fallbackSrc}
          alt={alt}
          loading={priority ? undefined : loading || 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '100%',
          }}
        />
      </picture>
    );
  }

  return (
    <picture className={className}>
      {srcSet && <source srcSet={srcSet} sizes={sizes} />}
      <img
        src={resolved}
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
