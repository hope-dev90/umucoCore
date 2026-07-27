import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import { RewardIcon } from './RewardIcon';
import { useLanguage } from '../../contexts/LanguageContext';

const RARITY_COLOURS = {
  common: { text: '#6B7280', bg: '#F3F4F6' },
  uncommon: { text: '#059669', bg: '#D1FAE5' },
  rare: { text: '#2563EB', bg: '#DBEAFE' },
  epic: { text: '#7C3AED', bg: '#EDE9FE' },
  legendary: { text: '#D97706', bg: '#FEF3C7' },
};

const baseVariants = {
  initial: { opacity: 0, x: 80, scale: 0.8 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
  exit: { opacity: 0, x: 80, scale: 0.8, transition: { duration: 0.2 } },
};

const toastShell = (extra = {}) => ({
  borderRadius: 12,
  padding: '0.6rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  ...extra,
});

export function RewardToast({ toast, onRemove }) {
  const { t } = useLanguage();
  const variants = useMotionSafe(baseVariants);
  const { type, payload } = toast;

  const content = () => {
    switch (type) {
      case 'xp':
        return (
          <div style={toastShell({ background: '#FEF3C7', border: '1px solid #FDE68A', minWidth: 160 })}>
            <span style={{ fontSize: '1.1rem' }}>+XP</span>
            <span style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>+{payload.amount} XP</span>
          </div>
        );

      case 'levelUp':
        return (
          <div style={toastShell({ background: '#8D493A', boxShadow: '0 4px 16px rgba(141,73,58,0.35)', minWidth: 190 })}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>UP</span>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
              {t('gamification.level')} {payload.level} {t('gamification.unlocked')}
            </span>
          </div>
        );

      case 'badge': {
        const rc = RARITY_COLOURS[payload.badge?.rarity] || RARITY_COLOURS.common;
        return (
          <div style={toastShell({ background: '#fff', border: '1px solid #EADBC8', minWidth: 200 })}>
            <RewardIcon icon={payload.badge?.icon} size={26} />
            <div>
              <div style={{ fontWeight: 700, color: '#2C1A14', fontSize: '0.85rem' }}>{t('gamification.badgeUnlocked')}</div>
              <div style={{ fontSize: '0.75rem', color: '#6F5B55' }}>{payload.badge?.name}</div>
            </div>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 6,
              color: rc.text,
              background: rc.bg,
            }}>
              {payload.badge?.rarity}
            </span>
          </div>
        );
      }

      case 'collectible': {
        const rc = RARITY_COLOURS[payload.collectible?.rarity] || RARITY_COLOURS.common;
        return (
          <div style={toastShell({ background: '#fff', border: `1px solid ${rc.bg}`, minWidth: 200 })}>
            <RewardIcon icon={payload.collectible?.icon} fallback="💎" size={26} />
            <div>
              <div style={{ fontWeight: 700, color: '#2C1A14', fontSize: '0.85rem' }}>{t('gamification.collectibleFound')}</div>
              <div style={{ fontSize: '0.75rem', color: '#6F5B55' }}>{payload.collectible?.name}</div>
            </div>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 6,
              color: rc.text,
              background: rc.bg,
            }}>
              {payload.collectible?.rarity}
            </span>
          </div>
        );
      }

      case 'streak':
        return (
          <div style={toastShell({ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 4px 16px rgba(234,88,12,0.35)', minWidth: 170 })}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>FIRE</span>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
              {payload.streak}-{t('gamification.dayStreak')}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const rendered = content();
  if (!rendered) return null;

  return (
    <motion.div
      key={toast.id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onRemove}
      style={{ cursor: 'pointer' }}
    >
      {rendered}
    </motion.div>
  );
}
