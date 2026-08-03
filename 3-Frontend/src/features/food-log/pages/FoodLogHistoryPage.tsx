import { useTranslation } from 'react-i18next';
import { SubNav } from '../../../design-system/components/Nav/SubNav';
import { Spinner } from '../../../shared/components/Spinner';
import { useFoodLogHistory } from '../hooks/useFoodLog';
import styles from './FoodLogPage.module.css';

export default function FoodLogHistoryPage() {
  const { data = [], isLoading } = useFoodLogHistory();
  const { t, i18n } = useTranslation();

  return (
    <div className={styles.page}>
      <SubNav category={t('nav.foodLog')} links={[{ label: t('foodLog.subnavToday'), to: '/food-log' }, { label: t('foodLog.subnavHistory'), to: '/food-log/history' }]} />

      <div className={styles.hero}>
        <h1 className={styles.title}>{t('history.title')}</h1>
        <p className={styles.dateBar}>{t('history.subtitle')}</p>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: 'var(--space-xl) var(--space-lg)' }}>
        {isLoading ? (
          <Spinner />
        ) : data.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-ink-muted-48)', padding: 'var(--space-xxl)' }}>
            {t('history.noHistory')}
          </p>
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>{t('history.allDays')}</div>
            {data.map((row) => (
              <div key={row.logDate} className={styles.listItem}>
                <div style={{ flex: 1 }}>
                  <p className={styles.itemName}>
                    {new Date(row.logDate).toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className={styles.itemMeta}>{t('history.foodItems', { count: row.foodItemCount })}</p>
                </div>
                <span className={styles.itemPoints}>{row.totalPoints}pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
