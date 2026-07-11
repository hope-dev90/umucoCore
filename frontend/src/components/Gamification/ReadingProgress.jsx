import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export function ReadingProgress({ totalWords = 500, scrollContainerRef, xpReward = 50, onMilestone, onComplete }) {
  const { t } = useLanguage();
  const [pct, setPct]  = useState(0);
  const hitRef         = useRef(new Set());
  const completedRef   = useRef(false);

  useEffect(() => {
    const el = scrollContainerRef?.current || window;

    const onScroll = () => {
      let percent;
      if (scrollContainerRef?.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        percent = scrollHeight - clientHeight <= 0
          ? 100
          : Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      } else {
        const { scrollY, innerHeight } = window;
        const total = document.documentElement.scrollHeight - innerHeight;
        percent = total <= 0 ? 100 : Math.min(100, Math.round((scrollY / total) * 100));
      }

      setPct(percent);

      // Fire milestone callbacks once each
      for (const m of [25, 50, 75]) {
        if (percent >= m && !hitRef.current.has(m)) {
          hitRef.current.add(m);
          onMilestone?.(m);
        }
      }

      // Complete once
      if (percent >= 100 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef, onMilestone, onComplete]);

  const remaining = Math.max(0, Math.ceil(((100 - pct) / 100) * totalWords / 200));

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #EADBC8', padding: '0.4rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      {/* Progress bar */}
      <div style={{ flex: 1, height: 4, background: '#EADBC8', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
          style={{ height: '100%', background: '#8D493A', borderRadius: 999 }}
        />
      </div>

      <span style={{ fontSize: '0.7rem', color: '#8D493A', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {pct}%
      </span>

      {remaining > 0 && (
        <span style={{ fontSize: '0.7rem', color: '#6F5B55', whiteSpace: 'nowrap' }}>
          ~{remaining}{t('gamification.minuteShort')} {t('gamification.left')}
        </span>
      )}

      <span style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700,
        background: '#FEF3C7', padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
        +{xpReward} XP
      </span>
    </div>
  );
}
