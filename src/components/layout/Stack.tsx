import { HTMLAttributes } from 'react';

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'tight' | 'default' | 'loose';
}

export function Stack({ gap = 'default', className = '', ...props }: StackProps) {
  const gaps = { tight: 'stack--tight', default: '', loose: 'stack--loose' } as const;
  return <div className={`stack ${gaps[gap]} ${className}`.trim()} {...props} />;
}
