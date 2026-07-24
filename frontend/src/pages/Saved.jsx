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
    const type = (savedItem.item_type || '').toLowerCase();
    if (type === 'audio') {
      navigate(`/listen?play=${savedItem.item_id}`);
    } else if (type === 'video') {
      navigate(`/videos?play=${savedItem.item_id}`);
    } else if (type === 'collection') {
      const slug = savedItem.item_meta?.slug;
      navigate(slug ? `/collections?open=${slug}` : '/collections');
    } else if (type === 'story' || type === 'heritage') {
      navigate(`/explore?open=${savedItem.item_id}`);
    }
  };

  const getTypeLabel = (type) => {
    const t_type = (type || '').toLowerCase();
    if (t_type === 'audio') return language === 'rw' ? 'Umva' : 'Audio';
    if (t_type === 'video') return language === 'rw' ? 'Video' : 'Video';
    if (t_type === 'collection') return language === 'rw' ? 'Amakusanyirizo' : 'Collection';
    return language === 'rw' ? 'Inkuru' : 'Story';
  };

  const getActionLabel = (type) => {
    const t_type = (type || '').toLowerCase();
    if (t_type === 'audio') return language === 'rw' ? 'Umva' : 'Listen';
    if (t_type === 'video') return language === 'rw' ? 'Reba' : 'Watch';
    if (t_type === 'collection') return language === 'rw' ? 'Reba' : 'View';
    return language === 'rw' ? 'Soma' : 'Read';
  };

  const getTypeIcon = (type) => {
    const t_type = (type || '').toLowerCase();
    if (t_type === 'audio') return '♪';
    if (t_type === 'video') return '▶';
    if (t_type === 'collection') return '🏺';
    return '📄';
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
                  <div key={s.id || i} className="save-card" onClick={() => handlePlay(s)}>
                    <div className="save-card-img">
                      {s.item_image ? (
                        <img src={s.item_image} alt={s.item_title} />
                      ) : (
                        <div className="save-card-img-placeholder">
                          {getTypeIcon(s.item_type)}
                        </div>
                      )}
                      <span className={`save-status-badge ${s.item_meta?.offline ? 'badge-offline' : 'badge-online'}`}>
                        {s.item_meta?.offline ? t('saved.OFFLINE') : t('saved.ONLINE')}
                      </span>
                    </div>
                    <div className="save-card-body">
                      <div className="save-card-cat">
                        {getTypeLabel(s.item_type)}
                        {s.item_subtitle ? ` • ${s.item_subtitle}` : ''}
                      </div>
                      <div className="save-card-title">{s.item_title}</div>
                      <div className="save-card-actions">
                        <button className="save-card-action-btn" onClick={(e) => { e.stopPropagation(); handlePlay(s); }}>
                          {getActionLabel(s.item_type)}
                        </button>
                        <button className="save-card-delete" onClick={(e) => { e.stopPropagation(); handleRemove(s.item_id); }}>🗑</button>
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
