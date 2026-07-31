import { ReactNode } from 'react';

interface CallToActionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: 'primary' | 'deep';
}

export function CallToAction({ title, description, actions, variant = 'primary' }: CallToActionProps) {
  return (
    <section className={`call-to-action call-to-action--${variant}`}>
      <div className="call-to-action__inner">
        <h2 className="call-to-action__title">{title}</h2>
        {description && <p className="call-to-action__text">{description}</p>}
        {actions && <div className="call-to-action__actions">{actions}</div>}
      </div>
    </section>
  );
}
