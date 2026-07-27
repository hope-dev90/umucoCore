// Helper function to get translated text from data objects
export function getLocalizedText(textObj, currentLang) {
  if (typeof textObj === 'string') return textObj;
  return textObj[currentLang] || textObj.en || '';
}
