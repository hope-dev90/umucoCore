/**
 * trackView — fire-and-forget: records every item the user opens/plays.
 * Called from any page where content is consumed.
 *
 * @param {{ type: string, itemId?: string|number, title: string, image?: string, category?: string, location?: string }} item
 */
import { apiFetch } from '../config/api';

export function trackView({ type, itemId, title, image, category, location, token }) {
  if (!token || !title) return;

  apiFetch('/api/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      itemType: type,
      itemId: itemId != null ? String(itemId) : undefined,
      title,
      image: image || undefined,
      category: category || undefined,
      location: location || undefined,
    }),
  }).catch(() => {/* silent fail — history tracking is non-critical */});
}
