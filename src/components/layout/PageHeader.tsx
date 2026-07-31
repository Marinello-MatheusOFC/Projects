import { ResponsivePicture, type FallbackContext } from '@/components/media/ResponsivePicture';

interface PageHeaderMedia {
  src: string;
  alt: string;
  objectPosition?: string;
  fallback?: FallbackContext;
  width?: number;
  height?: number;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  media?: PageHeaderMedia;
}

export function PageHeader({ eyebrow, title, subtitle, actions, media }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="page-header__inner">
        <div>
          {eyebrow && <span className="page-header__eyebrow">{eyebrow}</span>}
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
          {actions && <div className="page-header__actions">{actions}</div>}
        </div>
        {media && (
          <div className="page-header__media">
            <ResponsivePicture
              src={media.src}
              alt={media.alt}
              objectFit="cover"
              objectPosition={media.objectPosition ?? 'center 50%'}
              priority
              width={media.width ?? 960}
              height={media.height ?? 720}
              fallback={media.fallback ?? 'animal'}
            />
          </div>
        )}
      </div>
    </section>
  );
}
