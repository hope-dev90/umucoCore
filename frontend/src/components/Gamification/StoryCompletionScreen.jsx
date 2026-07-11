import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdventureStoryCard } from './AdventureStoryCard';
import { useLanguage } from '../../contexts/LanguageContext';

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const rewardContainerVariants = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const rewardItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function StoryCompletionScreen({
  sessionXP = 0,
  newBadges = [],
  newCollectibles = [],
  recommendedStories = [],
  currentXP = 0,
  requiredXP = 1000,
  level = 1,
  onDismiss,
}) {
  const { t } = useLanguage();
  const [displayXP, setDisplayXP] = useState(0);

  // Count-up animation for XP
  useEffect(() => {
    if (sessionXP <= 0) return;
    let start = 0;
    const step = Math.ceil(sessionXP / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= sessionXP) { setDisplayXP(sessionXP); clearInterval(interval); }
      else setDisplayXP(start);
    }, 35);
    return () => clearInterval(interval);
  }, [sessionXP]);

  const xpPct = requiredXP > 0 ? Math.min(100, (currentXP / requiredXP) * 100) : 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(44,26,20,0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflowY: 'auto',
      }}
    >
      <motion.div
        variants={cardVariants}
        style={{
          background: '#FDFBF7', borderRadius: 24, padding: '2rem',
          maxWidth: 600, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#2C1A14' }}>
            {t('gamification.storyComplete')}
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#6F5B55', fontSize: '0.85rem' }}>
            {t('gamification.storyCompleteSubtitle')}
          </p>
        </div>

        {/* XP earned */}
        <div style={{
          background: 'linear-gradient(135deg, #8D493A, #3E2723)',
          borderRadius: 16, padding: '1.25rem', textAlign: 'center', marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
            {t('gamification.xpEarned')}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FEF3C7' }}>
            +{displayXP}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{t('gamification.adventureXp')}</div>
        </div>

        {/* Level progress */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '0.75rem', color: '#6F5B55', marginBottom: '0.35rem' }}>
            <span>{t('gamification.level')} {level}</span>
            <span>{currentXP} / {requiredXP} XP</span>
          </div>
          <div style={{ height: 8, background: '#EADBC8', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#8D493A,#3E2723)', borderRadius: 999 }}
            />
          </div>
        </div>

        {/* Rewards */}
        {(newBadges.length > 0 || newCollectibles.length > 0) && (
          <motion.div
            variants={rewardContainerVariants}
            animate="animate"
            style={{ marginBottom: '1.25rem' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8D493A',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {t('gamification.rewardsEarned')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {newBadges.map((b, i) => (
                <motion.div key={i} variants={rewardItemVariants}
                  style={{ background: '#FEF3C7', border: '1px solid #FDE68A',
                    borderRadius: 10, padding: '0.5rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <span>{b.icon || '🏅'}</span>
                  <span style={{ fontWeight: 600, color: '#2C1A14' }}>{b.name}</span>
                </motion.div>
              ))}
              {newCollectibles.map((c, i) => (
                <motion.div key={i} variants={rewardItemVariants}
                  style={{ background: '#EDE9FE', border: '1px solid #C4B5FD',
                    borderRadius: 10, padding: '0.5rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <span>{c.icon || '💎'}</span>
                  <span style={{ fontWeight: 600, color: '#2C1A14' }}>{c.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended stories */}
        {recommendedStories.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8D493A',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              {t('gamification.continueYourAdventure')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {recommendedStories.slice(0, 3).map((s, i) => (
                <AdventureStoryCard key={s.id || i} story={s} onClick={onDismiss} />
              ))}
            </div>
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          style={{
            width: '100%', background: '#8D493A', color: '#fff',
            border: 'none', borderRadius: 14, padding: '0.9rem',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          {t('gamification.continueAdventure')}
        </button>
      </motion.div>
    </motion.div>
  );
}
