interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Badge({ variant = 'default', children, title, className }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}${className ? ` ${className}` : ''}`} title={title}>
      {children}
    </span>
  );
}
