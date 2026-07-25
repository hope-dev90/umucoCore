import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { Headphones, Video, FileText } from 'lucide-react';
import ExplorerTypeImage from '../components/ExplorerTypeImage';
import { UmucoGlyph } from '../components/UmucoGlyphs';
import { apiUrl } from '../config/api';
import nyanzaImage from '../assets/home/nyanza.jpg';
import intoreImage from '../assets/home/intore.jpg';
import kigeliImage from '../assets/home/kigeli.jpg';
import inangaImage from '../assets/home/inanga.jpg';
import ubudeheImage from '../assets/home/ubudehe.jpg';

const EXPLORER_TYPES = [
  { id: 'warrior', label: 'Warrior' },
  { id: 'nature-lover', label: 'Nature Lover' },
  { id: 'royal-historian', label: 'Royal Historian' },
  { id: 'folktale-hunter', label: 'Folktale Hunter' },
  { id: 'music-explorer', label: 'Music Explorer' },
];

const EXPLORER_CATEGORY = {
  warrior: 'warrior',
  'nature-lover': 'nature',
  'royal-historian': 'royal',
  'folktale-hunter': 'folklore',
  'music-explorer': 'music',
};

export default function Home() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { level, streak } = useGamificationContext();
  const explorerType = user?.explorerType || user?.explorer_type;
  const [heritage, setHeritage] = useState([]);
  const [audio, setAudio] = useState([]);
  const [videos, setVideos] = useState([]);

  const activeExplorerType = explorerType;
  const activeExplorer = EXPLORER_TYPES.find((type) => type.id === activeExplorerType);
  const category = EXPLORER_CATEGORY[activeExplorerType] || '';
  const firstName = user?.name?.split(' ')[0] || 'Explorer';

  useEffect(() => {
    const heritageUrl = category ? apiUrl(`/api/heritage?category=${category}`) : apiUrl('/api/heritage');
    Promise.all([
      fetch(heritageUrl).then((res) => res.json()).catch(() => ({})),
      fetch(apiUrl('/api/audio')).then((res) => res.json()).catch(() => ({})),
      fetch(apiUrl('/api/video')).then((res) => res.json()).catch(() => ({})),
    ]).then(([heritageData, audioData, videoData]) => {
      setHeritage(Array.isArray(heritageData) ? heritageData : heritageData.items || []);
      setAudio(audioData.audio || []);
      setVideos(videoData.video || []);
    });
  }, [category]);

  const contentCards = useMemo(() => [
    ...heritage.map((item) => ({ ...item, type: 'heritage', route: '/explore', icon: <FileText size={16} /> })),
    ...audio.map((item) => ({ ...item, type: 'audio', route: '/listen', icon: <Headphones size={16} /> })),
    ...videos.map((item) => ({ ...item, type: 'video', route: '/videos', icon: <Video size={16} /> })),
  ].slice(0, 8), [heritage, audio, videos]);

  const prototypeCards = useMemo(() => [
    {
      id: 'prototype-nyanza',
      type: 'story',
      route: '/explore',
      category: 'Royal',
      category_rw: 'Ubwami',
      category_fr: 'Royal',
      title: "Ingoro y'Ubwami ya Nyanza",
      title_rw: "Ingoro y'Ubwami ya Nyanza",
      title_fr: 'Palais royal de Nyanza',
      description: "Explore Rwanda's royal court, architecture, rituals, and daily life through a guided prototype story.",
      description_rw: "Menya urukiko rw'ubwami, ubwubatsi, imihango n'ubuzima bwa buri munsi by'u Rwanda.",
      description_fr: "Explorez la cour royale du Rwanda, son architecture, ses rites et sa vie quotidienne.",
      image_url: nyanzaImage,
    },
    {
      id: 'prototype-intore',
      type: 'story',
      route: '/explore',
      category: 'Performance',
      category_rw: 'Imbyino',
      category_fr: 'Performance',
      title: 'Intore Culture',
      title_rw: "Umuco w'Intore",
      title_fr: 'Culture Intore',
      description: 'A story of discipline, bravery, rhythm, and ceremonial movement passed through generations.',
      description_rw: "Inkuru y'ikinyabupfura, ubutwari, injyana n'imihango yagiye ihererekanwa.",
      description_fr: "Une histoire de discipline, de bravoure, de rythme et de mouvement ceremonial transmise de generation en generation.",
      image_url: intoreImage,
    },
    {
      id: 'prototype-kigeli',
      type: 'story',
      route: '/collections',
      category: 'Legends',
      category_rw: 'Ibitekerezo',
      category_fr: 'Legendes',
      title: 'Kigeli IV Rwabugiri',
      title_rw: 'Kigeli IV Rwabugiri',
      title_fr: 'Kigeli IV Rwabugiri',
      description: 'A prototype journey into kingship, expansion, court memory, and oral history.',
      description_rw: "Urugendo rw'igerageza mu bwami, kwaguka k'u Rwanda, kwibuka k'ibwami n'amateka yo mu mvugo.",
      description_fr: "Un parcours prototype sur la royaute, l'expansion, la memoire de cour et l'histoire orale.",
      image_url: kigeliImage,
    },
    {
      id: 'prototype-inanga',
      type: 'audio',
      route: '/listen',
      category: 'Music',
      category_rw: 'Umuziki',
      category_fr: 'Musique',
      title: 'Traditional Music',
      title_rw: 'Umuziki Gakondo',
      title_fr: 'Musique traditionnelle',
      description: 'Inanga, drums, praise poetry, and the sound of cultural memory.',
      description_rw: "Inanga, ingoma, ibisigo n'ijwi ry'ubwibuke bw'umuco.",
      description_fr: "Inanga, tambours, poesie de louange et sons de la memoire culturelle.",
      image_url: inangaImage,
    },
    {
      id: 'prototype-ubudehe',
      type: 'story',
      route: '/collections',
      category: 'Values',
      category_rw: 'Indangagaciro',
      category_fr: 'Valeurs',
      title: 'Ubudehe',
      title_rw: 'Ubudehe',
      title_fr: 'Ubudehe',
      description: 'A prototype story about shared work, mutual responsibility, and community life.',
      description_rw: "Inkuru y'igerageza ku murimo rusange, gufashanya n'ubuzima bw'abaturage.",
      description_fr: "Une histoire prototype sur le travail partage, la responsabilite mutuelle et la vie communautaire.",
      image_url: ubudeheImage,
    },
  ].map((card) => ({
    ...card,
    category: card[`category_${language}`] || card.category,
    title: card[`title_${language}`] || card.title,
    description: card[`description_${language}`] || card.description,
  })), [language]);
  const displayCards = contentCards.length ? contentCards : prototypeCards;
  const highlight = displayCards[0] || null;

  return (
    <>
      <Layout searchPlaceholder="search.placeholder">
        <div className="home-shell">
          <div className="home-header">
            <h1>
              {t('dashboard.greeting.default')} {firstName}
              {activeExplorer && (
                <ExplorerTypeImage type={activeExplorer.id} label={activeExplorer.label} size={34} style={{ marginLeft: 10, verticalAlign: 'middle' }} />
              )}
            </h1>
            <p>{t('home.subtitle')}</p>
          </div>

          <div className="dashboard-quest-strip" aria-label={t('dashboard.questOverview')}>
            <div className="dashboard-quest-tile"><UmucoGlyph type="medal" size={34} /><div><span>{t('dashboard.level')}</span><strong>{t('gamification.levelShort')} {level || 1}</strong></div></div>
            <div className="dashboard-quest-tile"><UmucoGlyph type="trail" size={34} /><div><span>{t('dashboard.dailyStreak')}</span><strong>{t('dashboard.daysValue').replace('{days}', streak || 0)}</strong></div></div>
            <div className="dashboard-quest-tile"><UmucoGlyph type="quest" size={34} /><div><span>{contentCards.length ? 'Published Records' : 'Prototype Stories'}</span><strong>{displayCards.length}</strong></div></div>
          </div>

          <div className="highlight-card">
            <span className="highlight-badge">{t('home.todayHighlight')}</span>
            {highlight ? (
              <>
                <div className="highlight-image">
                  {highlight.image_url || highlight.thumbnail_url ? <img src={highlight.image_url || highlight.thumbnail_url} alt={highlight.title} /> : null}
                </div>
                <div className="highlight-content">
                  <h2>{highlight.title}</h2>
                  <p>{highlight.description || highlight.summary || ''}</p>
                  <div className="highlight-actions">
                    <button className="btn-primary" onClick={() => navigate(highlight.route)}>{t('home.exploreNow')}</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="highlight-content">
                <h2>No dashboard content</h2>
                <p>Add heritage, audio, video, collections, or imigani from the admin dashboard to publish records here.</p>
              </div>
            )}
          </div>

          <div className="section-header">
            <span className="section-title">{t('home.continueExploring')}</span>
            <button type="button" className="section-link link-button" onClick={() => navigate('/explore')}>{t('home.viewAll')}</button>
          </div>

          <div className="explore-cards">
            {displayCards.map((item) => (
              <div key={`${item.type}-${item.id}`} className="explore-thumb" role="button" tabIndex={0} onClick={() => navigate(item.route)}>
                <div className="explore-thumb-img">
                  {item.image_url || item.thumbnail_url ? <img src={item.image_url || item.thumbnail_url} alt={item.title} /> : null}
                </div>
                <div className="explore-thumb-top">
                  <span className="explore-thumb-category">{item.category || item.type}</span>
                </div>
                <div className="explore-thumb-label">{item.title}</div>
                <div className="explore-thumb-meta">{item.description || item.summary || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
}
