/**
 * trackView — fire-and-forget: records every item the user opens/plays.
 * Called from any page where content is consumed.
 *
 * @param {{ type: string, itemId?: string|number, title: string, image?: string, category?: string, location?: string }} item
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function trackView({ type, itemId, title, image, category, location, token }) {
  if (!token || !title) return;

  fetch(`${API_BASE}/api/history`, {
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
