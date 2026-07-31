import { Link } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CurrentNeedsProps {
  needs?: string[];
  contactTo?: string;
}

const POSSIBLE_CATEGORIES = [
  'Ração',
  'Medicamentos',
  'Produtos de limpeza',
  'Transporte',
  'Lar temporário',
  'Voluntários',
  'Divulgação',
];

export function CurrentNeeds({ needs, contactTo = '/contato' }: CurrentNeedsProps) {
  const hasNeeds = Array.isArray(needs) && needs.length > 0;

  return (
    <div className="current-needs">
      <div className="current-needs__icon" aria-hidden="true">
        <HeartHandshake size={24} strokeWidth={1.75} />
      </div>
      <div className="current-needs__body">
        <h3>O que a ONG precisa agora</h3>
        {hasNeeds ? (
          <ul className="current-needs__list">
            {needs.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        ) : (
          <p>
            As necessidades atuais são informadas diretamente pela equipe da
            SOS Focinho Carente. Entre em contato para saber o que é mais
            urgente no momento.
          </p>
        )}
        <p className="current-needs__hint">
          Exemplos de itens que costumam ser úteis: {POSSIBLE_CATEGORIES.join(' · ')}.
        </p>
      </div>
      <div className="current-needs__actions">
        <Link to={contactTo}>
          <Button variant="outline">Perguntar à ONG</Button>
        </Link>
      </div>
    </div>
  );
}
