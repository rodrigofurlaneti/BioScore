import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from './Spinner';
import styles from './LoadingOverlay.module.css';

export function LoadingOverlay() {
  const { t } = useTranslation();
  const WORD = t('loading.word');
  const TOTAL_STEPS = WORD.length + 3;
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (TOTAL_STEPS + 1));
    }, 500);
    return () => clearInterval(id);
  }, [TOTAL_STEPS]);

  const letters = WORD.slice(0, Math.min(step, WORD.length));
  const dots = step > WORD.length ? '.'.repeat(step - WORD.length) : '';

  return (
    <div className={styles.overlay} role="status" aria-label={WORD}>
      <div className={styles.content}>
        <Spinner size="lg" />
        <p className={styles.label}>
          {letters}
          <span className={styles.dots}>{dots}</span>
        </p>
      </div>
    </div>
  );
}
