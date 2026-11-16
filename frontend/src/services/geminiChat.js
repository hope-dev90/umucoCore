/**
 * Umuco AI chat service.
 * Questions go to the Umuco backend (POST /api/ai/chat), which holds the Gemini
 * key, applies the admin settings and limits, and logs usage for the admin portal.
 */
import { apiFetch } from '../config/api';

export class ChatError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * @param {Array<{role: 'user'|'model', parts: string}>} history
 * @param {string} userMessage
 * @param {'en'|'rw'|'fr'} language
 * @returns {Promise<string>}
 */
export async function sendMessage(history, userMessage, language = 'en') {
  let res;
  try {
    res = await apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMessage, history, language }),
    });
  } catch {
    throw new ChatError('network', 'Network error');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = res.status === 401 ? 'auth' : data.code || 'upstream';
    throw new ChatError(code, data.error || data.message || `Request failed (${res.status})`);
  }
  if (!data.reply) throw new ChatError('upstream', 'Empty response');
  return data.reply;
}
