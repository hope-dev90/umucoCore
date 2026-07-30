import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import './History.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import commonsImageCache from '../data/commonsImageCache.json';
import { apiUrl } from '../config/api';

const Icon = ({ d, size = 18, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TYPE_ICONS = {
  Place:   { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z", color: '#8D493A', bg: '#FFF0EB' },
  Video:   { d: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z", color: '#1A508B', bg: '#E8F0FF' },
  Audio:   { d: "M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6z M18 19a3 3 0 100-6 3 3 0 000 6z", color: '#5A1A8B', bg: '#F0E8FF' },
  Article: { d: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z M8 7h8 M8 11h8 M8 15h5", color: '#B86A00', bg: '#FFF3E0' },
};

function formatRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}


export default function History() {
  const { t } = useLanguage();
  const { user, getToken } = useAuth();
  const [topbarSearch, setTopbarSearch] = useState('');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ items_viewed: 0, audio_sessions: 0, articles_read: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(apiUrl('/api/history'), { headers }).then(r => r.json()),
      fetch(apiUrl('/api/history/stats'), { headers }).then(r => r.json()),
    ])
      .then(([historyData, statsData]) => {
        setItems(historyData.items || []);
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load history:', err);
        setError('Failed to load history');
        setLoading(false);
      });
  }, [user]);

  const filteredItems = items.filter(item => {
    const q = topbarSearch.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout searchPlaceholder={t('history.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="history-page">
        <div className="history-header">
          <h1>{t('history.title')}</h1>
          <p>{t('history.subtitle')}</p>
        </div>

        <div className="history-stats">
          <div className="history-stat-card">
            <h2>{stats.items_viewed || 0}</h2>
            <span>{t('history.statItemsViewed')}</span>
          </div>
          <div className="history-stat-card">
            <h2>{stats.audio_sessions || 0}</h2>
            <span>{t('history.statAudioSessions')}</span>
          </div>
          <div className="history-stat-card">
            <h2>{stats.articles_read || 0}</h2>
            <span>{t('history.statArticlesRead')}</span>
          </div>
        </div>

        <div className="history-list">
          {loading && (
            <div className="history-item" style={{ justifyContent: 'center', color: '#8A7B73' }}>
              Loading your history...
            </div>
          )}

          {!loading && error && (
            <div className="history-item" style={{ justifyContent: 'center', color: '#c0392b' }}>
              {error}
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="history-empty">
              <div className="history-empty-icon">📜</div>
              <p>{t('history.empty') || 'Nothing here yet — start exploring to build your history.'}</p>
            </div>
          )}

          {!loading && !error && filteredItems.map((item, index) => {
            const icon = TYPE_ICONS[item.type] || TYPE_ICONS.Article;
            const image = commonsImageCache[item.title] || item.image || null;
            return (
              <div key={item.id || index} className="history-item">
                {image ? (
                  <img src={image} alt={item.title} className="history-thumb" />
                ) : (
                  <div className="history-icon" style={{ background: icon.bg, color: icon.color }}>
                    <Icon d={icon.d} size={20} />
                  </div>
                )}
                <div className="history-content">
                  <h3>{item.title}</h3>
                  <span className="history-type-badge" style={{ background: icon.bg, color: icon.color }}>
                    {item.type}
                  </span>
                </div>
                <span className="history-date">{formatRelativeTime(item.viewedAt)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}