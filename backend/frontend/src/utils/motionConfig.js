import { useReducedMotion } from 'framer-motion';

/**
 * Returns the provided variants as-is unless the user prefers reduced motion,
 * in which case all variants collapse to a simple opacity-only transition.
 */
export function useMotionSafe(variants) {
  const reduced = useReducedMotion();
  if (!reduced || !variants) return variants;

  const safe = {};
  for (const key of Object.keys(variants)) {
    const v = variants[key];
    safe[key] = typeof v === 'object' && v !== null
      ? { opacity: v.opacity ?? (key === 'initial' || key === 'exit' ? 0 : 1) }
      : v;
  }
  return safe;
}
