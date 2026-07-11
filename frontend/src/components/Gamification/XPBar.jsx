import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import './Gamification.css';

export function XPBar({ currentXP, requiredXP, level }) {
  const { t } = useLanguage();
  const pct = requiredXP === 0 ? 100 : Math.min(100, (currentXP / requiredXP) * 100);

  const fillVariants = useMotionSafe({
    initial: { width: '0%' },
    animate: { width: `${pct}%` },
  });

  return (
    <div className="xp-bar-container">
      <div className="xp-text">
        <span className="xp-current">{currentXP}</span>
        <span className="xp-separator">/</span>
        <span className="xp-required">{requiredXP}</span>
        <span className="xp-label">XP</span>
        <span className="level-badge">{t('gamification.level')} {level}</span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          variants={fillVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: undefined }} /* let motion control width */
        />
      </div>
    </div>
  );
}
