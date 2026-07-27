import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITY_COLOURS } from './BadgePopup';
import { useLanguage } from '../../contexts/LanguageContext';
import './Gamification.css';

const RARITY_GLOW = {
  common:    '0 0 20px rgba(156,163,175,0.6)',
  uncommon:  '0 0 20px rgba(16,185,129,0.6)',
  rare:      '0 0 20px rgba(59,130,246,0.6)',
  epic:      '0 0 20px rgba(139,92,246,0.6)',
  legendary: '0 0 30px rgba(245,158,11,0.8)',
};

export function CollectiblePopup({ collectible, onDismiss }) {
  const { t } = useLanguage();
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  const rc   = RARITY_COLOURS[collectible?.rarity] || RARITY_COLOURS.common;
  const glow = RARITY_GLOW[collectible?.rarity]    || RARITY_GLOW.common;

  return (
    <AnimatePresence>
      <motion.div
        className="gf-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="gf-popup-card"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'inline-block',
              filter: `drop-shadow(${glow})` }}
          >
            {collectible?.icon || '💎'}
          </motion.div>

          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#8D493A', marginBottom: '0.5rem' }}>
            {t('gamification.collectibleFound')}
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C1A14', marginBottom: '0.5rem' }}>
            {collectible?.name}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#6F5B55', marginBottom: '1rem', lineHeight: 1.5 }}>
            {collectible?.description}
          </p>

          <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999,
            color: rc.text, background: rc.bg, marginBottom: '1.5rem',
            boxShadow: glow }}>
            {collectible?.rarity || 'common'}
          </span>

          <button
            onClick={onDismiss}
            style={{ display: 'block', width: '100%', background: '#8D493A', color: '#fff',
              border: 'none', borderRadius: 12, padding: '0.75rem', fontWeight: 700,
              fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {t('gamification.addToCollection')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
