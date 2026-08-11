/**
 * Gemini chat — mirrors frontend/src/services/geminiChat.js
 * API key from EXPO_PUBLIC_GEMINI_API_KEY (same public-client pattern as web).
 */

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
      'Réponds en français. Réponds uniquement aux questions liées à la culture, l\'histoire, le patrimoine, ' +
      'les traditions ou les régions du Rwanda. Décline poliment les questions sans rapport.',
    model:
      'Compris. Je répondrai en français et me concentrerai sur la culture et le patrimoine rwandais.',
  },
} as const;

export type ChatTurn = { role: 'user' | 'model'; parts: string; isError?: boolean };

export async function sendMessage(
  history: ChatTurn[],
  userMessage: string,
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      language === 'rw'
        ? 'Ikibazo: API key ibuze. / API key missing.'
        : 'API key missing. / Ikibazo: API key ibuze.'
    );
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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}
