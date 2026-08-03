import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './SubNav.module.css';

interface SubNavLink {
  label: string;
  to: string;
}

interface SubNavProps {
  category: string;
  links?: SubNavLink[];
  cta?: ReactNode;
}

export function SubNav({ category, links = [], cta }: SubNavProps) {
  return (
    <div className={styles.subnav} role="navigation" aria-label={`${category} sub-navigation`}>
      <div className={styles.inner}>
        <span className={styles.category}>{category}</span>

        <ul className={styles.links} role="list">
          {links.map(({ label, to }) => (
            <li key={to}>
              <Link to={to} className={styles.link}>{label}</Link>
            </li>
          ))}
        </ul>

        {cta}
      </div>
    </div>
  );
}
