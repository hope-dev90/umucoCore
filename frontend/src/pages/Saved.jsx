import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './Saved.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Saved() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, offline: 0, storageUsedMB: 0, storageLimitMB: 5120 });
  const [loading, setLoading] = useState(true);
  const [topbarSearch, setTopbarSearch] = useState('');

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:5000/api/saved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch saved items");
        const data = await res.json();
        setItems(data.items || []);
        setStats(data.stats || { total: 0, offline: 0, storageUsedMB: 0, storageLimitMB: 5120 });
      } catch (err) {
        console.error("Error fetching saved items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/saved/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove");
      setItems(prev => prev.filter(i => String(i.item_id) !== String(itemId)));
    } catch (err) {
      console.error("Remove failed:", err);
      alert("Failed to remove item.");
    }
  };

  const handlePlay = (savedItem) => {
    const payload = {
      itemType: savedItem.item_type,
      itemId: savedItem.item_id,
      itemTitle: savedItem.item_title,
      itemSubtitle: savedItem.item_subtitle,
      itemImage: savedItem.item_image,
      itemMeta: savedItem.item_meta,
    };

    if (savedItem.item_type === 'audio') {
      localStorage.setItem('pendingAudioPlay', JSON.stringify(payload));
      navigate('/listen');
    } else if (savedItem.item_type === 'video') {
      localStorage.setItem('pendingVideoPlay', JSON.stringify(payload));
      navigate('/videos');
    } else if (savedItem.item_type === 'story' || savedItem.item_type === 'heritage') {
      localStorage.setItem('pendingStoryRead', JSON.stringify(payload));
      navigate('/explore');
    }
  };

  const formatStorage = (mb) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  const filteredItems = topbarSearch.trim()
    ? items.filter(s => {
        const q = topbarSearch.toLowerCase();
        return (s.item_title || '').toLowerCase().includes(q)
          || (s.item_subtitle || '').toLowerCase().includes(q)
          || (s.item_type || '').toLowerCase().includes(q);
      })
    : items;

  return (
    <Layout searchPlaceholder={t('saved.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="saved-page">
        <div className="saved-header">
          <div className="saved-header-left">
            <h1>{t('saved.title')}</h1>
            <p>{t('saved.subtitle')}</p>
          </div>
          <div className="storage-info">
            <div className="storage-label">
              {t('saved.storageLabel')} {formatStorage(stats.storageUsedMB)} / {formatStorage(stats.storageLimitMB)}
            </div>
            <div className="storage-bar">
              <div
                className="storage-fill"
                style={{ width: `${Math.min(100, (stats.storageUsedMB / stats.storageLimitMB) * 100)}%` }}
              />
            </div>
            <div className="storage-actions">
              <button className="storage-btn sync">{t('saved.syncBtn')}</button>
              <button className="storage-btn download">{t('saved.downloadAllBtn')}</button>
            </div>
          </div>
        </div>

        <div className="saved-grid">
          <div className="recent-saves" style={{ gridColumn: '1 / -1' }}>
            <h3>
              {t('saved.recentSavesHeader')}
            </h3>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading saved items...</p>
            ) : items.length === 0 ? (
              <div className="pf-empty">Your saved audio, videos, and stories will appear here.</div>
            ) : (
              <div className="saves-grid">
                {filteredItems.map((s, i) => (
                  <div key={s.id || i} className="save-card">
                    <div className="save-card-img">
                      {s.item_image ? (
                        <img src={s.item_image} alt={s.item_title} />
                      ) : (
                        <div className="save-card-img-placeholder" style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.5rem'
                        }}>
                          {s.item_type === 'audio' ? '\u266B' : s.item_type === 'video' ? '\uD83C\uDFAC' : '\uD83D\uDCC4'}
                        </div>
                      )}
                      <span className={`save-status-badge ${s.item_meta?.offline ? 'badge-offline' : 'badge-online'}`}>
                        {s.item_meta?.offline ? t('saved.OFFLINE') : t('saved.ONLINE')}
                      </span>
                    </div>
                    <div className="save-card-body">
                      <div className="save-card-cat">
                        {s.item_type === 'audio' ? (language === 'rw' ? 'Umva' : 'Audio') : s.item_type === 'video' ? (language === 'rw' ? 'Video' : 'Video') : (language === 'rw' ? 'Inkuru' : 'Story')}
                        {s.item_subtitle ? ` • ${s.item_subtitle}` : ''}
                      </div>
                      <div className="save-card-title">{s.item_title}</div>
                      <div className="save-card-actions">
                        <button className="save-card-action-btn" onClick={() => handlePlay(s)}>
                          {s.item_type === 'audio' ? (language === 'rw' ? 'Umva' : 'Listen') : s.item_type === 'video' ? (language === 'rw' ? 'Reba' : 'Watch') : (language === 'rw' ? 'Soma' : 'Read')}
                        </button>
                        <button className="save-card-delete" onClick={() => handleRemove(s.item_id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
