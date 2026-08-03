import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './ProductTile.module.css';

type TileSurface = 'light' | 'parchment' | 'dark' | 'dark2' | 'dark3';

interface ProductTileProps {
  surface?: TileSurface;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export function ProductTile({
  surface = 'light',
  eyebrow,
  title,
  subtitle,
  actions,
  image,
  children,
  className,
  id,
}: ProductTileProps) {
  return (
    <section
      id={id}
      className={clsx(styles.tile, styles[surface], className)}
      aria-label={title}
    >
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
        {image && <div className={styles.image}>{image}</div>}
        {children}
      </div>
    </section>
  );
}
