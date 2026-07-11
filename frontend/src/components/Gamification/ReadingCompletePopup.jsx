import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * ReadingCompletePopup
 * Celebratory popup shown when the user clicks "Finish Reading".
 *
 * Props:
 *  - sessionXP      : number  — XP earned this session
 *  - xp             : number  — user's total XP after award
 *  - level          : number  — user's current level
 *  - requiredXP     : number  — XP needed for next level
 *  - leaderboard    : array   — leaderboard entries [{ userId, name, xp, rank }]
 *  - currentUserId  : string  — logged-in user id
 *  - storyTitle     : string
 *  - onDismiss      : () => void
 */
export function ReadingCompletePopup({
  sessionXP = 50,
  xp = 0,
  level = 1,
  requiredXP = 1000,
  leaderboard = [],
  currentUserId,
  storyTitle = 'this story',
  onDismiss,
}) {
  const { t } = useLanguage();
  const [displayXP, setDisplayXP] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Count-up animation
  useEffect(() => {
    const delay = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (!showContent || sessionXP <= 0) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(sessionXP / 35));
    const interval = setInterval(() => {
      current = Math.min(current + step, sessionXP);
      setDisplayXP(current);
      if (current >= sessionXP) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [showContent, sessionXP]);

  // Find user's rank in leaderboard
  const myEntry = leaderboard.find(e => String(e.userId) === String(currentUserId));
  const foundIndex = leaderboard.findIndex(e => String(e.userId) === String(currentUserId));
  const rank = myEntry?.rank ?? (foundIndex >= 0 ? foundIndex + 1 : null);

  // Progress toward next level
  const xpPct = requiredXP > 0 ? Math.min(100, (xp / requiredXP) * 100) : 100;

  // Rank label
  const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank ? `#${rank}` : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(44,26,20,0.75)', backdropFilter: 'blur(10px)',
        padding: '1rem',
      }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24, delay: 0.05 } }}
        exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.18 } }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #FDFBF7 0%, #FEF3C7 100%)',
          borderRadius: 24, padding: '2rem 1.75rem',
          maxWidth: 420, width: '100%',
          boxShadow: '0 32px 80px rgba(44,26,20,0.4), 0 0 0 1px rgba(141,73,58,0.12)',
          textAlign: 'center',
        }}
      >
        {/* Confetti emoji header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1], transition: { times: [0, 0.6, 1], duration: 0.5, delay: 0.15 } }}
          style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1 }}
        >
          🎉
        </motion.div>

        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 800, color: '#2C1A14' }}>
          {t('gamification.adventureComplete')}
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: '#6F5B55' }}>
          {t('gamification.finishedReading')} <strong>{storyTitle}</strong>
        </p>

        {/* XP earned card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
          style={{
            background: 'linear-gradient(135deg, #8D493A, #3E2723)',
            borderRadius: 16, padding: '1.1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>
            {t('gamification.xpEarnedThisSession')}
          </div>
          <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#FEF3C7', lineHeight: 1 }}>
            +{displayXP}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
            {t('gamification.adventureXp')}
          </div>
        </motion.div>

        {/* Level progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
          style={{
            background: '#fff', borderRadius: 14, padding: '0.9rem 1rem',
            marginBottom: '0.75rem', border: '1px solid #EADBC8',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.75rem', color: '#6F5B55', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: '#2C1A14' }}>{t('gamification.level')} {level}</span>
            <span>{xp.toLocaleString()} / {requiredXP.toLocaleString()} XP</span>
          </div>
          <div style={{ height: 8, background: '#EADBC8', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%`, transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.5 } }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#8D493A,#D97706)', borderRadius: 999 }}
            />
          </div>
        </motion.div>

        {/* Leaderboard rank */}
        {rankLabel && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
            style={{
              background: '#fff', borderRadius: 14, padding: '0.85rem 1rem',
              marginBottom: '0.75rem', border: '1px solid #EADBC8',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{rankLabel}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2C1A14' }}>
                {t('gamification.onLeaderboard')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6F5B55' }}>
                {t('gamification.rank')} {rank} {t('gamification.amongExplorers')}
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.55 } }}
          style={{ fontSize: '0.78rem', color: '#8D493A', fontWeight: 600, margin: '0 0 1.25rem' }}
        >
          {t('gamification.keepExploring')}
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDismiss}
          style={{
            width: '100%', background: '#8D493A', color: '#fff',
            border: 'none', borderRadius: 14, padding: '0.85rem',
            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          {t('gamification.continueAdventure')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
