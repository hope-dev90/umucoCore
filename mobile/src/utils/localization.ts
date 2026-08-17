import type { LanguageCode } from '../types';
import enCatalog from '../translations/en.json';
import rwCatalog from '../translations/rw.json';
import frCatalog from '../translations/fr.json';

type Dict = Record<string, any>;

/** Build nested object from flat dot-notation keys */
const buildNestedDict = (flatDict: Dict): Record<string, any> => {
  const nested: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(flatDict)) {
    const parts = key.split('.');
    let current: Record<string, any> | null = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // If current position is a string, we can't nest under it
      if (current && typeof current[part] === 'string') {
        // Skip this key - parent is a leaf value, not an object
        current = null;
        break;
      }
      
      // Create object if it doesn't exist
      if (current && !current[part]) {
        current[part] = {};
      }
      
      if (current) {
        current = current[part];
      }
    }
    
    // Only set the value if we successfully traversed the path
    if (current !== null) {
      current[parts[parts.length - 1]] = value;
    }
  }
  
  return nested;
};

/** Full catalogs ported from frontend/src/translations.js (+ mobile-only keys). */
const nestedDictionaries: Record<LanguageCode, Record<string, any>> = {
  en: buildNestedDict(enCatalog),
  rw: buildNestedDict(rwCatalog),
  fr: buildNestedDict(frCatalog),
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
  params?: Record<string, any>
): string | any {
  // Helper to get nested value from dot-notation key
  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((current: any, part: string) => {
      return current && current[part] !== undefined ? current[part] : undefined;
    }, obj);
  };

  const raw =
    getNestedValue(nestedDictionaries[language], key) ??
    getNestedValue(nestedDictionaries.en, key) ??
    key;
  
  // If it's an array or object, return it directly (for returnObjects: true usage)
  if (Array.isArray(raw) || typeof raw === 'object') {
    return raw;
  }
  
  if (typeof raw !== 'string') return key;
  if (!params) return raw;
  
  // Filter out special params like returnObjects
  const stringParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== 'returnObjects')
  );
  
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    stringParams[name] != null ? String(stringParams[name]) : `{${name}}`
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
