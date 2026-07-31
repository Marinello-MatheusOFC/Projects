interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, align = 'center', className = '' }: SectionHeaderProps) {
  return (
    <div className={`section-intro ${align === 'left' ? 'section-intro--left' : ''} ${className}`.trim()}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
