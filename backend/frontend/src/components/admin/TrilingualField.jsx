import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LANGS = [
  ['en', 'English'],
  ['fr', 'Francais'],
  ['rw', 'Kinyarwanda'],
];

export const emptyLocalizedText = () => ({ en: '', fr: '', rw: '' });

export function normalizeLocalizedText(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      en: value.en || '',
      fr: value.fr || '',
      rw: value.rw || '',
    };
  }
  return { en: value || '', fr: '', rw: '' };
}

export function localizedEnglish(value) {
  return normalizeLocalizedText(value).en.trim();
}

export function localizedPreview(value) {
  const text = normalizeLocalizedText(value);
  return text.en || text.fr || text.rw || '';
}

export function localizedLanguages(value) {
  const text = normalizeLocalizedText(value);
  return LANGS.filter(([code]) => text[code]?.trim()).map(([code]) => code.toUpperCase());
}

export default function TrilingualField({ label, value, onChange, textarea = false, required = false, placeholder = '' }) {
  const { language } = useLanguage();
  const copy = {
    fr: {
      English: 'Anglais',
      Francais: 'Francais',
      Kinyarwanda: 'Kinyarwanda',
      'English is required.': 'L anglais est obligatoire.',
      'French or Kinyarwanda can be completed later.': 'Le francais ou le kinyarwanda peuvent etre completes plus tard.',
    },
    rw: {
      English: 'Icyongereza',
      Francais: 'Igifaransa',
      Kinyarwanda: 'Ikinyarwanda',
      'English is required.': 'Icyongereza kirakenewe.',
      'French or Kinyarwanda can be completed later.': 'Igifaransa cyangwa Ikinyarwanda byuzuzwa nyuma.',
    },
  };
  const tr = (text) => copy[language]?.[text] || text;
  const current = normalizeLocalizedText(value);
  const Input = textarea ? 'textarea' : 'input';
  const missingTranslations = !current.fr.trim() || !current.rw.trim();

  return (
    <div className="admin-trilingual-field">
      <div className="admin-trilingual-label">
        <span>{label}{required ? ' *' : ''}</span>
        {required && !current.en.trim() && <small className="admin-field-error">{tr('English is required.')}</small>}
        {current.en.trim() && missingTranslations && (
          <small className="admin-field-warning">{tr('French or Kinyarwanda can be completed later.')}</small>
        )}
      </div>
      <div className="admin-trilingual-grid">
        {LANGS.map(([code, lang]) => (
          <label key={code} className="admin-field admin-trilingual-input">
            <span>{tr(lang)}</span>
            <Input
              value={current[code]}
              onChange={(e) => onChange({ ...current, [code]: e.target.value })}
              placeholder={code === 'en' ? placeholder : ''}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
