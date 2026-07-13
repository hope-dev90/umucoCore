import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import nyanzeImage from '../assets/home/nyanza.jpg';
import intoreImage from '../assets/home/intore.jpg';
import kigeliImage from '../assets/home/kigeli.jpg';
import inangaImage from '../assets/home/inanga.jpg';
import ubudeheImage from '../assets/home/ubudehe.jpg';
import { ArrowRight, X, Swords, Leaf, Crown, Drama, Drum } from 'lucide-react';
import {
  Headphones,
  Plus,
  Search,
  FileText,
  Music,
  Video
} from 'lucide-react';
// Removed: these widgets are now in the persistent Layout panel
import ExplorerTypeImage from '../components/ExplorerTypeImage';

const EXPLORER_TYPES = [
  { id: 'warrior',         label: 'Warrior',          tagline: 'Battles, legends & brave deeds'   },
  { id: 'nature-lover',    label: 'Nature Lover',      tagline: 'Forests, hills & wild places'     },
  { id: 'royal-historian', label: 'Royal Historian',   tagline: 'Kings, courts & old dynasties'    },
  { id: 'folktale-hunter', label: 'Folktale Hunter',   tagline: 'Myths, proverbs & fireside tales' },
  { id: 'music-explorer',  label: 'Music Explorer',    tagline: 'Rhythms, songs & instruments'     },
];

const ADVENTURE_POPUPS = {
  warrior: {
    label: 'warriors',
    accentWord: 'warriors',
    accent: '#8B4513',
    image: '/images/collections/warriors.jpg',
    icon: Swords,
    title: 'Are you ready to discover more about warriors in ancient Rwanda?',
    description: 'Uncover their stories, bravery, and the legacy they left behind.',
    confirmText: "Yes, let's go!",
    route: '/home',
  },
  'nature-lover': {
    label: 'nature',
    accentWord: 'landscapes',
    accent: '#3F7A4A',
    image: '/images/collections/nature.jpg',
    icon: Leaf,
    title: "Are you ready to follow Rwanda's living landscapes?",
    description: 'Walk through forests, hills, rivers, and the traditions shaped by the natural world.',
    confirmText: 'Start the trail',
    route: '/home',
  },
  'royal-historian': {
    label: 'royal heritage',
    accentWord: 'royal court',
    accent: '#9A7418',
    image: '/images/collections/royal-court.jpg',
    icon: Crown,
    title: "Are you ready to enter Rwanda's royal court?",
    description: 'Explore kings, dynasties, ceremonies, and the histories preserved around the palace.',
    confirmText: 'Enter the court',
    route: '/home',
  },
  'folktale-hunter': {
    label: 'folktales',
    accentWord: 'stories',
    accent: '#6B4A8D',
    image: '/images/collections/folklore.jpg',
    icon: Drama,
    title: 'Are you ready to chase the old stories?',
    description: 'Discover proverbs, myths, fireside lessons, and the imagination carried by oral tradition.',
    confirmText: 'Chase the legend',
    route: '/home',
  },
  'music-explorer': {
    label: 'music',
    accentWord: 'heritage',
    accent: '#1F7A8C',
    image: '/images/collections/music.jpg',
    icon: Drum,
    title: "Are you ready to hear Rwanda's heritage?",
    description: 'Listen for drums, inanga, praise poetry, and rhythms that keep memory alive.',
    confirmText: 'Follow the rhythm',
    route: '/home',
  },
};

