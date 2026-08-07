import React from 'react';
import Layout from '../components/Layout';
import './Kwibuka.css';
import ReflectionImg from '../assets/kwibuka/reflection.jpg';
import Memorial1Img from '../assets/kwibuka/memorial1.jpg';
import Memorial2Img from '../assets/kwibuka/memorial2.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

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

const voices = [
  { 
    type: { en: 'Audio Testimony', rw: 'Ubutumwa bw\'Umva' }, 
    title: { en: 'The Hill of Bisesero', rw: 'Umusozi wa Bisesero' }, 
    excerpt: { en: '"We stood together on those slopes for weeks. Our unity..."', rw: '"Turahagaze hamwe mu misozi imwe ku magoroba..."' } 
  },
  { 
    type: { en: 'Written Archive', rw: 'Isoko y\'Ibinyandiko' }, 
    title: { en: 'Letters from Nyamata', rw: 'Amabaruva avya Nyamata' }, 
    excerpt: { en: 'A collection of recovered letters documenting the final...', rw: 'Ibikoresho by\'amabaruva byasibwe byanditswe ibyo byagenze...' } 
  },
  { 
    type: { en: 'Video Interview', rw: 'Ibishushanyo by\'Interviwe' }, 
    title: { en: 'Finding Forgiveness', rw: 'Kumenya Ubusa' }, 
    excerpt: { en: 'Jean-Claude reflects on 30 years of reconciliation and...', rw: 'Jean-Claude yigishije imyaka 30 y\'ubumwe n\'...' } 
  },
];

const events = [
  { 
    dot: 'active', 
    date: { en: 'April 7', rw: 'Mata 7' }, 
    title: { en: 'Lighting of the Flame of Remembrance', rw: 'Gushisha Ijwi ry\'Kwibuka' }, 
    desc: { en: 'The national commemoration period begins with the lighting of the eternal flame at the Kigali Genocide Memorial.', rw: 'Igihe cyo kwibuka cyigihugu cyatanga kugira icyo gushisha ijwi ry\'umuhigo muri Kigali Genocide Memorial.' } 
  },
  { 
    dot: 'past', 
    date: { en: 'April 13', rw: 'Mata 13' }, 
    title: { en: 'National Dialogue on Reconstruction', rw: 'Iganwa ry\'Igihugu ry\'Ubunyanzi' }, 
    desc: { en: 'A youth-led forum discussing the progress of Rwanda\'s social fabric and economic transformation over three decades.', rw: 'Umukumanuro w\'abatoza wibabara ibintu by\'ubumwe bw\'igihugu n\'ubuyobozi bw\'imari mu myaka 30.' } 
  },
  { 
    dot: 'future', 
    date: { en: 'May 20', rw: 'Mugarura 20' }, 
    title: { en: 'The International Symposium of Memory', rw: 'Umukumanuro w\'Umahanga w\'Ibiharuro' }, 
    desc: { en: 'Global scholars and survivors convene to share insights on genocide prevention and archival technologies.', rw: 'Abanyamabare b\'umahanga n\'abahungiye bararangiye kugira ngo bange ibintu byo kubera abantu n\'ubwenge bw\'ibitondozo.' } 
  },
];

export default function Kwibuka() {
  const { t, language } = useLanguage();
  const [topbarSearch, setTopbarSearch] = React.useState('');
  const [showGallery, setShowGallery] = React.useState(false);

  const filteredVoices = topbarSearch.trim()
    ? voices.filter(v => {
        const q = topbarSearch.toLowerCase();
        return (v.title.en || '').toLowerCase().includes(q)
          || (v.title.rw || '').toLowerCase().includes(q)
          || (v.excerpt.en || '').toLowerCase().includes(q);
      })
    : voices;

  const videos = [
    { id: 'ww2ycQpsk-k', title: { en: 'Kwibuka 30: Remembering the Genocide', rw: 'Kwibuka 30: Kwibuka Jenoside' } },
    { id: 'hON_Xls2_F8', title: { en: 'Rwanda\'s Journey of Reconciliation', rw: 'Urugendo rw\'Ubumwe n\'Ubwiyunge mu Rwanda' } },
    { id: 'vVfbRNpgSiY', title: { en: 'The Genocide Against the Tutsi', rw: 'Jenoside yakorewe Abatutsi' } },
    { id: '-q6Og4qTiRE', title: { en: 'Kwibuka: Never Again', rw: 'Kwibuka: Ntabwo Bizongera' } },
  ];

  const songs = [
    { id: 'mX9C47nqQvk', title: { en: 'Kwibuka Song - Remember', rw: 'Indirimbo ya Kwibuka' } },
    { id: 'nQ_EGsniRC4', title: { en: 'Tribute to the Victims', rw: 'Ishimwe ry\'Abahitanywe' } },
  ];

  return (
    <Layout searchPlaceholder={t('kwibuka.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="kwibuka-page">

        {/* Gallery Section - shown when "Explore Repository" is clicked */}
        {showGallery && (
          <div className="kwibuka-gallery-section">
            <div className="gallery-header">
              <h2 className="gallery-title">{t('kwibuka.galleryTitle') || 'Kwibuka Gallery'}</h2>
              <p className="gallery-subtitle">{t('kwibuka.gallerySubtitle') || 'Videos and songs of remembrance'}</p>
            </div>

            {/* Videos Grid */}
            <div className="gallery-videos">
              <h3 className="gallery-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {t('kwibuka.videosTitle') || 'Videos'}
              </h3>
              <div className="video-grid">
                {videos.map((video, i) => (
                  <div key={i} className="video-card">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={getLocalizedText(video.title, language)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="video-card-title">{getLocalizedText(video.title, language)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Songs Grid */}
            <div className="gallery-songs">
              <h3 className="gallery-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                {t('kwibuka.songsTitle') || 'Songs of Remembrance'}
              </h3>
              <div className="songs-grid">
                {songs.map((song, i) => (
                  <div key={i} className="song-card">
                    <iframe
                      src={`https://www.youtube.com/embed/${song.id}`}
                      title={getLocalizedText(song.title, language)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="song-card-title">{getLocalizedText(song.title, language)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
              <button className="btn-testimony">
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
                <div className="voice-type">{getLocalizedText(v.type, language)}</div>
                <div className="voice-title">{getLocalizedText(v.title, language)}</div>
                <div className="voice-excerpt">{getLocalizedText(v.excerpt, language)}</div>
              </div>
            ))}
            <button className="explore-repo-btn" onClick={() => setShowGallery(!showGallery)}>
              {showGallery ? t('kwibuka.hideGalleryBtn') || 'Hide Gallery' : t('kwibuka.exploreRepoBtn')}
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
                <div className="event-date">{getLocalizedText(ev.date, language)}</div>
                <div className="event-title">{getLocalizedText(ev.title, language)}</div>
                <div className="event-desc">{getLocalizedText(ev.desc, language)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  );
}
