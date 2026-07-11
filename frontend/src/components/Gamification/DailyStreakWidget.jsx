import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const STREAK_IMAGE = '/images/daily-streak.jpg';

export function DailyStreakWidget({ streak = 0, bestStreak = 0 }) {
  const { t } = useLanguage();
  const imageVariants = useMotionSafe({
    animate: { scale: [1, 1.15, 1] },
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
      border: '1px solid #FDE68A',
      borderRadius: 16,
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <motion.span
        variants={imageVariants}
        animate="animate"
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          border: '3px solid rgba(251,191,36,0.7)',
          boxShadow: '0 8px 22px rgba(146,64,14,0.18)',
        }}
      >
        <img
          src={STREAK_IMAGE}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </motion.span>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E', lineHeight: 1 }}>
            {streak}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('gamification.dayStreak')}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#6F5B55', marginTop: 2 }}>
          {t('gamification.best')}: <strong style={{ color: '#92400E' }}>{bestStreak}</strong> {t('gamification.days')}
        </div>
      </div>
    </div>
  );
}
