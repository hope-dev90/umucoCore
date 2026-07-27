import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import { RewardIcon } from './RewardIcon';
import './Gamification.css';

export function BadgeCard({ badge, unlocked = false, unlockedAt }) {
  const hoverVariants = useMotionSafe({
    rest:  { y: 0 },
    hover: { y: -2, boxShadow: '0 4px 12px rgba(44,26,20,0.15)' },
  });

  return (
    <motion.div
      className={`badge-card ${!unlocked ? 'locked' : ''}`}
      variants={hoverVariants}
      initial="rest"
      whileHover="hover"
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="badge-icon">
        <RewardIcon icon={badge.icon} size={44} />
      </div>
      <div className="badge-name">{badge.name}</div>
      <div className={`badge-rarity ${badge.rarity}`}>{badge.rarity}</div>
      {unlockedAt && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {new Date(unlockedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
