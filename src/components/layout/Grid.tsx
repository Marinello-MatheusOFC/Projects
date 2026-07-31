import { HTMLAttributes } from 'react';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 2 | 3 | 4;
  smCols?: boolean;
  gap?: 'tight' | 'default' | 'loose';
}

export function Grid({ cols = 3, smCols = true, gap = 'default', className = '', ...props }: GridProps) {
  const gapClasses = { tight: 'grid--tight', default: '', loose: 'grid--loose' } as const;
  const colPrefix = smCols ? 'sm' : '';
  return (
    <div
      className={`grid grid--${colPrefix}${cols} ${gapClasses[gap]} ${className}`.trim()}
      {...props}
    />
  );
}
