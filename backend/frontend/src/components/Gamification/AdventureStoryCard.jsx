import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../utils/motionConfig';

const DIFF_DOTS = { easy: 1, medium: 2, hard: 3 };

export function AdventureStoryCard({ story = {}, onClick }) {
  const {
    title, description, image_url, category,
    readingTimeMinutes = 5, difficulty = 'medium',
    xpReward = 50, isCompleted = false, isLocked = false,
  } = story;

  const hoverVariants = useMotionSafe({
    rest:  { y: 0,  boxShadow: '0 2px 8px rgba(44,26,20,0.08)' },
    hover: { y: -4, boxShadow: '0 12px 32px rgba(44,26,20,0.18)' },
  });

  const dots = DIFF_DOTS[difficulty] || 2;

  const handleClick = () => {
    if (!isLocked && onClick) onClick(story);
  };

  return (
    <motion.div
      variants={hoverVariants}
      initial="rest"
      whileHover={isLocked ? {} : 'hover'}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={handleClick}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #EADBC8', cursor: isLocked ? 'not-allowed' : 'pointer',
        filter: isLocked ? 'grayscale(60%)' : 'none',
        position: 'relative', display: 'flex', flexDirection: 'column',
        minWidth: 200,
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: '#F5EFE8' }}>
        {image_url && (
          <img src={image_url} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Category chip */}
        {category && (
          <span style={{
            position: 'absolute', top: 8, left: 8, background: 'rgba(44,26,20,0.75)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            padding: '2px 8px', borderRadius: 999,
          }}>
            {category}
          </span>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: '#10B981', color: '#fff',
            width: 26, height: 26, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(16,185,129,0.4)',
          }}>✓</span>
        )}

        {/* Locked overlay */}
        {isLocked && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(44,26,20,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
          }}>🔒</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#2C1A14',
          lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h4>

        {description && (
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#6F5B55', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 6 }}>
          <span style={{ fontSize: '0.68rem', color: '#8D493A' }}>⏱ {readingTimeMinutes}m</span>

          <span style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
            {[1,2,3].map(n => (
              <span key={n} style={{ fontSize: '0.55rem', color: n <= dots ? '#8D493A' : '#D9C6BC' }}>●</span>
            ))}
          </span>

          <span style={{ marginLeft: 'auto', background: '#FEF3C7', color: '#92400E',
            fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
            +{xpReward} XP
          </span>
        </div>

        {/* CTA button */}
        <button
          disabled={isLocked}
          onClick={handleClick}
          style={{
            marginTop: 6, background: isCompleted ? 'transparent' : '#8D493A',
            color: isCompleted ? '#8D493A' : '#fff',
            border: isCompleted ? '1px solid #8D493A' : 'none',
            borderRadius: 8, padding: '0.45rem', fontSize: '0.72rem',
            fontWeight: 700, cursor: isLocked ? 'not-allowed' : 'pointer',
            width: '100%', opacity: isLocked ? 0.5 : 1,
          }}
        >
          {isLocked ? '🔒 Locked' : isCompleted ? 'Re-read' : 'Embark on Adventure'}
        </button>
      </div>
    </motion.div>
  );
}
