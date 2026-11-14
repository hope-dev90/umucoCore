import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Play, Share2 } from 'lucide-react';
import Layout from '../components/Layout';
import './Kwibuka.css';
import './KwibukaDs.css';
import { useLanguage } from '../contexts/LanguageContext';
import KwibukaGallery from '../components/KwibukaGallery';
import KwibukaMemorialMap from '../components/KwibukaMemorialMap';
import memorialData from '../data/genocideMemorialSites.json';
import siteImages from '../data/memorialSiteImages.json';
import testimonyData from '../data/survivorTestimony.json';
import Memorial1Img from '../assets/kwibuka/memorial1.jpg';
import Memorial2Img from '../assets/kwibuka/memorial2.jpg';
import ReflectionImg from '../assets/kwibuka/reflection.jpg';

const FALLBACK_SITE_IMAGES = [Memorial1Img, Memorial2Img, ReflectionImg];

const IMPORTANT_SITES = [
  { name: 'MINUBUMWE', descKey: 'kwibuka.site.minubumwe', url: 'https://www.minubumwe.gov.rw' },
  { name: 'Kigali Genocide Memorial', descKey: 'kwibuka.site.kgm', url: 'https://kgm.rw' },
  { name: 'Aegis Trust', descKey: 'kwibuka.site.aegis', url: 'https://www.aegistrust.org' },
  { name: 'United Nations', descKey: 'kwibuka.site.un', url: 'https://www.un.org/en/preventgenocide/rwanda' },
];

function KwibukaFlameLogo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 160" role="img" aria-label="Kwibuka remembrance flame">
      <path d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z" fill="currentColor" />
      <path d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z" fill="currentColor" />
      <path d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z" fill="currentColor" />
    </svg>
  );
}

// Kwibuka is counted from April 1995 (Kwibuka 1); the commemoration starts on 7 April.
function kwibukaNumber(now = new Date()) {
  const afterApril7 = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 7);
  return now.getFullYear() - 1994 - (afterApril7 ? 0 : 1);
}

const pick = (val, language) => (val && typeof val === 'object' ? (val[language] || val.en || Object.values(val)[0]) : (val || ''));

