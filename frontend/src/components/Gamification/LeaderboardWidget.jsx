import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Flame, Star, Trophy, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import ExplorerTypeImage from '../ExplorerTypeImage';
import { UmucoGlyph } from '../UmucoGlyphs';

function getEntryId(entry, index) {
  return entry.userId || entry.id || entry.user_id || index;
}

function entryExplorerLabel(entry, t) {
  const explorerType = entry.explorerType || entry.explorer_type;
  return explorerType ? t(`profile.explorer.${explorerType}`) : t('gamification.explorer');
}

export function LeaderboardWidget({ entries = [], currentUserId, limit = 10 }) {
  const { t } = useLanguage();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const sorted = useMemo(() => [...entries]
    .sort((a, b) => (b.xp || b.total_xp || 0) - (a.xp || a.total_xp || 0))
    .slice(0, limit), [entries, limit]);

  if (!sorted.length) {
    return (
      <div className="leaderboard-empty">
        {t('gamification.noLeaderboard')}
      </div>
    );
  }

  const selectedRank = selectedEntry
    ? sorted.findIndex((entry, index) => getEntryId(entry, index) === getEntryId(selectedEntry, index)) + 1
    : 0;

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <span>
          <UmucoGlyph type="medal" size={18} style={{ color: '#8D493A' }} />
          {t('gamification.leaderboard')}
        </span>
        <small>{t('gamification.top')} {sorted.length}</small>
      </div>

      {sorted.map((entry, index) => {
        const rank = index + 1;
        const xp = entry.xp || entry.total_xp || 0;
        const level = entry.level || 1;
        const name = entry.name || entry.username || t('gamification.explorer');
        const explorerType = entry.explorerType || entry.explorer_type;
        const isCurrent = entry.userId === currentUserId || entry.id === currentUserId || entry.user_id === currentUserId;

        return (
          <button
            type="button"
            key={getEntryId(entry, index)}
            className={`leaderboard-row ${isCurrent ? 'is-current' : ''}`}
            onClick={() => setSelectedEntry(entry)}
          >
            <span className="leaderboard-rank">
              {rank <= 3 ? <UmucoGlyph type="medal" size={18} style={{ color: '#8D493A' }} /> : rank}
            </span>
            <span className="leaderboard-avatar">{name.charAt(0).toUpperCase()}</span>
            <span className="leaderboard-person">
              <strong>{name}</strong>
              <small>
                {explorerType ? <ExplorerTypeImage type={explorerType} label="" size={16} /> : null}
                {xp.toLocaleString()} XP
              </small>
            </span>
            <span className="leaderboard-level">{t('gamification.levelShort')} {level}</span>
          </button>
        );
      })}

      {selectedEntry ? (
        <div className="leaderboard-detail-backdrop" role="presentation" onClick={() => setSelectedEntry(null)}>
          <div className="leaderboard-detail" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="leaderboard-detail-close" onClick={() => setSelectedEntry(null)} aria-label="Close">
              <X size={16} />
            </button>
            <div className="leaderboard-detail-top">
              <span className="leaderboard-detail-avatar">{(selectedEntry.name || selectedEntry.username || 'E').charAt(0).toUpperCase()}</span>
              <div>
                <h3>{selectedEntry.name || selectedEntry.username || t('gamification.explorer')}</h3>
                <p>{entryExplorerLabel(selectedEntry, t)}</p>
              </div>
            </div>
            <div className="leaderboard-detail-grid">
              <div><Trophy size={18} /><span>Rank</span><strong>#{selectedRank || '-'}</strong></div>
              <div><Star size={18} /><span>XP</span><strong>{(selectedEntry.xp || selectedEntry.total_xp || 0).toLocaleString()}</strong></div>
              <div><Award size={18} /><span>Level</span><strong>{selectedEntry.level || 1}</strong></div>
              <div><Flame size={18} /><span>Streak</span><strong>{selectedEntry.currentStreak || selectedEntry.current_streak || 0}</strong></div>
            </div>
            <div className="leaderboard-detail-note">
              <CheckCircle2 size={16} />
              <span>This explorer is building progress through stories, quests, and saved discoveries.</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
