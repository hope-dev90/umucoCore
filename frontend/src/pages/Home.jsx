import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import commonsImagesCached from '../data/commonsImageCache.json';
import { ArrowRight, Share2, Headphones, Plus, Search, Music, Video, FileText } from 'lucide-react';
import ExplorerTypeImage from '../components/ExplorerTypeImage';
import { getHighlightForCategory, ALL_STORIES } from '../data/stories';
import { DashboardStoryView } from '../components/Gamification/DashboardStoryView';
import { UmucoGlyph } from '../components/UmucoGlyphs';
import { trackView } from '../utils/trackView';

const EXPLORER_TYPES = [
  { id: 'warrior',         label: 'Warrior',          tagline: 'Battles, legends & brave deeds'   },
  { id: 'nature-lover',    label: 'Nature Lover',      tagline: 'Forests, hills & wild places'     },
  { id: 'royal-historian', label: 'Royal Historian',   tagline: 'Kings, courts & old dynasties'    },
  { id: 'folktale-hunter', label: 'Folktale Hunter',   tagline: 'Myths, proverbs & fireside tales' },
  { id: 'music-explorer',  label: 'Music Explorer',    tagline: 'Rhythms, songs & instruments'     },
];

function ExplorerPickerModal({ onSave }) {
  const { t } = useLanguage();
  const { getToken } = useAuth();
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
      const token = getToken();
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
  const { user, updateUser, getToken } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [topbarSearch, setTopbarSearch] = useState("");
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
  const [activeStory, setActiveStory] = useState(null);
  const [awardedDashboardItems, setAwardedDashboardItems] = useState(new Set());
  const location = useLocation();

  useEffect(() => {
    // Handle Continue Reading
    if (location.state?.continueStoryId) {
      const targetStory = ALL_STORIES.find(s => s.id === location.state.continueStoryId);
      if (targetStory) {
        // Clear the state so it doesn't reopen on refresh
        window.history.replaceState({}, document.title);
        setTimeout(() => {
          openDashboardStory(targetStory, 'continue-reading');
        }, 800);
      }
    }
  }, [location.state]);

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
  };

  const activeExplorerType = localExplorerType || explorerType;
  const category = EXPLORER_CATEGORY[activeExplorerType] || 'general';

  // Fetch the highlight card for this user's adventure type.
  // Backend endpoint (/api/heritage) doesn't exist yet, so this falls back to
  // one of our locally-written stories matched to the same category — the
  // dashboard stays personalized today, and will switch over to real backend
  // data automatically the moment that endpoint is live, since a successful
  // fetch with real items always takes priority below.
  const [highlight, setHighlight] = useState(null);
  const [audioHighlight, setAudioHighlight] = useState(null);

  useEffect(() => {
    const localFallback = getHighlightForCategory(category);
    const localHighlight = {
      title: localFallback.title,
      description: localFallback.desc,
      image_url: localFallback.image,
      storyId: localFallback.id,
    };
    // Show the local story immediately so the dashboard is never blank
    // while the (currently nonexistent) backend request resolves.
    setHighlight(localHighlight);

    fetch(`http://localhost:5000/api/heritage?category=${category}`)
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || [];
        if (items.length > 0) setHighlight(items[0]);
        // If the backend responds but has nothing for this category yet,
        // the local fallback set above stays in place.
      })
      .catch(() => {
        // Backend not running / not built yet — local fallback already set above.
      });
  }, [category]);

  // For music explorers, fetch a featured audio track for the highlight
  useEffect(() => {
    if (activeExplorerType !== 'music-explorer') return;
    fetch('http://localhost:5000/api/audio/featured')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || [];
        if (items.length > 0) {
          // pick a random one each visit
          const pick = items[Math.floor(Math.random() * items.length)];
          setAudioHighlight(pick);
        }
      })
      .catch(() => {});
  }, [activeExplorerType]);

  // ── All original hardcoded content below ──────────────────────────────────

  // Each item is tagged with the explorer type(s) it's most relevant to.
  // Adjust these tags to match your content taxonomy as needed.
  const exploreItems = [
    {
      title: 'Intore Culture', category: 'Royal', xp: 25,
      meta: 'History • 12 mins left', 
      image: commonsImagesCached['Intore – Umubyino w\'Ubutwari'] || commonsImagesCached['Intore Warriors – The Dance of Courage'],
      route: '/explore',
      explorerTypes: ['warrior', 'royal-historian'],
    },
    {
      title: 'Kigeli IV Rwabugiri', category: 'Legends', xp: 30,
      meta: 'Linkage • New Activity', 
      image: commonsImagesCached['Kigeli IV Rwabugiri – Umwami w\'Intwari'] || commonsImagesCached['Kigeli IV Rwabugiri – The Warrior King'],
      route: '/collections',
      explorerTypes: ['warrior', 'royal-historian'],
    },
    {
      title: 'Traditional Music', category: 'Audio', xp: 20,
      meta: 'Audio • 4 Stories', 
      image: commonsImagesCached['Inanga – Umutima w\'Umuziki Nyarwanda'] || commonsImagesCached['Inanga – The Soul of Rwandan Music'] || commonsImagesCached['Inanga – The Rwandan Trough Zither'],
      route: '/listen',
      explorerTypes: ['music-explorer'],
    },
    {
      title: 'Ubudehe', category: 'Values', xp: 15,
      meta: 'Values • Updated', 
      image: commonsImagesCached['Ubudehe – Ubufatanye bw\'Abaturage'] || commonsImagesCached['Ubudehe – Community Solidarity'],
      route: '/collections',
      explorerTypes: ['nature-lover', 'folktale-hunter'],
    },
  ];

  // Sort so items matching the user's active explorer type float to the
  // top; ties keep their original relative order (stable sort).
  const sortedExploreItems = [...exploreItems].sort((a, b) => {
    const aMatch = a.explorerTypes.includes(activeExplorerType) ? 0 : 1;
    const bMatch = b.explorerTypes.includes(activeExplorerType) ? 0 : 1;
    return aMatch - bMatch;
  });

  const filteredSortedExploreItems = sortedExploreItems.filter(item => {
    const query = topbarSearch.toLowerCase();
    return item.title.toLowerCase().includes(query) || 
           item.category.toLowerCase().includes(query) ||
           item.meta.toLowerCase().includes(query);
  });

  const [recentItems, setRecentItems] = useState([]);

  // Fetch real recent views from history API
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;
    fetch('http://localhost:5000/api/history?limit=5', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const TYPE_ICON_MAP = { Audio: <Music size={16} />, Video: <Video size={16} />, Article: <FileText size={16} />, Place: <FileText size={16} /> };
          setRecentItems(data.items.slice(0, 5).map(item => ({
            icon: TYPE_ICON_MAP[item.type] || <FileText size={16} />,
            type: item.type === 'Audio' ? 'audio' : item.type === 'Video' ? 'video' : 'doc',
            title: item.title,
            date: new Date(item.viewedAt).toLocaleDateString(),
            image: item.image || '',
            category: item.category || item.type,
            id: item.itemId,
          })));
        }
      })
      .catch(() => {});
  }, [user]);

  const activityItems = [
    { label: t('dashboard.activity.viewedPalace'), time: t('dashboard.activity.dateMay16') },
    { label: t('dashboard.activity.savedIntore'),  time: t('dashboard.activity.dateMay15') },
    { label: t('dashboard.activity.listened'),     time: t('dashboard.activity.dateMay16') },
  ];

  const upcomingDays = [
    { day: '21', month: t('dashboard.monthMay'), title: t('dashboard.calendar.diversity'),  sub: t('dashboard.calendar.diversitySub') },
    { day: '23', month: t('dashboard.monthJun'), title: t('dashboard.calendar.widows'),     sub: t('dashboard.calendar.widowsSub') },
    { day: '09', month: t('dashboard.monthAug'), title: t('dashboard.calendar.indigenous'), sub: t('dashboard.calendar.indigenousSub') },
  ];
  const quickActions = [
    { icon: <Headphones size={16} />, label: t('home.listen')         },
    { icon: <Plus       size={16} />, label: t('home.contribute')     },
    { icon: <Search     size={16} />, label: t('home.advancedSearch') },
  ];

  const explorerGreetings = {
    'warrior':         { prefix: t('dashboard.greeting.warrior') },
    'nature-lover':    { prefix: t('dashboard.greeting.nature') },
    'royal-historian': { prefix: t('dashboard.greeting.royal') },
    'folktale-hunter': { prefix: t('dashboard.greeting.folktale') },
    'music-explorer':  { prefix: t('dashboard.greeting.music') },
  };

  const greeting   = explorerGreetings[activeExplorerType];
  const activeExplorer = EXPLORER_TYPES.find(type => type.id === activeExplorerType);
  const firstName  = user?.name?.split(' ')[0] || 'Explorer';

  const welcomeHeading = greeting
    ? `${greeting.prefix} ${firstName}`
    : `${t('dashboard.greeting.default')} ${firstName}`;

  const welcomeSub = greeting
    ? t('dashboard.explorerJourneyAwaits').replace('{type}', t(`explorer.${activeExplorerType}.label`))
    : t('home.subtitle');

  const questTiles = [
    {
      icon: 'medal',
      label: t('dashboard.level'),
      value: `${t('gamification.levelShort')} ${level || 1}`,
    },
    {
      icon: 'trail',
      label: t('dashboard.dailyStreak'),
      value: t('dashboard.daysValue').replace('{days}', streak || 0),
    },
    {
      icon: 'quest',
      label: t('dashboard.storyQuest'),
      value: t('dashboard.talesValue').replace('{count}', ALL_STORIES.length),
    },
  ];

  const handleExploreNow = () => {
    if (highlight?.storyId) {
      const fullStory = ALL_STORIES.find((s) => s.id === highlight.storyId);
      if (fullStory) {
        openDashboardStory(fullStory, 'highlight');
        return;
      }
    }
    navigate('/explore');
  };
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

  const routeForRecentItem = (type) => ({ audio: '/listen', video: '/videos', doc: '/history' }[type] || '/history');
  const routeForQuickAction = (index) => ['/listen', '/contribute', '/explore'][index] || '/explore';
  const topicStoryForIndex = (index) => ALL_STORIES[index % ALL_STORIES.length];

  const openDashboardStory = async (item, reason = 'dashboard-story') => {
    const title = item.title || item.label;
    setActiveStory({
      ...item,
      title,
      content: item.content || storyBodies[title] || item.body || 'This heritage note is ready to explore in the archive.',
      category: item.category || 'Discovery',
    });
    // Track every view — topic chip, explore card, recent item, etc.
    trackView({
      type: item.isAudio ? 'Audio' : 'Article',
      itemId: item.id,
      title,
      image: item.image_url || item.image || '',
      category: item.category || reason,
      token: getToken(),
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
        alert(t('dashboard.linkCopied'));
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Highlight image: use DB url if available, else fallback to Commons image
  const highlightSrc = highlight?.image_url || commonsImagesCached['Ingoro y\'Ubwami ya Nyanza'] || commonsImagesCached['The Royal Palace of Nyanza'];
  const highlightTitle = highlight?.title || t('home.highlight.title');
  const highlightDesc  = highlight?.description || t('home.highlight.desc');

  return (
    <>
      {showPicker && <ExplorerPickerModal onSave={handlePickerSave} />}
      {activeStory ? (
        <DashboardStoryView
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onComplete={() => console.log('Story completed')}
        />
      ) : (
       <Layout searchPlaceholder={t('search.placeholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
       <div className="home-shell">
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

          <div className="dashboard-quest-strip" aria-label={t('dashboard.questOverview')}>
            {questTiles.map((tile) => (
              <div key={tile.label} className="dashboard-quest-tile">
                <UmucoGlyph type={tile.icon} size={34} />
                <div>
                  <span>{tile.label}</span>
                  <strong>{tile.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="highlight-card">
            <span className="highlight-badge">{t('home.todayHighlight')}</span>
            <div className="highlight-image">
              <img
                src={audioHighlight ? (audioHighlight.thumbnail_url || highlightSrc) : highlightSrc}
                alt={audioHighlight ? audioHighlight.title : highlightTitle}
                className="highlight-img"
                onError={e => { e.target.src = nyanzeImage; }}
              />
            </div>
            <div className="highlight-content">
              <div>
                <h2>{audioHighlight ? audioHighlight.title : highlightTitle}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {audioHighlight ? audioHighlight.description : highlightDesc}
                </p>
                {audioHighlight?.audio_url && (
                  <audio
                    controls
                    style={{ width: '100%', marginTop: 12, borderRadius: 8 }}
                    aria-label={`Play ${audioHighlight.title}`}
                  >
                    <source src={audioHighlight.audio_url} />
                    Your browser does not support audio playback.
                  </audio>
                )}
              </div>
              <div className="highlight-actions">
                <button className="btn-primary" onClick={() => navigate('/explore')}>
                  {t('home.exploreNow')}
                </button>
                <button className="btn-outline" onClick={handleShare}>
                  <Share2 size={14} />
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
            {filteredSortedExploreItems.map((item) => (
              <div key={item.title} className="explore-thumb" role="button" tabIndex={0}
                onClick={() => openDashboardStory(item, 'continue')}
                onKeyDown={(e) => { if (e.key === 'Enter') openDashboardStory(item, 'continue'); }}>
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
            {[t('dashboard.topic.ubwiru'), t('dashboard.topic.history'), t('dashboard.topic.drum'), t('dashboard.topic.kings'), t('dashboard.topic.values'), t('dashboard.topic.uburego')].map((topic, i) => (
              <button
                type="button"
                key={topic}
                className="topic-chip"
                onClick={() => openDashboardStory({ ...topicStoryForIndex(i), title: topicStoryForIndex(i).title }, `topic:${topic}`)}
              >
                {topic}
              </button>
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
                <button
                  type="button"
                  key={i}
                  className="activity-item"
                  onClick={() => openDashboardStory({ ...item, title: item.label, category: 'Activity' }, 'activity')}
                >
                  <div className="activity-dot" />
                  <div className="activity-info">
                    <h4>{item.label}</h4>
                    <p>{item.time}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        <div className="home-footer">
          <div className="home-footer-quote">
            <p className="home-footer-quote-text">{t('home.quoteText')}</p>
            <p className="home-footer-quote-sub">{t('home.quoteSub')}</p>
          </div>
        </div>
      </div>

    </Layout>
      )}
    </>
  );
}
