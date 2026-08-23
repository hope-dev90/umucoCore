// Ported 1:1 from web src/utils/i18n.js — no platform-specific code, so nothing changed.
export function getLocalizedText(textObj, currentLang) {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'object') {
    return textObj[currentLang] || textObj.en || textObj.rw || textObj.fr || '';
  }
  return String(textObj);
}
