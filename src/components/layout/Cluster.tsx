import { HTMLAttributes } from 'react';

export function Cluster({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`cluster ${className}`.trim()} {...props} />;
}
