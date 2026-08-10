import React from 'react';
import Layout from '../components/Layout';
import './Kwibuka.css';
import ReflectionImg from '../assets/kwibuka/reflection.jpg';
import Memorial1Img from '../assets/kwibuka/memorial1.jpg';
import Memorial2Img from '../assets/kwibuka/memorial2.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import KwibukaGallery from '../components/KwibukaGallery';
import SurvivorTestimonyGallery from '../components/SurvivorTestimonyGallery';

const IMG = {
  reflection: ReflectionImg,
  memorial1: Memorial1Img,
  memorial2: Memorial2Img,
};

function KwibukaFlameLogo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 160"
      role="img"
      aria-label="Kwibuka remembrance flame"
    >
      <path
        d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z"
        fill="currentColor"
      />
      <path
        d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z"
        fill="currentColor"
      />
      <path
        d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z"
        fill="currentColor"
      />
      <path
        className="kwibuka-flame-cutout"
        d="M58 97c-12-10-11-24 4-42-3 24 5 32 18 39-19 6-30 22-28 47-14-15-13-31 6-44Z"
      />
      <path
        d="M58 97c-12-10-11-24 4-42"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

// voices and events are built inside the component so t() is available

export default function Kwibuka() {
  const { t } = useLanguage();
  const [topbarSearch, setTopbarSearch] = React.useState('');
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [testimonyGalleryOpen, setTestimonyGalleryOpen] = React.useState(false);

  const voices = [
    {
      type: t('kwibuka.voice1.type'),
      title: t('kwibuka.voice1.title'),
      excerpt: t('kwibuka.voice1.excerpt'),
    },
    {
      type: t('kwibuka.voice2.type'),
      title: t('kwibuka.voice2.title'),
      excerpt: t('kwibuka.voice2.excerpt'),
    },
    {
      type: t('kwibuka.voice3.type'),
      title: t('kwibuka.voice3.title'),
      excerpt: t('kwibuka.voice3.excerpt'),
    },
  ];

  const events = [
    {
      dot: 'active',
      date: t('kwibuka.event1.date'),
      title: t('kwibuka.event1.title'),
      desc: t('kwibuka.event1.desc'),
    },
    {
      dot: 'past',
      date: t('kwibuka.event2.date'),
      title: t('kwibuka.event2.title'),
      desc: t('kwibuka.event2.desc'),
    },
    {
      dot: 'future',
      date: t('kwibuka.event3.date'),
      title: t('kwibuka.event3.title'),
      desc: t('kwibuka.event3.desc'),
    },
  ];

  const videos = [
    { id: 'ww2ycQpsk-k', title: t('kwibuka.video1.title') },
    { id: 'hON_Xls2_F8', title: t('kwibuka.video2.title') },
    { id: 'vVfbRNpgSiY', title: t('kwibuka.video3.title') },
    { id: '-q6Og4qTiRE', title: t('kwibuka.video4.title') },
  ];

  const songs = [
    { id: 'mX9C47nqQvk', title: t('kwibuka.song1.title') },
    { id: 'nQ_EGsniRC4', title: t('kwibuka.song2.title') },
  ];

  const filteredVoices = topbarSearch.trim()
    ? voices.filter(v => {
        const q = topbarSearch.toLowerCase();
        return v.title.toLowerCase().includes(q)
          || v.excerpt.toLowerCase().includes(q)
          || v.type.toLowerCase().includes(q);
      })
    : voices;

  return (
    <Layout searchPlaceholder={t('kwibuka.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="kwibuka-page">

        {/* Today's Reflection hero */}
        <div className="reflection-hero">
          <img src={IMG.reflection} alt="Reflection" className="reflection-hero-bg"
            onError={e => e.target.style.display='none'} />
          <div className="reflection-hero-overlay" />
          <div className="reflection-hero-content">
            <div className="kwibuka-flame-badge">
              <KwibukaFlameLogo className="kwibuka-flame-logo" />
              <span>{t('kwibuka.markLabel')}</span>
            </div>
            <div className="reflection-label">{t('kwibuka.reflectionLabel')}</div>
            <div className="reflection-quote">
              {t('kwibuka.reflectionQuote')}
            </div>
            <div className="reflection-author">{t('kwibuka.reflectionAuthor')}</div>
            <div className="reflection-actions">
              <button className="btn-testimony" onClick={() => setTestimonyGalleryOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {t('kwibuka.readTestimonyBtn')}
              </button>
              <button className="btn-share-reflect">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {t('kwibuka.shareReflectionBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* Mid grid: Memorial + Voices */}
        <div className="kwibuka-mid">
          <div className="memorial-card">
            <div className="memorial-card-header">
              <div>
                <div className="memorial-card-title">{t('kwibuka.memorialTitle')}</div>
                <div className="memorial-card-sub">{t('kwibuka.memorialSub')}</div>
              </div>
              <KwibukaFlameLogo className="memorial-flame-logo" />
            </div>
            <div className="memorial-photos">
              {[IMG.memorial1, IMG.memorial2].map((src, i) => (
                <div key={i} className="memorial-photo">
                  <img src={src} alt={`Memorial ${i+1}`}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="memorial-photo-placeholder"
                    style={{ background: i===0 ? 'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))' : 'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))', display:'none' }}>
                    {i===0 ? '' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="voices-card">
            <div className="voices-title">{t('kwibuka.voicesTitle')}</div>
            {filteredVoices.map((v, i) => (
              <div key={i} className="voice-item">
                <div className="voice-type">{v.type}</div>
                <div className="voice-title">{v.title}</div>
                <div className="voice-excerpt">{v.excerpt}</div>
              </div>
            ))}
            <button className="explore-repo-btn" onClick={() => setGalleryOpen(true)}>
              {t('kwibuka.exploreRepoBtn')}
            </button>
          </div>
        </div>

        {/* Events timeline */}
        <div className="events-section">
          <div className="events-header">
            <div className="events-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              {t('kwibuka.eventsTitle')}
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          {events.map((ev, i) => (
            <div key={i} className="event-item">
              <div className={`event-dot ${ev.dot}`} />
              <div className="event-info">
                <div className="event-date">{ev.date}</div>
                <div className="event-title">{ev.title}</div>
                <div className="event-desc">{ev.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Modal - opens when "Explore Repository" is clicked */}
      {galleryOpen && (
        <KwibukaGallery 
          videos={videos} 
          songs={songs} 
          onClose={() => setGalleryOpen(false)} 
        />
      )}

      {/* Survivor Testimony Gallery - opens when "Read testimony" is clicked */}
      {testimonyGalleryOpen && (
        <SurvivorTestimonyGallery 
          onClose={() => setTestimonyGalleryOpen(false)} 
        />
      )}
    </Layout>
  );
}
