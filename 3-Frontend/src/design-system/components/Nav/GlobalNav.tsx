import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../core/auth/authStore';
import { Button } from '../Button/Button';
import { LanguageSwitcher } from '../../../shared/components/LanguageSwitcher';
import styles from './GlobalNav.module.css';

export function GlobalNav() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const NAV_LINKS = [
    { label: t('nav.dashboard'), to: '/dashboard' },
    { label: t('nav.foodLog'),   to: '/food-log' },
    { label: t('nav.exams'),     to: '/exams' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.nav} aria-label="Global navigation">
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="VitaLog home">
          Vita<span className={styles.logoAccent}>Log</span>
        </Link>

        {isAuthenticated && (
          <ul className={styles.links} role="list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={styles.link}>{label}</Link>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <span className={styles.link} style={{ color: 'rgba(255,255,255,0.6)' }}>
                {user?.fullName?.split(' ')[0]}
              </span>
              <Button variant="dark" onClick={handleLogout}>
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <Button variant="dark" onClick={() => navigate('/login')}>
              {t('nav.signIn')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
