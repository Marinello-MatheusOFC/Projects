import { useState, type CSSProperties } from 'react';
import {
  PawPrint,
  Sparkles,
  Camera,
  HandHeart,
  HeartHandshake,
  CalendarDays,
  Newspaper,
  Shirt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const FALLBACK_META: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  hero: { label: 'Animal em acolhimento', icon: PawPrint },
  animal: { label: 'Foto em atualização', icon: PawPrint },
  cat: { label: 'Foto em atualização', icon: PawPrint },
  story: { label: 'Momento de cuidado', icon: Sparkles },
  gallery: { label: 'Momento da ONG', icon: Camera },
  care: { label: 'Voluntários em ação', icon: HandHeart },
  help: { label: 'Forma de ajudar', icon: HeartHandshake },
  event: { label: 'Evento SOS Focinho Carente', icon: CalendarDays },
  news: { label: 'Notícia SOS Focinho Carente', icon: Newspaper },
  product: { label: 'Item do brechó', icon: Shirt },
};

export type FallbackContext = keyof typeof FALLBACK_META;

interface ResponsivePictureProps {
  src?: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  aspectRatio?: string;
  className?: string;
  priority?: boolean;
  fallback?: FallbackContext;
  fallbackLabel?: string;
  supabaseBucket?: string;
  supabasePath?: string;
}

function resolveSrc(props: ResponsivePictureProps): string {
  if (props.src) return props.src;
  if (props.supabaseBucket && props.supabasePath) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (supabaseUrl) {
      return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${props.supabaseBucket}/${props.supabasePath}`;
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
    aspectRatio,
    className = '',
    priority = false,
    fallback = 'animal',
    fallbackLabel,
  } = props;

  const [error, setError] = useState(false);
  const resolved = resolveSrc(props);

  const showFallback = error || !resolved;

  const wrapperStyle: CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    maxWidth: '100%',
    aspectRatio,
  };

  if (showFallback) {
    const meta = FALLBACK_META[fallback] ?? { label: 'Foto em atualização', icon: PawPrint };
    const label = fallbackLabel ?? meta.label;
    const FallbackIcon = meta.icon;
    return (
      <div
        className={`${className} image-fallback image-fallback--${fallback}`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        style={wrapperStyle}
        data-testid="responsive-picture-fallback"
      >
        <span className="image-fallback-icon" aria-hidden="true">
          <FallbackIcon size={28} strokeWidth={1.75} />
        </span>
        {label && <span className="image-fallback-text">{label}</span>}
      </div>
    );
  }

  return (
    <picture className={className} style={wrapperStyle}>
      {srcSet && <source srcSet={srcSet} sizes={sizes} />}
      <img
        src={resolved}
        alt={alt}
        loading={priority ? undefined : loading || 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={() => setError(true)}
        style={{
          objectFit,
          objectPosition,
          width: '100%',
          height: '100%',
        }}
      />
    </picture>
  );
}
