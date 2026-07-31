import { ReactNode } from 'react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

interface MediaBlockProps {
  src: string;
  alt: string;
  children?: ReactNode;
  ratio?: '4x3' | '3x2' | '16x10' | '1x1' | '4x5' | '3x4';
  objectPosition?: string;
  fallback?: 'hero' | 'animal' | 'cat' | 'care' | 'event' | 'story' | 'gallery';
}

export function MediaBlock({
  src,
  alt,
  children,
  ratio = '4x3',
  objectPosition = 'center 50%',
  fallback = 'animal',
}: MediaBlockProps) {
  return (
    <figure className={`ratio ratio-${ratio} media-block`}>
      <ResponsivePicture
        src={src}
        alt={alt}
        objectFit="cover"
        objectPosition={objectPosition}
        width={800}
        height={600}
        fallback={fallback}
      />
      {children && <figcaption className="media-block__caption">{children}</figcaption>}
    </figure>
  );
}
