import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../core/auth/authStore';
import { useTodayLog } from '../../food-log/hooks/useFoodLog';
import { useMyExamRequests } from '../../exams/hooks/useExams';
import { Button } from '../../../design-system/components/Button/Button';
import { StoreCard } from '../../../design-system/components/Card/StoreCard';
import styles from './DashboardPage.module.css';

const DAILY_LIMIT = 300;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const { data: todayLog } = useTodayLog();
  const { data: examRequests = [] } = useMyExamRequests();

  const todayPoints   = todayLog?.totalPoints ?? 0;
  const todayItems    = todayLog?.items?.length ?? 0;
  const pendingExams  = examRequests
    .flatMap((r) => r.items)
    .filter((i) => !i.isCompleted).length;
  const progressPct   = Math.min((todayPoints / DAILY_LIMIT) * 100, 100).toFixed(1);

  return (
    <div className={styles.page}>

      {/* ── Hero dark tile ───────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.greeting}>{t('dashboard.greeting', { name: firstName })}</p>
          <h1 className={styles.heroTitle}>{t('dashboard.heroTitle')}</h1>
          <p className={styles.heroSub}>{t('dashboard.heroSub')}</p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t('dashboard.todayPoints')}</p>
            <p className={styles.statValue}>
              {todayPoints} <span className={styles.statUnit}>/ {DAILY_LIMIT}</span>
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t('dashboard.foodItemsToday')}</p>
            <p className={styles.statValue}>{todayItems}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t('dashboard.pendingExams')}</p>
            <p className={styles.statValue}>{pendingExams}</p>
          </div>
        </div>
      </section>

      {/* ── Quick actions (parchment tile) ────────────────── */}
      <section className={styles.actionsSection}>
        <div className={styles.actionsInner}>
          <h2 className={styles.sectionTitle}>{t('dashboard.whatToDo')}</h2>
          <div className={styles.cardsGrid}>
            <StoreCard
              name={t('dashboard.logFood')}
              meta={t('dashboard.logFoodMeta')}
              cta={<Button variant="secondary" onClick={() => navigate('/food-log')}>{t('dashboard.openFoodLog')}</Button>}
            />
            <StoreCard
              name={t('dashboard.viewExams')}
              meta={t('dashboard.viewExamsMeta')}
              cta={<Button variant="secondary" onClick={() => navigate('/exams')}>{t('dashboard.goToExams')}</Button>}
            />
            <StoreCard
              name={t('dashboard.pointsHistory')}
              meta={t('dashboard.pointsHistoryMeta')}
              cta={<Button variant="secondary" onClick={() => navigate('/food-log/history')}>{t('dashboard.viewHistory')}</Button>}
            />
          </div>
        </div>
      </section>

    </div>
  );
}
