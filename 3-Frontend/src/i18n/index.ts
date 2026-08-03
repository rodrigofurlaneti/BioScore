import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import ptBR from './locales/pt-BR';
import es from './locales/es';

export const SUPPORTED_LANGS = [
  { code: 'en',    label: 'EN', flagCode: 'us' },
  { code: 'pt-BR', label: 'PT', flagCode: 'br' },
  { code: 'es',    label: 'ES', flagCode: 'es' },
] as const;

export type LangCode = typeof SUPPORTED_LANGS[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:    { translation: en },
      'pt-BR': { translation: ptBR },
      es:    { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vitalog-lang',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
