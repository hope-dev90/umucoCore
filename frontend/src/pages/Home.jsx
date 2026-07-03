import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import nyanzeImage from '../assets/home/nyanza.jpg';
import intoreImage from '../assets/home/intore.jpg';
import kigeliImage from '../assets/home/kigeli.jpg';
import inangaImage from '../assets/home/inanga.jpg';
import ubudeheImage from '../assets/home/ubudehe.jpg';
import {
  Headphones,
  Plus,
  Search,
  FileText,
  Music,
  Video
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const exploreItems = [
    {
      label: 'Intore Culture',
      meta: 'History • 12 mins left',
      image: intoreImage,
    },
    {
      label: 'Kigeli IV Rwabugiri',
      meta: 'Linkage • New Activity',
      image: kigeliImage,
    },
    {
      label: 'Traditional Music',
      meta: 'Audio • 4 Stories',
      image: inangaImage,
    },
    {
      label: 'Ubudehe',
      meta: 'Values • Updated',
      image: ubudeheImage,
    },
  ];

  const recentItems = [
    { icon: <Music size={16} />, type: 'audio', title: 'Oral History – Nyamasheke', date: 'Audio • 12 May 2025' },
    { icon: <Video size={16} />, type: 'video', title: 'Traditional Dance – Intore', date: 'Video • 10 May 2025' },
    { icon: <FileText size={16} />, type: 'doc', title: 'Document – 1962 Letter', date: 'Document • 8 May 2025' },
  ];

  const activityItems = [
    { label: 'Viewed: The Royal Palace – Nyanza', time: '16 May 2025' },
    { label: 'Saved: Intore Dance', time: '15 May 2025' },
    { label: 'Listened: Byivugo by Intore', time: '16 May 2025' },
  ];

  const upcomingDays = [
    { day: '21', month: 'MAY', title: 'Cultural Diversity Day', sub: 'Dialogue and Development • 21 May 2025' },
    { day: '23', month: 'JUN', title: 'International Widows\' Day', sub: 'Community Support & History • 23 June 2025' },
    { day: '09', month: 'AUG', title: 'Day of Indigenous Peoples', sub: 'Global Heritage Preservation • 9 August 2025' },
  ];

  const quickActions = [
    { icon: <Headphones size={16} />, label: t('home.listen') },
    { icon: <Plus size={16} />, label: t('home.contribute') },
    { icon: <Search size={16} />, label: t('home.advancedSearch') },
  ];

  const handleExploreNow = () => {
    navigate('/explore');
  };

  return (
    <Layout searchPlaceholder="search.placeholder">
      <div className="home-header">
        <h1>{t('home.welcome')} {user?.name || 'Guest'}</h1>
        <p>{t('home.subtitle')}</p>
      </div>

      <div className="home-grid">
        <div>
          <div className="highlight-card">
            <span className="highlight-badge">{t('home.todayHighlight')}</span>
            <div className="highlight-image">
              <img
                src={nyanzeImage}
                alt="Royal Palace Nyanza"
                className="highlight-img"
              />
            </div>
            <div className="highlight-content">
              <div>
                <h2>{t('home.highlight.title')}</h2>
                <p>{t('home.highlight.desc')}</p>
              </div>
              <div className="highlight-actions">
                <button className="btn-primary" onClick={handleExploreNow}>
                  {t('home.exploreNow')}
                </button>
                <button className="btn-outline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {t('home.share')}
                </button>
              </div>
            </div>
          </div>

          <div className="section-header">
            <span className="section-title">{t('home.continueExploring')}</span>
            <span className="section-link">{t('home.viewAll')}</span>
          </div>

          <div className="explore-cards">
            {exploreItems.map((item, i) => (
              <div key={i} className="explore-thumb">
                <div className="explore-thumb-img">
                  <img
                    src={item.image}
                    alt={item.label}
                  />
                </div>
                <div className="explore-thumb-label">{item.label}</div>
                <div className="explore-thumb-meta">{item.meta}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('home.popularTopics')}
            </span>
          </div>
          <div className="topics-wrap">
            {['Ubwiru', 'Amateka y\'u Rwanda', 'Ingoma', 'Abami b\'u Rwanda', 'Indangagaciro', 'Uburego'].map((topic, i) => (
              <span key={i} className="topic-chip">{topic}</span>
            ))}
          </div>

          <div className="bottom-row">
            <div className="kwibuka-card">
              <div>
                <h3>{t('home.kwibuka.title')}</h3>
                <p style={{ fontSize: 10, marginTop: 3 }}>{t('home.kwibuka.desc')}</p>
              </div>
              <div>
                <div className="kwibuka-countdown">
                  <span className="days-num">31</span>
                  <span className="days-label">{t('home.daysToGo')}</span>
                </div>
                <button className="kwibuka-btn">{t('home.exploreKwibuka')}</button>
              </div>
            </div>

            <div className="recent-list">
              <div className="section-header" style={{ marginTop: 0 }}>
                <span className="section-title">{t('home.recentlyAdded')}</span>
                <span className="section-link">{t('home.viewAll')}</span>
              </div>
              {recentItems.map((item, i) => (
                <div key={i} className="recent-item">
                  <div className={`recent-icon ${item.type}`}>{item.icon}</div>
                  <div className="recent-info">
                    <h4>{item.title}</h4>
                    <p>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="activity-list">
              <div className="section-header" style={{ marginTop: 0 }}>
                <span className="section-title">{t('home.yourActivity')}</span>
              </div>
              {activityItems.map((item, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-info">
                    <h4>{item.label}</h4>
                    <p>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="home-sidebar">
          <div className="date-card">
            <div className="date-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="date-info">
              <span>{t('home.todayDateLabel')}</span>
              <span>{t('home.todayDate')}</span>
            </div>
          </div>

          <div className="quote-card">
            <div className="quote-label">{t('home.quoteOfDay')}</div>
            <div className="quote-text">{t('home.quoteText')}</div>
            <div className="quote-sub">{t('home.quoteSub')}</div>
          </div>

          <div className="quick-actions">
            <div className="quick-action-title">{t('home.quickActions')}</div>
            {quickActions.map((qa, i) => (
              <div key={i} className="quick-action-item">
                <div className="quick-action-left">
                  <div className="quick-action-icon">
                    {qa.icon}
                  </div>
                  <span className="quick-action-label">{qa.label}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>

          <div className="upcoming-card">
            <div className="section-header" style={{ marginTop: 0 }}>
              <span className="section-title">{t('home.upcomingDays')}</span>
              <span className="section-link">{t('home.viewAll')}</span>
            </div>
            {upcomingDays.map((day, i) => (
              <div key={i} className="upcoming-item">
                <div className="upcoming-date">
                  <span className="day">{day.day}</span>
                  <span className="month">{day.month}</span>
                </div>
                <div className="upcoming-info">
                  <h4>{day.title}</h4>
                  <p>{day.sub}</p>
                </div>
              </div>
            ))}
            <button className="see-calendar-btn">{t('home.seeFullCalendar')}</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
