import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const FOOTER_COLUMNS = [
  {
    title: 'Tracking',
    links: [
      { label: 'Dashboard',    to: '/dashboard' },
      { label: 'Food Log',     to: '/food-log' },
      { label: 'History',      to: '/food-log/history' },
    ],
  },
  {
    title: 'Health',
    links: [
      { label: 'Exams',        to: '/exams' },
      { label: 'Requests',     to: '/exams/requests' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Profile',      to: '/profile' },
      { label: 'Sign In',      to: '/login' },
      { label: 'Register',     to: '/register' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <p className={styles.colTitle}>{title}</p>
              <ul className={styles.colLinks} role="list">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className={styles.colLink}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.legal}>
          Copyright © {new Date().getFullYear()} PointsTable & Exams. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
