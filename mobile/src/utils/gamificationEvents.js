const listeners = {};

export const gamificationEvents = {
  emit: (type, payload) => (listeners[type] || []).forEach((fn) => fn(payload)),
  on: (type, fn) => { listeners[type] = [...(listeners[type] || []), fn]; },
  off: (type, fn) => { listeners[type] = (listeners[type] || []).filter((f) => f !== fn); },
};

export const GE = {
  XP: 'xp',
  LEVEL_UP: 'levelUp',
  BADGE: 'badge',
  COLLECTIBLE: 'collectible',
  STREAK: 'streak',
};
