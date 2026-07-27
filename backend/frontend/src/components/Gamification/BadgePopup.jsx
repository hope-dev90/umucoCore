import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { RewardIcon } from './RewardIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import './Gamification.css';

export const RARITY_COLOURS = {
  common: { text: '#6B7280', bg: '#F3F4F6' },
  uncommon: { text: '#059669', bg: '#D1FAE5' },
  rare: { text: '#2563EB', bg: '#DBEAFE' },
  epic: { text: '#7C3AED', bg: '#EDE9FE' },
  legendary: { text: '#D97706', bg: '#FEF3C7' },
};

export function BadgePopup({ badge, onDismiss }) {
  const { t } = useLanguage();
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  const rc = RARITY_COLOURS[badge?.rarity] || RARITY_COLOURS.common;
  const rarity = badge?.rarity || 'common';

  return (
    <AnimatePresence>
      <motion.div
        className="gf-overlay gf-badge-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="gf-badge-popup"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.86, y: 24, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 18, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <button type="button" className="gf-badge-close" onClick={onDismiss} aria-label={t('gamification.closeBadgePopup')}>
            <X size={18} />
          </button>

          <div className="gf-badge-rays" aria-hidden="true" />
          <div className="gf-badge-spark gf-badge-spark-one" aria-hidden="true" />
          <div className="gf-badge-spark gf-badge-spark-two" aria-hidden="true" />
          <div className="gf-badge-spark gf-badge-spark-three" aria-hidden="true" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="gf-badge-medallion"
          >
            <RewardIcon icon={badge?.icon} fallback="🏅" size={68} />
          </motion.div>

          <div className="gf-badge-kicker">
            {t('gamification.badgeEarned')}
          </div>

          <h2 className="gf-badge-title">
            {badge?.name}
          </h2>

          <p className="gf-badge-copy">
            {badge?.description || t('gamification.badgeMilestone')}
          </p>

          <div className="gf-badge-meta">
            <span className="gf-badge-rarity" style={{ color: rc.text, background: rc.bg }}>
              {rarity}
            </span>
            {Number(badge?.xp_reward || badge?.xpReward || 0) > 0 && (
              <span className="gf-badge-xp">
                +{badge.xp_reward || badge.xpReward} XP
              </span>
            )}
          </div>

          <button
            onClick={onDismiss}
            className="gf-badge-action"
          >
            {t('gamification.continueExploring')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
