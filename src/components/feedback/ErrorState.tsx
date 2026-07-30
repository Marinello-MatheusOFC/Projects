import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Não foi possível carregar as informações. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={48} aria-hidden="true" />
      <h3 className="error-state-title">Algo deu errado</h3>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden="true" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
