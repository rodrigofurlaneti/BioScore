import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'pill' | 'rect';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'pill', className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx(styles.wrap, variant === 'rect' && styles.rect)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(styles.field, error && styles.error, className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.errorMsg} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
