import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const errorId = `${inputId}-error`;

    return (
      <div className={`form-field ${error ? 'form-field--error' : ''}`}>
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`form-textarea ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
