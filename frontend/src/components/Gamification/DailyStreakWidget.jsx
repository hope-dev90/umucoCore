import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const FireIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export function DailyStreakWidget({ streak = 0, bestStreak = 0 }) {
  const { t } = useLanguage();
  const imageVariants = useMotionSafe({
    animate: { scale: [1, 1.15, 1] },
  });

  return (
    <div className="streak-widget">
      <motion.span
        variants={imageVariants}
        animate="animate"
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="streak-icon"
      >
        <FireIcon />
      </motion.span>

      <div className="streak-info">
        <div className="streak-count-row">
          <span className="streak-count">{streak}</span>
          <span className="streak-label">{t('gamification.dayStreak')}</span>
        </div>
        <div className="streak-best">
          {t('gamification.best')}: <strong>{bestStreak}</strong> {t('gamification.days')}
        </div>
      </div>
    </div>
  );
}
