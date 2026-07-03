import React from 'react';
import Layout from '../components/Layout';
import './History.css';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

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
  Image:   { d: "M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8z M3 15l5-5 4 4 3-3 5 5", color: '#1A7B4B', bg: '#E8FFF3' },
};

// Dynamic history data with multilingual support
const historyItems = [
  { 
    title: { 
      en: 'The Royal Palace – Nyanza', 
      rw: 'Ingoro y\'Umwami – Nyanza' 
    }, 
    type: 'Place', 
    date: { 
      en: 'Viewed 2 hours ago', 
      rw: 'Byamenye amahora 2' 
    } 
  },
  { 
    title: { 
      en: 'Intore Traditional Dance', 
      rw: 'Interuro y\'Intore' 
    }, 
    type: 'Video', 
    date: { 
      en: 'Viewed Yesterday', 
      rw: 'Byamenye ejo' 
    } 
  },
  { 
    title: { 
      en: 'Byivugo by Intore', 
      rw: 'Byivugo by Intore' 
    }, 
    type: 'Audio', 
    date: { 
      en: 'Viewed 2 days ago', 
      rw: 'Byamenye amesi 2' 
    } 
  },
  { 
    title: { 
      en: 'King Kigeli IV Rwabugiri', 
      rw: 'Umwami Kigeli IV Rwabugiri' 
    }, 
    type: 'Article', 
    date: { 
      en: 'Viewed 3 days ago', 
      rw: 'Byamenye amesi 3' 
    } 
  },
];

export default function History() {
  const { t, language } = useLanguage();

  return (
    <Layout>
      <div className="history-page">
        <div className="history-header">
          <h1>{t('history.title')}</h1>
          <p>{t('history.subtitle')}</p>
        </div>

        <div className="history-stats">
          <div className="history-stat-card">
            <h2>24</h2>
            <span>{t('history.statItemsViewed')}</span>
          </div>
          <div className="history-stat-card">
            <h2>8</h2>
            <span>{t('history.statAudioSessions')}</span>
          </div>
          <div className="history-stat-card">
            <h2>12</h2>
            <span>{t('history.statArticlesRead')}</span>
          </div>
        </div>

        <div className="history-list">
          {historyItems.map((item, index) => {
            const icon = TYPE_ICONS[item.type] || TYPE_ICONS.Article;
            const typeKey = `history.type${item.type}`;
            return (
              <div key={index} className="history-item">
                <div className="history-icon" style={{ background: icon.bg, color: icon.color }}>
                  <Icon d={icon.d} size={20} />
                </div>
                <div className="history-content">
                  <h3>{getLocalizedText(item.title, language)}</h3>
                  <span className="history-type-badge" style={{ background: icon.bg, color: icon.color }}>
                    {t(typeKey)}
                  </span>
                </div>
                <span className="history-date">{getLocalizedText(item.date, language)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
