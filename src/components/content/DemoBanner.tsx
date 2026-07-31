import { Info } from 'lucide-react';

export function isDemoContent(items: Array<{ id?: string | null }>): boolean {
  return items.some((item) => item.id?.startsWith('demo-'));
}

interface DemoBannerProps {
  label?: string;
}

export function DemoBanner({ label = 'Conteúdo demonstrativo' }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="note">
      <Info size={16} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
