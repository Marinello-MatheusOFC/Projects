import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`form-field ${error ? 'form-field--error' : ''}`}>
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${className}`}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : '', helperText ? helperId : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...props}
        />
        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="form-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
