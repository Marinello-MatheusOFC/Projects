import { HTMLAttributes } from 'react';

interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
}

export function SplitLayout({ reverse = false, className = '', ...props }: SplitLayoutProps) {
  return (
    <div
      className={`split ${reverse ? 'split--reverse' : ''} ${className}`.trim()}
      {...props}
    />
  );
}
