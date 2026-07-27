import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Flame, Gem, Sparkles, TrendingUp, X } from 'lucide-react';

const CARD_META = {
  xp: { Icon: Sparkles, accent: '#C4724A' },
  levelUp: { Icon: TrendingUp, accent: '#8D493A' },
  badge: { Icon: Award, accent: '#A9821F' },
  collectible: { Icon: Gem, accent: '#8D493A' },
  streak: { Icon: Flame, accent: '#E67E22' },
};

function cleanReason(reason = '') {
  if (!reason) return '';
  if (reason === 'story_completed') return 'Finished reading a story';
  if (reason === 'quiz_completed') return 'Completed a story quiz';
  if (reason === 'daily_login') return 'Daily visit reward';
  return reason
    .replace(/^Read dashboard item:\s*/i, 'Read: ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCopy(notice) {
  const { type, payload } = notice;
  const reason = cleanReason(payload?.reason);

  switch (type) {
    case 'xp':
      return {
        kicker: reason || 'Progress Reward',
        title: `+${payload.amount} XP`,
        subtitle: reason ? `Awarded because you ${reason.toLowerCase()}.` : 'Awarded for a completed learning action.',
      };
    case 'levelUp':
      return {
        kicker: 'Level Up',
        title: `Level ${payload.level} reached`,
        subtitle: 'You moved up to a new rank.',
      };
    case 'badge':
      return {
        kicker: 'Badge Unlocked',
        title: payload.badge?.name || 'New badge unlocked',
        subtitle: 'A new badge was added to your profile.',
      };
    case 'collectible':
      return {
        kicker: 'Collectible Found',
        title: payload.collectible?.name || 'New collectible found',
        subtitle: 'A new reward was added to your collection.',
      };
    case 'streak':
      return {
        kicker: 'Streak',
        title: `${payload.streak}-day streak`,
        subtitle: 'You kept your learning momentum going.',
      };
    default:
      return {
        kicker: 'Achievement',
        title: 'New achievement',
        subtitle: 'Your profile has a new mark.',
      };
  }
}

export function AchievementNoticeCard({ notice, onDismiss }) {
  const meta = CARD_META[notice.type] || CARD_META.xp;
  const copy = getCopy(notice);
  const Icon = meta.Icon || CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="achievement-notice-card"
      style={{ '--notice-accent': meta.accent }}
    >
      <div className="achievement-notice-bar" />
      <div className="achievement-notice-body">
        <div className="achievement-notice-icon">
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className="achievement-notice-copy">
          <div className="achievement-notice-kicker">{copy.kicker}</div>
          <div className="achievement-notice-title">{copy.title}</div>
          <div className="achievement-notice-subtitle">{copy.subtitle}</div>
        </div>
        <button type="button" onClick={onDismiss} className="achievement-notice-close" aria-label="Dismiss reward notice">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
