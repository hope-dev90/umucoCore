// Helper function to get translated text from data objects
export function getLocalizedText(textObj, currentLang) {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  if (typeof textObj === 'object') {
    return textObj[currentLang] || textObj.en || textObj.rw || textObj.fr || '';
  }
  return String(textObj);
}