function AdventurePopup({ type, isOpen, onClose, onConfirm }) {
  const { t } = useLanguage();
  if (!isOpen || !type) return null;

  const popup = ADVENTURE_POPUPS[type] || ADVENTURE_POPUPS.warrior;
  const Icon = popup.icon;
  const title = t(`adventure.${type}.title`);
  const description = t(`adventure.${type}.description`);
  const confirmText = t(`adventure.${type}.confirm`);
  const accentWord = t(`adventure.${type}.accentWord`);
  const label = t(`explorer.${type}.label`);
  const accentIndex = title.toLowerCase().indexOf(accentWord.toLowerCase());
  const titleBefore = accentIndex >= 0 ? title.slice(0, accentIndex) : title;
  const titleAccent = accentIndex >= 0 ? title.slice(accentIndex, accentIndex + accentWord.length) : '';
  const titleAfter = accentIndex >= 0 ? title.slice(accentIndex + accentWord.length) : '';

  return (
    <div className="adventure-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="adventure-popup-title">
      <div className="adventure-popup-card" style={{ '--adventure-accent': popup.accent }}>
        <div className="adventure-popup-pattern adventure-popup-pattern-top" aria-hidden="true" />
        <button type="button" onClick={onClose} className="adventure-popup-close" aria-label="Close adventure intro">
          <X size={18} />
        </button>

        <div className="adventure-popup-inner">
          <div className="adventure-popup-image">
            <img src={popup.image} alt={`${label} adventure`} />
          </div>

          <div className="adventure-popup-content">
            <div className="adventure-popup-icon">
              <Icon size={30} />
            </div>
            <h2 id="adventure-popup-title">
              {titleBefore}
              {titleAccent && <span>{titleAccent}</span>}
              {titleAfter}
            </h2>
            <p>{description}</p>

            <div className="adventure-popup-actions">
              <button type="button" onClick={onConfirm} className="adventure-popup-primary">
                {confirmText}
              </button>
              <button type="button" onClick={onClose} className="adventure-popup-secondary">
                {t('adventure.maybeLater')}
              </button>
            </div>
          </div>
        </div>
        <div className="adventure-popup-pattern adventure-popup-pattern-bottom" aria-hidden="true" />
      </div>
    </div>
  );
}

