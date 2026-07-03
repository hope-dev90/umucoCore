import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Saved.css';
import hillsImg from '../assets/nyanza.jpg';
import weavingImg from '../assets/weaving_agaseke.jpg';
import campfireImg from '../assets/listen/moon-story.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

const IMG = {
  hills: hillsImg,
  weaving: weavingImg,
  campfire: campfireImg,
};

// Dynamic content with multilingual support example
const savedCollections = [
  { 
    icon: '', 
    color: 'var(--primary-soft)', 
    name: { 
      en: 'Oral Traditions', 
      rw: 'Imigenzo z\'Umucyo' 
    }, 
    meta: { 
      en: '45 Stories • 420 MB', 
      rw: 'Inkuru 45 • 420 MB' 
    }, 
    toggle: 'on', 
    status: 'offline' 
  },
  { 
    icon: '', 
    color: 'var(--primary-soft)', 
    name: { 
      en: 'Inanga Melodies', 
      rw: 'Indirimbo z\'Inanga' 
    }, 
    meta: { 
      en: '12 Audios • 158 MB', 
      rw: 'Amajwi 12 • 158 MB' 
    }, 
    toggle: 'off', 
    status: 'online' 
  },
  { 
    icon: '', 
    color: 'var(--primary-soft)', 
    name: { 
      en: 'Pre-Colonial Maps', 
      rw: 'Imibare y\'Ibihembwa' 
    }, 
    meta: { 
      en: '8 Artifacts • 89 MB', 
      rw: 'Ibintu 8 • 89 MB' 
    }, 
    toggle: 'on', 
    status: 'offline' 
  },
];

const recentSaves = [
  { 
    img: IMG.hills, 
    badge: 'offline', 
    cat: { 
      en: 'History • 12 hrs read', 
      rw: 'Amateka • 12 amasaha' 
    }, 
    title: { 
      en: 'The Kings of Nyanza: A Legacy of Unity', 
      rw: 'Abami b\'Nyanza: Umwenda w\'Ubumwe' 
    }, 
    action: { 
      en: 'Listen', 
      rw: 'Umva' 
    } 
  },
  { 
    img: IMG.weaving, 
    badge: 'online', 
    cat: { 
      en: 'Artisan • Video Tutorial', 
      rw: 'Umuhanzi • Ishusho' 
    }, 
    title: { 
      en: 'Agaseke: Secrets of the Peace Basket', 
      rw: 'Agaseke: Ibintu bya gaciro' 
    }, 
    action: { 
      en: 'Make Offline', 
      rw: 'Kubika Bihari' 
    } 
  },
];

export default function Saved() {
  const [toggles, setToggles] = useState({ 0: true, 1: false, 2: true });
  const { t, language } = useLanguage();

  return (
    <Layout searchPlaceholder={t('saved.searchPlaceholder')}>
      <div className="saved-page">
        <div className="saved-header">
          <div className="saved-header-left">
            <h1>{t('saved.title')}</h1>
            <p>{t('saved.subtitle')}</p>
          </div>
          <div className="storage-info">
            <div className="storage-label">{t('saved.storageLabel')} 1.2 GB / 5.0 GB</div>
            <div className="storage-bar"><div className="storage-fill" /></div>
            <div className="storage-actions">
              <button className="storage-btn sync">{t('saved.syncBtn')}</button>
              <button className="storage-btn download">{t('saved.downloadAllBtn')}</button>
            </div>
          </div>
        </div>

        <div className="saved-grid">
          {/* Collections sidebar */}
          <div className="saved-collections">
            <h3>{t('saved.collectionsHeader')}</h3>
            {savedCollections.map((c, i) => (
              <div key={i} className="saved-coll-item">
                <div className="coll-item-top">
                  <div className="coll-item-icon-wrap">
                    <div className="coll-item-icon" style={{ background: c.color }}>{c.icon}</div>
                    <span className="coll-item-name">{getLocalizedText(c.name, language)}</span>
                  </div>
                  <button
                    className={`coll-toggle ${toggles[i] ? 'on' : 'off'}`}
                    onClick={() => setToggles(t => ({ ...t, [i]: !t[i] }))}
                  />
                </div>
                <div className="coll-item-meta">{getLocalizedText(c.meta, language)}</div>
                <div className={`coll-item-status ${c.status === 'offline' ? 'status-offline' : 'status-online'}`}>
                  {c.status === 'offline' ? t('saved.statusOffline') : t('saved.statusOnline')}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Saves */}
          <div className="recent-saves">
            <h3>
              {t('saved.recentSavesHeader')}
              <div className="saves-toggle-btns">
                <button className="saves-view-btn active">⊞</button>
                <button className="saves-view-btn">≡</button>
              </div>
            </h3>
            <div className="saves-grid">
              {recentSaves.map((s, i) => (
                <div key={i} className="save-card">
                  <div className="save-card-img">
                    <img src={s.img} alt={getLocalizedText(s.title, language)}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="save-card-img-placeholder"
                      style={{ background: i===0?'linear-gradient(135deg,var(--primary),var(--primary-dark))':'linear-gradient(135deg,var(--primary),var(--primary-dark))', display:'none' }}>
                      {i===0?'':''}
                    </div>
                    <span className={`save-status-badge ${s.badge==='offline'?'badge-offline':'badge-online'}`}>
                      {s.badge==='offline' ? t('saved.OFFLINE') : t('saved.ONLINE')}
                    </span>
                  </div>
                  <div className="save-card-body">
                    <div className="save-card-cat">{getLocalizedText(s.cat, language)}</div>
                    <div className="save-card-title">{getLocalizedText(s.title, language)}</div>
                    <div className="save-card-actions">
                      <button className="save-card-action-btn">
                        {''} {getLocalizedText(s.action, language)}
                      </button>
                      <button className="save-card-delete">🗑</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Campfire image card */}
              <div className="save-card">
                <div className="save-card-img">
                  <img src={IMG.campfire} alt="Campfire story"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="save-card-img-placeholder"
                    style={{ background:'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))', display:'none' }}></div>
                </div>
                <div className="save-card-body">
                  <div className="save-card-cat">{language === 'rw' ? 'Indirimbo • Umva' : 'Music • Audio Track'}</div>
                  <div className="save-card-title">{language === 'rw' ? 'Umushayayo: Indirimbo z\'Umugabo' : 'Umushayayo: Rhythms of Grace'}</div>
                  <div className="save-card-actions">
                    <span className="playing-badge">▶ {language === 'rw' ? 'Ururimi' : 'Playing'}</span>
                    <button className="save-card-delete">🗑</button>
                  </div>
                </div>
              </div>

              {/* Save New Story */}
              <div className="save-new-card">
                <div className="save-new-plus">＋</div>
                <div className="save-new-label">{t('saved.saveNewLabel1')}<br/>{t('saved.saveNewLabel2')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
