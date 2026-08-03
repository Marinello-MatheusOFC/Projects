import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
}

const defaultIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Alert({
  type = 'info',
  title,
  message,
  icon,
  onClose,
  dismissible = true,
  className,
}: AlertProps) {
  const DefaultIcon = defaultIcons[type];
  const showClose = dismissible && !!onClose;

  return (
    <div
      className={`alert alert--${type}${className ? ` ${className}` : ''}`}
      role="alert"
      aria-live="polite"
    >
      <span className="alert-icon" aria-hidden="true">
        {icon ?? <DefaultIcon size={20} />}
      </span>
      <div className="alert-body">
        {title && <strong className="alert-title">{title}</strong>}
        <div className="alert-message">{message}</div>
      </div>
      {showClose && (
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
