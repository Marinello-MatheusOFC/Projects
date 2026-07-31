import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

export type HelpPathTone =
  | 'coral'
  | 'green'
  | 'yellow'
  | 'soft-coral'
  | 'soft-green'
  | 'soft-yellow';

interface HelpPathProps {
  variant?: 'large' | 'compact' | 'panel';
  tone: HelpPathTone;
  title: string;
  description: string;
  image?: { src: string; alt: string };
  action?: { to: string; label: string };
  footnote?: string;
}

export function HelpPath({
  variant = 'compact',
  tone,
  title,
  description,
  image,
  action,
  footnote,
}: HelpPathProps) {
  return (
    <div className={`help-path help-path--${variant} help-path--${tone}`}>
      {variant === 'panel' ? (
        <>
          <div className="help-path__body">
            <h3>{title}</h3>
            <p>{description}</p>
            {footnote && <p className="help-path__footnote">{footnote}</p>}
          </div>
          {action && (
            <Link to={action.to} className="help-path__action">
              {action.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </>
      ) : (
        <>
          {image && (
            <div className="help-path__image">
              <ResponsivePicture
                src={image.src}
                alt={image.alt}
                objectFit="cover"
                objectPosition="center 45%"
                width={720}
                height={480}
                fallback="help"
              />
            </div>
          )}
          <div className="help-path__body">
            <h3>{title}</h3>
            <p>{description}</p>
            {footnote && <p className="help-path__footnote">{footnote}</p>}
            {action && (
              <Link to={action.to} className="help-path__action">
                {action.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
