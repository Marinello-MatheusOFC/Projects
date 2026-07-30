import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type?: AlertType;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Alert({ type = 'info', message, onClose, dismissible = true }: AlertProps) {
  const Icon = icons[type];

  return (
    <div
      className={`alert alert--${type}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} aria-hidden="true" />
      <span className="alert-message">{message}</span>
      {dismissible && onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Fechar">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function Toast({
  type = 'info',
  message,
  onClose,
  duration = 5000,
}: AlertProps & { duration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <Alert type={type} message={message} onClose={() => { setVisible(false); onClose?.(); }} />
    </div>
  );
}
