import styles from './Spinner.module.css';
import clsx from 'clsx';

interface SpinnerProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ fullPage, size = 'md' }: SpinnerProps) {
  return (
    <div className={clsx(styles.wrap, fullPage && styles.fullPage)} role="status" aria-label="Loading">
      <div className={clsx(styles.ring, styles[size])} />
    </div>
  );
}
