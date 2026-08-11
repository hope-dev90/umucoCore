import type { LanguageCode } from '../types';
import enCatalog from '../translations/en.json';
import rwCatalog from '../translations/rw.json';
import frCatalog from '../translations/fr.json';

type Dict = Record<string, string>;

/** Full catalogs ported from frontend/src/translations.js (+ mobile-only keys). */
const dictionaries: Record<LanguageCode, Dict> = {
  en: enCatalog as Dict,
  rw: rwCatalog as Dict,
  fr: frCatalog as Dict,
};

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  rw: 'Kinyarwanda',
  fr: 'Français',
};

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'rw', 'fr'];

export function translate(
  language: LanguageCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const raw =
    dictionaries[language]?.[key] ??
    dictionaries.en[key] ??
    key;
  if (typeof raw !== 'string') return key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] != null ? String(params[name]) : `{${name}}`
  );
}

export function localizeField(
  value: string | Record<string, string> | undefined,
  language: LanguageCode,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[language] || value.en || value.rw || value.fr || fallback;
}

export function mapLanguageToDb(lang: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    en: 'English (UK)',
    rw: 'Kinyarwanda',
    fr: 'French (France)',
  };
  return map[lang];
}

export function mapLanguageFromDb(value?: string | null): LanguageCode {
  if (!value) return 'en';
  if (value === 'en' || value === 'rw' || value === 'fr') return value;
  if (value.includes('Kinyarwanda') || value === 'rw') return 'rw';
  if (value.includes('French') || value === 'fr') return 'fr';
  if (value.includes('English') || value === 'en') return 'en';
  return 'en';
}