function ExplorerPickerModal({ onSave }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/explorer-type', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ explorerType: selected }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save explorer type');
      }
      onSave(selected);
    } catch (err) {
      setError(err.name === 'AbortError'
        ? 'Saving took too long. Please check the backend and try again.'
        : err.message || 'Failed to save explorer type');
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(44,26,20,0.35)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(253,251,247,0.92)', border: '1px solid rgba(234,219,200,0.6)', fontFamily: 'Poppins, sans-serif' }}>
        <div className="px-8 pt-10 pb-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#8D493A' }}>{t('explorerPicker.kicker')}</p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2C1A14' }}>{t('explorerPicker.title')}</h1>
          <p className="text-xs" style={{ color: '#6F5B55' }}>{t('explorerPicker.subtitle')}</p>
        </div>
        <div className="px-6 py-6 space-y-3">
          {EXPLORER_TYPES.map(type => {
            const isSel = selected === type.id;
            return (
              <button key={type.id} type="button" onClick={() => setSelected(type.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all"
                style={{ background: isSel ? 'rgba(141,73,58,0.10)' : 'rgba(255,255,255,0.5)', border: isSel ? '2px solid #8D493A' : '1px solid rgba(234,219,200,0.8)' }}>
                <ExplorerTypeImage type={type.id} label={type.label} selected={isSel} size={42} />
                <span className="flex-1">
                  <span className="block text-sm font-bold" style={{ color: '#2C1A14' }}>{t(`explorer.${type.id}.label`)}</span>
                  <span className="block text-xs" style={{ color: '#6F5B55' }}>{t(`explorer.${type.id}.tagline`)}</span>
                </span>
                <span className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ border: `2px solid ${isSel ? '#8D493A' : '#D9C6BC'}`, background: isSel ? '#8D493A' : 'transparent' }} />
              </button>
            );
          })}
        </div>
        <div className="px-8 pb-8 pt-2">
          {error && (
            <div className="mb-3 rounded-lg px-3 py-2 text-xs font-medium"
              style={{ background: 'rgba(185, 28, 28, 0.08)', color: '#991B1B', border: '1px solid rgba(185, 28, 28, 0.18)' }}>
              {error}
            </div>
          )}
          <button type="button" disabled={!selected || saving} onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: '#8D493A', color: '#fff' }}>
            {saving ? t('common.saving') : t('explorerPicker.start')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Maps explorer type (from signup) → heritage category in DB
const EXPLORER_CATEGORY = {
  'warrior':         'warrior',
  'nature-lover':    'nature',
  'royal-historian': 'royal',
  'folktale-hunter': 'folklore',
  'music-explorer':  'music',
};

export default function Home() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    xp,
    level,
    streak,
    bestStreak,
    leaderboard,
    getNextLevelData,
    awardXP,
  } = useGamificationContext();

  const explorerType = user?.explorerType || user?.explorer_type;
  const [localExplorerType, setLocalExplorerType] = useState(explorerType);
  const [showPicker, setShowPicker] = useState(false);
  const [showAdventurePopup, setShowAdventurePopup] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [awardedDashboardItems, setAwardedDashboardItems] = useState(new Set());

  // Show picker after 500ms if user has no explorer type
  useEffect(() => {
    if (!explorerType) {
      const t = setTimeout(() => setShowPicker(true), 500);
      return () => clearTimeout(t);
    }
  }, [explorerType]);

  const handlePickerSave = (type) => {
    setLocalExplorerType(type);
    setShowPicker(false);
    updateUser({ explorerType: type });
    setShowAdventurePopup(true);
  };

  const activeExplorerType = localExplorerType || explorerType;
  const category = EXPLORER_CATEGORY[activeExplorerType] || 'general';

  useEffect(() => {
    if (!activeExplorerType || showPicker) return;

    const popupKey = `adventure-popup-seen:${user?.id || user?.email || 'guest'}:${activeExplorerType}`;
    if (!sessionStorage.getItem(popupKey)) {
      const timer = setTimeout(() => setShowAdventurePopup(true), 650);
      return () => clearTimeout(timer);
    }
  }, [activeExplorerType, showPicker, user?.id, user?.email]);

  const closeAdventurePopup = () => {
    if (activeExplorerType) {
      const popupKey = `adventure-popup-seen:${user?.id || user?.email || 'guest'}:${activeExplorerType}`;
      sessionStorage.setItem(popupKey, 'true');
    }
    setShowAdventurePopup(false);
  };

  const confirmAdventurePopup = () => {
    const route = ADVENTURE_POPUPS[activeExplorerType]?.route || '/explore';
    closeAdventurePopup();
    navigate(route);
  };

  // Fetch the highlight card for this user's adventure type
  const [highlight, setHighlight] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/heritage?category=${category}`)
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || [];
        if (items.length > 0) setHighlight(items[0]);
      })
      .catch(() => {});
  }, [category]);

  // ── All original hardcoded content below ──────────────────

  const exploreItems = [
    { title: 'Intore Culture', category: 'Royal', xp: 25, meta: 'History • 12 mins left', image: intoreImage },
    { title: 'Kigeli IV Rwabugiri', category: 'Legends', xp: 30, meta: 'Linkage • New Activity', image: kigeliImage },
    { title: 'Traditional Music', category: 'Audio', xp: 20, meta: 'Audio • 4 Stories', image: inangaImage },
    { title: 'Ubudehe', category: 'Values', xp: 15, meta: 'Values • Updated', image: ubudeheImage },
  ];

  const recentItems = [
    { icon: <Music    size={16} />, type: 'audio', title: 'Oral History – Nyamasheke',    date: 'Audio • 12 May 2025'    },
    { icon: <Video    size={16} />, type: 'video', title: 'Traditional Dance – Intore',   date: 'Video • 10 May 2025'    },
    { icon: <FileText size={16} />, type: 'doc',   title: 'Document – 1962 Letter',       date: 'Document • 8 May 2025'  },
  ];

  const activityItems = [
    { label: 'Viewed: The Royal Palace – Nyanza', time: '16 May 2025' },
    { label: 'Saved: Intore Dance',               time: '15 May 2025' },
    { label: 'Listened: Byivugo by Intore',       time: '16 May 2025' },
  ];

  const upcomingDays = [
    { day: '21', month: 'MAY', title: 'Cultural Diversity Day',       sub: 'Dialogue and Development • 21 May 2025'          },
    { day: '23', month: 'JUN', title: "International Widows' Day",    sub: 'Community Support & History • 23 June 2025'      },
    { day: '09', month: 'AUG', title: 'Day of Indigenous Peoples',    sub: 'Global Heritage Preservation • 9 August 2025'    },
  ];

  const quickActions = [
    { icon: <Headphones size={16} />, label: t('home.listen')         },
    { icon: <Plus       size={16} />, label: t('home.contribute')     },
    { icon: <Search     size={16} />, label: t('home.advancedSearch') },
  ];

  const explorerGreetings = {
    'warrior':         { prefix: 'Ready for battle,' },
    'nature-lover':    { prefix: 'Welcome back to the wild,' },
    'royal-historian': { prefix: 'The court awaits,' },
    'folktale-hunter': { prefix: 'The legend continues,' },
    'music-explorer':  { prefix: 'The rhythm calls you,' },
  };

  const greeting   = explorerGreetings[activeExplorerType];
  const activeExplorer = EXPLORER_TYPES.find(type => type.id === activeExplorerType);
  const firstName  = user?.name?.split(' ')[0] || 'Explorer';

  const welcomeHeading = greeting
    ? `${greeting.prefix} ${firstName}`
    : `Welcome back, ${firstName}`;

  const welcomeSub = greeting
    ? `Your ${activeExplorerType.replace(/-/g, ' ')} journey awaits.`
    : t('home.subtitle');

  const handleExploreNow    = () => navigate('/explore');
  const handleExploreKwibuka = () => navigate('/kwibuka');
  const handleViewAllStories = () => navigate('/explore');
  const handleViewAllRecent = () => navigate('/history');
  const handleViewAllCalendar = () => navigate('/intl-days');

  const storyBodies = {
    'Intore Culture': 'The Intore tradition preserves stories of discipline, courage, rhythm, and ceremonial movement passed through generations.',
    'Kigeli IV Rwabugiri': 'Kigeli IV Rwabugiri shaped Rwanda through expansion, court life, diplomacy, and powerful oral histories still studied today.',
    'Traditional Music': 'Traditional music carries memory through instruments, praise poetry, songs, and communal performance.',
    Ubudehe: 'Ubudehe reflects shared work, mutual responsibility, and the community values that organize daily life.',
    'Cultural Diversity Day': 'A day for recognizing cultural expression, dialogue, and the need to preserve living heritage.',
    "International Widows' Day": 'A day focused on community care, dignity, and remembering women whose stories are often missing from archives.',
    'Day of Indigenous Peoples': 'A global reminder that language, land, memory, and cultural knowledge need active protection.',
  };

  const routeForExploreItem = (index) => ['/explore', '/collections', '/listen', '/collections'][index] || '/explore';
  const routeForRecentItem = (type) => ({ audio: '/listen', video: '/videos', doc: '/history' }[type] || '/history');
  const routeForQuickAction = (index) => ['/listen', '/contribute', '/explore'][index] || '/explore';

  const openDashboardStory = async (item, reason = 'dashboard-story') => {
    const title = item.title || item.label;
    setActiveStory({
      ...item,
      title,
      body: storyBodies[title] || item.body || 'This heritage note is ready to explore in the archive.',
    });
    const key = `${reason}:${title}`;
    if (!awardedDashboardItems.has(key)) {
      await awardXP(10, `Read dashboard item: ${title}`);
      setAwardedDashboardItems(prev => new Set([...prev, key]));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: highlight?.title || t('home.highlight.title'),
          text:  highlight?.description || t('home.highlight.desc'),
          url:   window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Highlight image: use DB url if available, else fallback to local nyanza
  const highlightSrc = highlight?.image_url || nyanzeImage;
  const highlightTitle = highlight?.title || t('home.highlight.title');
  const highlightDesc  = highlight?.description || t('home.highlight.desc');

  return (
    <>
      {showPicker && <ExplorerPickerModal onSave={handlePickerSave} />}
      <AdventurePopup
        type={activeExplorerType}
        isOpen={showAdventurePopup && !showPicker}
        onClose={closeAdventurePopup}
        onConfirm={confirmAdventurePopup}
      />
      <Layout searchPlaceholder="search.placeholder">
      <div className="home-header">
        <h1>
          {welcomeHeading}
          {activeExplorer && (
            <ExplorerTypeImage
              type={activeExplorer.id}
              label={activeExplorer.label}
              size={34}
              style={{ marginLeft: 10, verticalAlign: 'middle' }}
            />
          )}
        </h1>
        <p>{welcomeSub}</p>
      </div>

      <div style={{ width: '100%' }}>
          <div className="highlight-card">
            <span className="highlight-badge">{t('home.todayHighlight')}</span>
            <div className="highlight-image">
              <img
                src={highlightSrc}
                alt={highlightTitle}
                className="highlight-img"
                onError={e => { e.target.src = nyanzeImage; }}
              />
            </div>
            <div className="highlight-content">
              <div>
                <h2>{highlightTitle}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{highlightDesc}</p>
              </div>
              <div className="highlight-actions">
                <button className="btn-primary" onClick={handleExploreNow}>
                  {t('home.exploreNow')}
                </button>
                <button className="btn-outline" onClick={handleShare}>
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
            <button type="button" className="section-link link-button" onClick={handleViewAllStories}>{t('home.viewAll')}</button>
          </div>

          <div className="explore-cards">
            {exploreItems.map((item, i) => (
              <div key={i} className="explore-thumb" role="button" tabIndex={0}
                onClick={() => openDashboardStory({ ...item, route: routeForExploreItem(i) }, 'continue')}
                onKeyDown={(e) => { if (e.key === 'Enter') openDashboardStory({ ...item, route: routeForExploreItem(i) }, 'continue'); }}>
                <div className="explore-thumb-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="explore-thumb-top">
                  <span className="explore-thumb-category">{item.category}</span>
                  <span className="explore-thumb-xp">+{item.xp} XP</span>
                </div>
                <div className="explore-thumb-label">{item.title}</div>
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
            {["Ubwiru", "Amateka y'u Rwanda", "Ingoma", "Abami b'u Rwanda", "Indangagaciro", "Uburego"].map((topic, i) => (
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
                <button className="kwibuka-btn" onClick={handleExploreKwibuka}>{t('home.exploreKwibuka')}</button>
              </div>
            </div>

            <div className="recent-list">
              <div className="section-header" style={{ marginTop: 0 }}>
                <span className="section-title">{t('home.recentlyAdded')}</span>
                <button type="button" className="section-link link-button" onClick={handleViewAllRecent}>{t('home.viewAll')}</button>
              </div>
              {recentItems.map((item, i) => (
                <div key={i} className="recent-item" role="button" tabIndex={0}
                  onClick={() => openDashboardStory({ ...item, route: routeForRecentItem(item.type) }, 'recent')}
                  onKeyDown={(e) => { if (e.key === 'Enter') openDashboardStory({ ...item, route: routeForRecentItem(item.type) }, 'recent'); }}>
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

        <div className="home-footer">
          <div className="home-footer-quote">
            <p className="home-footer-quote-text">{t('home.quoteText')}</p>
            <p className="home-footer-quote-sub">{t('home.quoteSub')}</p>
          </div>
        </div>

    </Layout>
    {activeStory && (
      <div className="story-reader-backdrop" onClick={() => setActiveStory(null)}>
        <div className="story-reader" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="story-reader-close" onClick={() => setActiveStory(null)}>×</button>
          {activeStory.image && <img src={activeStory.image} alt={activeStory.title} className="story-reader-img" />}
          <div className="story-reader-body">
            <span className="story-reader-meta">{activeStory.meta || activeStory.date || activeStory.sub}</span>
            <h2>{activeStory.title}</h2>
            <p>{activeStory.body}</p>
            <div className="story-reader-actions">
              <button type="button" className="btn-primary" onClick={() => setActiveStory(null)}>Done Reading</button>
              <button type="button" className="btn-outline" onClick={() => navigate(activeStory.route || '/explore')}>Open Full Page</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
