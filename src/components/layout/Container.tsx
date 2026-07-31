import { HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'header' | 'footer' | 'main';
  wide?: boolean;
}

export function Container({ as: Tag = 'div', wide = false, className = '', ...props }: ContainerProps) {
  return <Tag className={`container ${wide ? 'container--wide' : ''} ${className}`.trim()} {...props} />;
}
