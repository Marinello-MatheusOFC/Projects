import { ResponsivePicture, type FallbackContext } from '@/components/media/ResponsivePicture';

export interface MosaicItem {
  src: string;
  alt: string;
  caption?: string;
  fallback?: FallbackContext;
  tall?: boolean;
}

interface PhotoMosaicProps {
  items: MosaicItem[];
  className?: string;
}

export function PhotoMosaic({ items, className = '' }: PhotoMosaicProps) {
  return (
    <div className={`photo-mosaic ${className}`}>
      {items.map((item, index) => (
        <figure key={index} className={`photo-mosaic__item ${item.tall ? 'photo-mosaic__item--tall' : ''}`}>
          <ResponsivePicture
            src={item.src}
            alt={item.alt}
            objectFit="cover"
            objectPosition="center 45%"
            width={600}
            height={item.tall ? 800 : 450}
            fallback={item.fallback ?? 'gallery'}
          />
          {item.caption && (
            <figcaption className="photo-mosaic__caption">{item.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
