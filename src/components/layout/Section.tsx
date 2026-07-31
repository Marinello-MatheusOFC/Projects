import { HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alt' | 'warm' | 'deep';
  compact?: boolean;
}

type SectionVariant = NonNullable<SectionProps['variant']>;

export function Section({ variant = 'default', compact = false, className = '', ...props }: SectionProps) {
  const variants: Record<SectionVariant, string> = {
    default: '',
    alt: 'section--alt',
    warm: 'section--warm',
    deep: 'section--deep',
  };
  return (
    <section
      className={`section ${variants[variant]} ${compact ? 'section--compact' : ''} ${className}`.trim()}
      {...props}
    />
  );
}
