/**
 * getCommonsImage — Wikimedia Commons image resolver with local JSON cache.
 *
 * Looks up a card title in the bundled cache first (zero network cost, works
 * offline). If the title isn't in the cache it queries the Commons API, stores
 * the result in sessionStorage, and returns the URL.
 *
 * The JSON file at ../../data/commonsImageCache.json is committed to the repo
 * so the app doesn't need to fetch on every load.
 */

import cachedUrls from '../data/commonsImageCache.json';

const SESSION_KEY = 'commons_image_cache';

/** Read runtime cache from sessionStorage */
function getRuntimeCache() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Persist a new entry to sessionStorage */
function setRuntimeCache(key, url) {
  try {
    const cache = getRuntimeCache();
    cache[key] = url;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

/**
 * Fetch a single image URL from Wikimedia Commons.
 * Returns null if nothing found or on network error.
 * @param {string} query  Search term, e.g. "Intore dance Rwanda"
 */
async function fetchFromCommons(query) {
  const url =
    `https://commons.wikimedia.org/w/api.php` +
    `?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    const first = pages.find(
      (p) => p.imageinfo && p.imageinfo[0]?.url
    );
    return first?.imageinfo[0]?.url ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve an image URL for a culture card.
 *
 * @param {string} cardTitle  The Kinyarwanda card title (used as cache key)
 * @param {string} [query]    Optional explicit Commons search query.
 *                            Defaults to the card title.
 * @returns {Promise<string|null>}  Resolved URL, or null if not found.
 */
export async function getCommonsImage(cardTitle, query) {
  // 1. Check committed JSON cache
  if (cachedUrls[cardTitle]) return cachedUrls[cardTitle];

  // 2. Check sessionStorage runtime cache
  const runtime = getRuntimeCache();
  if (runtime[cardTitle]) return runtime[cardTitle];

  // 3. Hit the Commons API
  const resolved = await fetchFromCommons(query || cardTitle);
  if (resolved) setRuntimeCache(cardTitle, resolved);
  return resolved;
}
