import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const RANK_EMOJI = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EXPLORER_EMOJI = {
  warrior:          '🦁',
  'nature-lover':   '🌿',
  'royal-historian':'👑',
  'folktale-hunter':'🎭',
  'music-explorer': '🥁',
};

export function LeaderboardWidget({ entries = [], currentUserId, limit = 10 }) {
  const { t } = useLanguage();
  const sorted = [...entries]
    .sort((a, b) => (b.xp || b.total_xp || 0) - (a.xp || a.total_xp || 0))
    .slice(0, limit);

  if (!sorted.length) {
    return (
      <div style={{ padding: '1rem', background: '#fff', border: '1px solid #EADBC8',
        borderRadius: 16, textAlign: 'center', color: '#6F5B55', fontSize: '0.8rem' }}>
        {t('gamification.noLeaderboard')}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #EADBC8', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid #EADBC8',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2C1A14' }}>🏆 {t('gamification.leaderboard')}</span>
        <span style={{ fontSize: '0.7rem', color: '#6F5B55' }}>{t('gamification.top')} {sorted.length}</span>
      </div>

      {sorted.map((entry, i) => {
        const rank        = i + 1;
        const xp          = entry.xp || entry.total_xp || 0;
        const level       = entry.level || 1;
        const name        = entry.name || entry.username || t('gamification.explorer');
        const explorerType= entry.explorerType || entry.explorer_type;
        const isCurrent   = entry.userId === currentUserId || entry.id === currentUserId || entry.user_id === currentUserId;

        return (
          <div key={entry.userId || entry.id || i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 1.1rem',
            background: isCurrent ? 'rgba(141,73,58,0.06)' : 'transparent',
            borderLeft: isCurrent ? '3px solid #8D493A' : '3px solid transparent',
            borderBottom: i < sorted.length - 1 ? '1px solid #F5EDE4' : 'none',
          }}>
            {/* Rank */}
            <span style={{ fontSize: rank <= 3 ? '1rem' : '0.75rem', fontWeight: 700,
              color: '#8D493A', minWidth: 20, textAlign: 'center' }}>
              {RANK_EMOJI[rank] || rank}
            </span>

            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#8D493A', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
            }}>
              {name.charAt(0).toUpperCase()}
            </div>

            {/* Name + type */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2C1A14',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name} {EXPLORER_EMOJI[explorerType] || ''}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6F5B55' }}>{xp.toLocaleString()} XP</div>
            </div>

            {/* Level pill */}
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FEF3C7',
              color: '#92400E', padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              {t('gamification.levelShort')} {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
