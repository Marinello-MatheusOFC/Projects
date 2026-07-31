interface ColorSectionProps {
  variant?: 'warm' | 'cream' | 'coral' | 'green' | 'yellow' | 'deep';
  className?: string;
  id?: string;
  children: React.ReactNode;
}

export function ColorSection({
  variant = 'cream',
  className = '',
  id,
  children,
}: ColorSectionProps) {
  return (
    <section
      id={id}
      className={`section color-section color-section--${variant} ${className}`}
    >
      {children}
    </section>
  );
}
