import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const checkboxId = id || `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className={`form-checkbox ${error ? 'form-field--error' : ''}`}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`form-checkbox-input ${className}`}
          {...props}
        />
        <label htmlFor={checkboxId} className="form-checkbox-label">
          {label}
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
