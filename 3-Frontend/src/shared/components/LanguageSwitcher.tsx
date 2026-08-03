import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {SUPPORTED_LANGS.map(({ code, label, flagCode }) => (
        <button
          key={code}
          className={`${styles.btn} ${current === code ? styles.active : ''}`}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={current === code}
          aria-label={`Switch to ${label}`}
        >
          <img
            src={`https://flagcdn.com/w20/${flagCode}.png`}
            srcSet={`https://flagcdn.com/w40/${flagCode}.png 2x`}
            width="16"
            height="12"
            alt={label}
            className={styles.flag}
          />
          {label}
        </button>
      ))}
    </div>
  );
}
