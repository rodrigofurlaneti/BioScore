import { type ReactNode } from 'react';
import styles from './StoreCard.module.css';

interface StoreCardProps {
  name: string;
  meta?: string;
  image?: ReactNode;
  cta?: ReactNode;
}

export function StoreCard({ name, meta, image, cta }: StoreCardProps) {
  return (
    <article className={styles.card}>
      {image && <div className={styles.imageWrap}>{image}</div>}
      <p className={styles.name}>{name}</p>
      {meta && <p className={styles.meta}>{meta}</p>}
      {cta && <div className={styles.cta}>{cta}</div>}
    </article>
  );
}
