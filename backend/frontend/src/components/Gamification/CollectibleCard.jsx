import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';
import './Gamification.css';

export function CollectibleCard({ collectible, collected = false, obtainedAt }) {
  const hoverVariants = useMotionSafe({
    rest:  { y: 0 },
    hover: { y: -2, boxShadow: '0 4px 12px rgba(44,26,20,0.15)' },
  });

  return (
    <motion.div
      className={`collectible-card ${!collected ? 'locked' : ''}`}
      variants={hoverVariants}
      initial="rest"
      whileHover="hover"
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="collectible-icon">{collectible.icon}</div>
      <div className="collectible-name">{collectible.name}</div>
      <div className={`collectible-rarity ${collectible.rarity}`}>{collectible.rarity}</div>
      {obtainedAt && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {new Date(obtainedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
