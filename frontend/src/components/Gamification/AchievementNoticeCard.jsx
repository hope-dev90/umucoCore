import React from 'react';
import { motion } from 'framer-motion';

const CARD_META = {
  xp: { icon: '✨', accent: '#C4724A' },
  levelUp: { icon: '⬆️', accent: '#8D493A' },
  badge: { icon: '🏅', accent: '#A9821F' },
  collectible: { icon: '💎', accent: '#1F7A8C' },
  streak: { icon: '🔥', accent: '#E67E22' },
};

function getCopy(notice) {
  const { type, payload } = notice;

  switch (type) {
    case 'xp':
      return {
        title: `+${payload.amount} XP`,
        subtitle: 'New marks added to your progress.',
      };
    case 'levelUp':
      return {
        title: `Level ${payload.level} reached`,
        subtitle: 'You just moved up to a new rank.',
      };
    case 'badge':
      return {
        title: payload.badge?.name || 'New badge unlocked',
        subtitle: 'A new mark was added to your profile.',
      };
    case 'collectible':
      return {
        title: payload.collectible?.name || 'New collectible found',
        subtitle: 'You picked up a new reward.',
      };
    case 'streak':
      return {
        title: `${payload.streak}-day streak`,
        subtitle: 'You kept your momentum going.',
      };
    default:
      return {
        title: 'New achievement',
        subtitle: 'Your profile has a new mark.',
      };
  }
}

export function AchievementNoticeCard({ notice, onDismiss }) {
  const meta = CARD_META[notice.type] || CARD_META.xp;
  const copy = getCopy(notice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      style={{
        width: 340,
        maxWidth: 'calc(100vw - 32px)',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#FFFDF9',
        border: '1px solid rgba(196, 114, 74, 0.18)',
        boxShadow: '0 18px 40px rgba(44, 26, 20, 0.16)',
      }}
    >
      <div
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${meta.accent}, #EADBC8)`,
        }}
      />
      <div style={{ padding: '1rem 1rem 0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.85rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${meta.accent}18`,
              fontSize: '1.4rem',
              flexShrink: 0,
            }}
          >
            {meta.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: meta.accent,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              New Marks
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2C1A14' }}>
              {copy.title}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6F5B55', marginTop: 4 }}>
              {copy.subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              border: 0,
              background: 'transparent',
              color: '#8D493A',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Dismiss reward notice"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
}
