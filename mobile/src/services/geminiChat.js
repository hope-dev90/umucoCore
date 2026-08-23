/**
 * Gemini Chat Service
 * Calls the Google Gemini API for chat completions.
 * API key is read from Expo config / AsyncStorage instead of import.meta.env / window / sessionStorage.
 */
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPTS = {
  en: {
    user:
      'Your name is Umuco. You are an expert on Rwandan culture, history, and heritage. ' +
      'Reply in English. Only answer questions related to Rwandan culture, history, heritage, ' +
      'traditions, or regions. Politely decline unrelated questions.',
    model: 'Understood. I will reply in English and focus on Rwandan culture and heritage.',
  },
  rw: {
    user:
      "Witwa Umuco. Uri inzobere mu muco w'u Rwanda. Subiza mu Kinyarwanda no mu cyongereza " +
      "nk'uko utumiwe. Ntusubize ibibazo bidafitanye isano n'umuco, amateka cyangwa uturere tw'u Rwanda.",
    model: 'Nzasubira mu Kinyarwanda no mu cyongereza. Ndawiteguye.',
  },
  fr: {
    user:
      "Tu t'appelles Umuco. Tu es un expert de la culture, de l'histoire et du patrimoine rwandais. " +
      "Réponds en français. Réponds uniquement aux questions liées à la culture, l'histoire, le patrimoine, " +
      'les traditions ou les régions du Rwanda. Décline poliment les questions sans rapport.',
    model: 'Compris. Je répondrai en français et me concentrerai sur la culture et le patrimoine rwandais.',
  },
};

/**
 * Send a message to Gemini and return the assistant's reply text.
 * @param {Array<{role: 'user'|'model', parts: string}>} history
 * @param {string} userMessage
 * @param {'en'|'rw'} language - app language; controls system prompt and expected reply language
 * @returns {Promise<string>}
 */
export async function sendMessage(history, userMessage, language = 'en') {
  const apiKey =
    Constants.expoConfig?.extra?.geminiApiKey ||
    (await AsyncStorage.getItem('UMUCO_GEMINI_API_KEY'));

  if (!apiKey) {
    const msg =
      language === 'rw'
        ? 'Ikibazo: API key ibuze. / API key missing.'
        : 'API key missing. / Ikibazo: API key ibuze.';
    throw new Error(msg);
  }

  const prompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

  const contents = [
    { role: 'user', parts: [{ text: prompt.user }] },
    { role: 'model', parts: [{ text: prompt.model }] },
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const requestUrl = `${GEMINI_API_URL}?key=${apiKey}`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('Gemini API error response:', response.status, errorBody);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}