export default function Kwibuka() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [topbarSearch, setTopbarSearch] = React.useState('');
  const [galleryOpen, setGalleryOpen] = React.useState(false);

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

  const query = topbarSearch.trim().toLowerCase();
  const matches = (...parts) => !query || parts.join(' ').toLowerCase().includes(query);

  const sites = (memorialData.sites || [])
    .map((site, i) => ({
      id: site.id,
      name: pick(site.name, language),
      district: pick(site.district, language),
      image: siteImages.sites?.[site.id]?.image || FALLBACK_SITE_IMAGES[i % FALLBACK_SITE_IMAGES.length],
    }))
    .filter((s) => matches(s.name, s.district));

  const testimonies = (Array.isArray(testimonyData) ? testimonyData : (testimonyData.testimonies || testimonyData.items || []))
    .filter((item) => matches(item.title, (item.subjects || []).join(' '), item.district));

  const kwibukaN = kwibukaNumber();

  const shareReflection = async () => {
    const text = `${t('kwibuka.reflectionQuote')} ${t('kwibuka.reflectionAuthor')}`;
    try {
      if (navigator.share) await navigator.share({ title: `Kwibuka ${kwibukaN}`, text });
      else await navigator.clipboard.writeText(text);
    } catch { /* cancelled */ }
  };

  const scrollToMap = () => {
    document.getElementById('kwibuka-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Layout searchPlaceholder={t('kwibuka.searchPlaceholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="ds-page kwb">
        {/* Banner */}
        <section className="kwb-banner">
          <div className="kwb-banner-art" aria-hidden="true" />
          <div className="kwb-brand">
            <KwibukaFlameLogo className="kwb-flame" />
            <div>
              <div className="kwb-wordmark">kwibuka <span>{kwibukaN}</span></div>
              <div className="kwb-tagline">{t('kwibuka.markLabel')}</div>
            </div>
          </div>
          <blockquote className="kwb-quote">
            <p>&ldquo;{t('kwibuka.reflectionQuote')}&rdquo;</p>
            <cite>{t('kwibuka.reflectionAuthor')}</cite>
          </blockquote>
          <div className="kwb-banner-actions">
            <button type="button" className="kwb-btn kwb-btn--light" onClick={() => navigate('/testimonies')}>
              <Play size={12} fill="currentColor" /> {t('kwibuka.readTestimonyBtn')}
            </button>
            <button type="button" className="kwb-btn" onClick={shareReflection}>
              <Share2 size={12} /> {t('kwibuka.shareReflectionBtn')}
            </button>
          </div>
        </section>

        {/* Virtual memorial sites */}
        <div className="kwb-heading">
          <h2>{t('kwibuka.virtualSites')}</h2>
          <p>{t('kwibuka.virtualSitesSub')}</p>
        </div>
        <div className="kwb-sites">
          {sites.map((site) => (
            <button type="button" key={site.id} className="kwb-site" onClick={scrollToMap}>
              <img src={site.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              <span className="kwb-site-name">{site.name}</span>
              <span className="kwb-site-meta">{site.district}</span>
            </button>
          ))}
        </div>

        {/* Memorial map */}
        <div className="kwb-map" id="kwibuka-map">
          <KwibukaMemorialMap />
        </div>

        {/* Speeches + testimonies */}
        <section className="kwb-archive">
          <div className="kwb-speeches">
            <span className="kwb-kicker">{t('kwibuka.community')}</span>
            <h3>{t('kwibuka.speeches')}</h3>
            <div className="kwb-speech-list">
              {videos.filter((v) => matches(v.title)).map((v) => (
                <button type="button" key={v.id} className="kwb-speech" onClick={() => setGalleryOpen(true)}>
                  <strong>{v.title}</strong>
                  <small>{t('kwibuka.videoLabel')}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="kwb-oral">
            <span className="kwb-kicker">{t('kwibuka.oralArchive')}</span>
            <h3>{t('kwibuka.testimoniesSongs')}</h3>
            <div className="kwb-oral-list">
              {testimonies.map((item) => (
                <button type="button" key={item.id} className="kwb-oral-row" onClick={() => navigate(`/testimony/${item.id}`)}>
                  <span className="kwb-oral-play"><Play size={12} fill="currentColor" /></span>
                  <span className="kwb-oral-text">
                    <strong>{item.title} <em>{item.language || t('kwibuka.testimonyTag')}</em></strong>
                    <small>{[(item.subjects || []).join(', '), item.district].filter(Boolean).join(' · ')}</small>
                  </span>
                </button>
              ))}
              {songs.filter((s) => matches(s.title)).map((song) => (
                <button type="button" key={song.id} className="kwb-oral-row" onClick={() => setGalleryOpen(true)}>
                  <span className="kwb-oral-play"><Play size={12} fill="currentColor" /></span>
                  <span className="kwb-oral-text">
                    <strong>{song.title} <em>{t('kwibuka.songTag')}</em></strong>
                    <small>{t('kwibuka.remembranceSong')}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Important websites */}
        <div className="kwb-heading">
          <span className="kwb-kicker">{t('kwibuka.importantWebsites')}</span>
          <h2>{t('kwibuka.knowMore')}</h2>
        </div>
        <div className="kwb-links">
          {IMPORTANT_SITES.map((site) => (
            <a key={site.url} className="kwb-link" href={site.url} target="_blank" rel="noopener noreferrer">
              <KwibukaFlameLogo className="kwb-link-mark" />
              <strong>{site.name}</strong>
              <small>{t(site.descKey)}</small>
              <ExternalLink size={13} className="kwb-link-ext" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      {galleryOpen && (
        <KwibukaGallery videos={videos} songs={songs} onClose={() => setGalleryOpen(false)} />
      )}
    </Layout>
  );
}
