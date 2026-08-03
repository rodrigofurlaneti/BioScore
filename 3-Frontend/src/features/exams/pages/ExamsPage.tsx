import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubNav } from '../../../design-system/components/Nav/SubNav';
import { Button } from '../../../design-system/components/Button/Button';
import { Spinner } from '../../../shared/components/Spinner';
import { useMyExamRequests, useUpdateExamItem } from '../hooks/useExams';
import styles from './ExamsPage.module.css';

export default function ExamsPage() {
  const { data: requests = [], isLoading } = useMyExamRequests();
  const { mutate: updateItem } = useUpdateExamItem();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const pendingCount = requests
    .flatMap((r) => r.items)
    .filter((i) => !i.isCompleted).length;

  const markDone = (requestId: string, itemId: string) => {
    updateItem({
      requestId,
      itemId,
      data: { completedDate: new Date().toISOString().split('T')[0] },
    });
  };

  const pendingLabel = pendingCount === 1
    ? t('exams.pendingOne', { count: pendingCount })
    : t('exams.pendingMany', { count: pendingCount });

  return (
    <div className={styles.page}>
      <SubNav
        category={t('nav.exams')}
        links={[{ label: t('exams.myRequests'), to: '/exams' }, { label: t('examRequest.newRequest'), to: '/exams/requests' }]}
      />

      <div className={styles.hero}>
        <h1 className={styles.title}>{t('exams.title')}</h1>
        <p className={styles.subtitle}>
          {pendingCount > 0 ? pendingLabel : t('exams.allDone')}
        </p>
      </div>

      <div className={styles.body}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{t('exams.myRequests')}</h2>
            <Button variant="secondary" onClick={() => navigate('/exams/requests')}>{t('exams.newRequest')}</Button>
          </div>

          {isLoading ? (
            <Spinner />
          ) : requests.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-ink-muted-48)', padding: 'var(--space-xxl)' }}>
              {t('exams.noRequests')}{' '}
              <Link to="/exams/requests" style={{ color: 'var(--color-primary)' }}>{t('exams.createOne')}</Link>
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {requests.map((req) => (
                <div key={req.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <div>
                      <p className={styles.requestDoctor}>{req.doctorName}</p>
                      <p className={styles.requestMeta}>
                        {new Date(req.requestDate).toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })}
                        {req.notes && ` · ${req.notes}`}
                      </p>
                    </div>
                    <p className={styles.requestMeta}>
                      {req.items.filter((i) => i.isCompleted).length}/{req.items.length} {t('exams.done').toLowerCase()}
                    </p>
                  </div>

                  {req.items.map((item) => (
                    <div key={item.id} className={styles.examRow}>
                      <div style={{ flex: 1 }}>
                        <p className={styles.examName}>
                          {item.examName}
                          {item.abbreviation && <span style={{ color: 'var(--color-ink-muted-48)', marginLeft: 6 }}>({item.abbreviation})</span>}
                        </p>
                        <p className={styles.examCategory}>{item.examCategory}</p>
                        {item.result && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted-80)', marginTop: 2 }}>{t('exams.result')} {item.result}</p>}
                      </div>

                      <span className={`${styles.badge} ${item.isCompleted ? styles.done : styles.pending}`}>
                        {item.isCompleted ? t('exams.done') : t('exams.pending')}
                      </span>

                      {!item.isCompleted && (
                        <Button
                          variant="pearl"
                          onClick={() => markDone(req.id, item.id)}
                          aria-label={`${t('exams.markDone')} ${item.examName}`}
                        >
                          {t('exams.markDone')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
