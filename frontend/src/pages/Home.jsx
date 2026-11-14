import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import './Dashboard.css';
import commonsImagesCached from '../data/commonsImageCache.json';
import { ArrowRight, ArrowUpRight, Award, BookOpen, Share2, Play, Plus, Quote, Music, Video, FileText } from 'lucide-react';
import proverbsData from '../data/proverbs.json';
import ExplorerTypeImage from '../components/ExplorerTypeImage';
import { getHighlightForCategory, ALL_STORIES } from '../data/stories';
import { DashboardStoryView } from '../components/Gamification/DashboardStoryView';
import { UmucoGlyph } from '../components/UmucoGlyphs';
import { trackView } from '../utils/trackView';
import { apiUrl } from '../config/api';

const EXPLORER_TYPES = [
  { id: 'warrior',         labelKey: 'explorer.warrior.label',         taglineKey: 'explorer.warrior.tagline'   },
  { id: 'nature-lover',    labelKey: 'explorer.nature-lover.label',    taglineKey: 'explorer.nature-lover.tagline'     },
  { id: 'royal-historian', labelKey: 'explorer.royal-historian.label', taglineKey: 'explorer.royal-historian.tagline'    },
  { id: 'folktale-hunter', labelKey: 'explorer.folktale-hunter.label', taglineKey: 'explorer.folktale-hunter.tagline' },
  { id: 'music-explorer',  labelKey: 'explorer.music-explorer.label',  taglineKey: 'explorer.music-explorer.tagline'     },
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
      const response = await fetch(apiUrl('/api/users/explorer-type'), {
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
  const { t, language } = useLanguage();
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

    fetch(apiUrl(`/api/heritage?category=${category}`))
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
    fetch(apiUrl('/api/audio/featured'))
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
      titleKey: 'home.explore.intore',
      titleFallback: 'Intore Culture',
      categoryKey: 'explore.card1.category',
      categoryFallback: 'Royal',
      xp: 25,
      metaKey: 'home.explore.intoreMeta',
      metaFallback: 'History • 12 mins left',
      image: commonsImagesCached['Intore – Umubyino w\'Ubutwari'] || commonsImagesCached['Intore Warriors – The Dance of Courage'],
      route: '/explore',
      explorerTypes: ['warrior', 'royal-historian'],
    },
    {
      titleKey: 'home.explore.kigeli',
      titleFallback: 'Kigeli IV Rwabugiri',
      categoryKey: 'explore.card5.category',
      categoryFallback: 'Legends',
      xp: 30,
      metaKey: 'home.explore.kigeliMeta',
      metaFallback: 'Linkage • New Activity',
      image: commonsImagesCached['Kigeli IV Rwabugiri – Umwami w\'Intwari'] || commonsImagesCached['Kigeli IV Rwabugiri – The Warrior King'],
      route: '/collections',
      explorerTypes: ['warrior', 'royal-historian'],
    },
    {
      titleKey: 'home.explore.music',
      titleFallback: 'Traditional Music',
      categoryKey: 'explore.card3.category',
      categoryFallback: 'Audio',
      xp: 20,
      metaKey: 'home.explore.musicMeta',
      metaFallback: 'Audio • 4 Stories',
      image: commonsImagesCached['Inanga – Umutima w\'Umuziki Nyarwanda'] || commonsImagesCached['Inanga – The Soul of Rwandan Music'] || commonsImagesCached['Inanga – The Rwandan Trough Zither'],
      route: '/listen',
      explorerTypes: ['music-explorer'],
    },
    {
      titleKey: 'home.explore.ubudehe',
      titleFallback: 'Ubudehe',
      categoryKey: 'explore.card11.category',
      categoryFallback: 'Values',
      xp: 15,
      metaKey: 'home.explore.ubudeheMeta',
      metaFallback: 'Values • Updated',
      image: commonsImagesCached['Ubudehe – Ubufatanye bw\'Abaturage'] || commonsImagesCached['Ubudehe – Community Solidarity'],
      route: '/collections',
      explorerTypes: ['nature-lover', 'folktale-hunter'],
    },
  ];

  const translatedExploreItems = exploreItems.map(item => ({
    ...item,
    title: t(item.titleKey) || item.titleFallback,
    category: t(item.categoryKey) || item.categoryFallback,
    meta: t(item.metaKey) || item.metaFallback,
  }));

  // Sort so items matching the user's active explorer type float to the
  // top; ties keep their original relative order (stable sort).
  const sortedExploreItems = [...exploreItems].sort((a, b) => {
    const aMatch = a.explorerTypes.includes(activeExplorerType) ? 0 : 1;
    const bMatch = b.explorerTypes.includes(activeExplorerType) ? 0 : 1;
    return aMatch - bMatch;
  });

  const filteredSortedExploreItems = translatedExploreItems.filter(item => {
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
    fetch(apiUrl('/api/history?limit=5'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const TYPE_ICON_MAP = { Audio: <Music size={16} />, Video: <Video size={16} />, Article: <FileText size={16} />, Place: <FileText size={16} /> };
          setRecentItems(data.items.slice(0, 5).map(item => ({
            icon: TYPE_ICON_MAP[item.type] || <FileText size={16} />,
            type: item.type === 'Audio' ? 'audio' : item.type === 'Video' ? 'video' : 'doc',
            title: typeof item.title === 'object' ? (item.title[language] || item.title.en || item.title.rw || '') : (item.title || ''),
            date: new Date(item.viewedAt).toLocaleDateString(),
            image: item.image || '',
            category: typeof item.category === 'object' ? (item.category[language] || item.category.en || '') : (item.category || item.type),
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

  const explorerGreetings = {
    'warrior':         { prefix: t('dashboard.greeting.warrior') },
    'nature-lover':    { prefix: t('dashboard.greeting.nature') },
    'royal-historian': { prefix: t('dashboard.greeting.royal') },
    'folktale-hunter': { prefix: t('dashboard.greeting.folktale') },
    'music-explorer':  { prefix: t('dashboard.greeting.music') },
  };

  const greeting   = explorerGreetings[activeExplorerType];
  const activeExplorer = EXPLORER_TYPES.find(type => type.id === activeExplorerType);
  const activeExplorerLabel = activeExplorer ? t(activeExplorer.labelKey) : '';
  const activeExplorerTagline = activeExplorer ? t(activeExplorer.taglineKey) : '';
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

  // API may return title/description as {en, rw, fr} objects — extract the right string
  const extractText = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val[language] || val.en || val.rw || val.fr || fallback;
    return fallback;
  };

  const highlightTitle = extractText(highlight?.title, t('home.highlight.title'));
  const highlightDesc  = extractText(highlight?.description, t('home.highlight.desc'));

  // ── Dashboard data for the Doomshield layout ───────────────────────────────
  const nextLevel = getNextLevelData ? getNextLevelData() : null;
  const nextLevelXP = nextLevel?.required_xp || Math.max(100, (level || 1) * 100);
  const xpPct = Math.max(0, Math.min(100, Math.round(((xp || 0) / nextLevelXP) * 100)));
  const xpToNext = Math.max(0, nextLevelXP - (xp || 0));
  const rankSegments = 7;
  const filledSegments = Math.round((xpPct / 100) * rankSegments);

  const proverbList = Array.isArray(proverbsData?.proverbs) ? proverbsData.proverbs : [];
  const dayIndex = Math.floor(Date.now() / 86400000);
  const proverb = proverbList.length ? proverbList[dayIndex % proverbList.length] : null;
  const proverbTranslation = proverb ? ((language === 'fr' && proverb.fr) ? proverb.fr : proverb.en) : '';

  const topLeaders = [...(leaderboard || [])]
    .sort((a, b) => (b.xp || b.total_xp || 0) - (a.xp || a.total_xp || 0))
    .slice(0, 5);
  const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

  const milestoneTarget = 7;
  const milestoneValue = Math.min(streak || 0, milestoneTarget);
  const milestonePct = Math.round((milestoneValue / milestoneTarget) * 100);

  const shareProverb = async () => {
    if (!proverb) return;
    const text = `"${proverb.rw}" — ${proverb.en}`;
    try {
      if (navigator.share) await navigator.share({ title: t('home.quoteOfDay'), text });
      else { await navigator.clipboard.writeText(text); alert(t('dashboard.linkCopied')); }
    } catch { /* user cancelled */ }
  };

  const highlightImage = audioHighlight ? (audioHighlight.thumbnail_url || highlightSrc) : highlightSrc;
  const highlightHeading = audioHighlight ? extractText(audioHighlight.title, highlightTitle) : highlightTitle;
  const highlightBody = audioHighlight ? extractText(audioHighlight.description, highlightDesc) : highlightDesc;

  return (
    <>
      {showPicker && <ExplorerPickerModal onSave={handlePickerSave} />}
      {activeStory ? (
        <DashboardStoryView
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onComplete={() => {}}
        />
      ) : (
        <Layout searchPlaceholder={t('ui.searchArchive')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
          <div className="dash">
            <div className="dash-main">
              {/* Stat cards */}
              <div className="dash-stats">
                <button type="button" className="dash-stat dash-stat--brand" onClick={() => navigate('/profile')}>
                  <span className="dash-stat-head">
                    <span>{t('home.archivalRank')}</span>
                    <span className="dash-stat-arrow"><ArrowUpRight size={14} /></span>
                  </span>
                  <strong className="dash-stat-level">{t('gamification.level')} {level || 1}</strong>
                  <span className="dash-rank-bar" aria-label={`${xpPct}%`}>
                    {Array.from({ length: rankSegments }).map((_, i) => (
                      <i key={i} className={i < filledSegments ? 'on' : ''} />
                    ))}
                  </span>
                </button>

                <button type="button" className="dash-stat" onClick={() => navigate('/history')}>
                  <span className="dash-stat-head">
                    <span>{t('dashboard.dailyStreak')}</span>
                    <span className="dash-stat-arrow"><ArrowUpRight size={14} /></span>
                  </span>
                  <strong className="dash-stat-value">{streak || 0}</strong>
                  <span className="dash-stat-sub">{t('home.bestStreak', { days: bestStreak || 0 })}</span>
                </button>

                <button type="button" className="dash-stat" onClick={() => navigate('/explore')}>
                  <span className="dash-stat-head">
                    <span>{t('home.activeQuests')}</span>
                    <span className="dash-stat-arrow"><ArrowUpRight size={14} /></span>
                  </span>
                  <strong className="dash-stat-value">{ALL_STORIES.length}</strong>
                  <span className="dash-stat-sub">{t('home.storiesReady')}</span>
                </button>
              </div>

              {/* Highlights */}
              <div className="dash-section-head">
                <span>{t('home.highlights')}</span>
                <button type="button" onClick={handleViewAllStories}>{t('home.viewArchive')} <ArrowRight size={12} /></button>
              </div>
              <article className="dash-highlight">
                <div className="dash-highlight-media">
                  <img src={highlightImage} alt={highlightHeading} />
                  <span className="dash-tag dash-tag--dark">{t('home.oralHeritage')}</span>
                </div>
                <div className="dash-highlight-body">
                  <span className="dash-kicker">{t('home.storyOfDay')}</span>
                  <h2>{highlightHeading}</h2>
                  <p>{highlightBody}</p>
                  {audioHighlight?.audio_url && (
                    <audio controls className="dash-highlight-audio">
                      <source src={audioHighlight.audio_url} />
                    </audio>
                  )}
                  <div className="dash-highlight-actions">
                    <button type="button" className="dash-btn" onClick={handleExploreNow}>
                      {t('home.listenCta')} <Play size={11} fill="currentColor" />
                    </button>
                    <button type="button" className="dash-icon-btn" onClick={handleShare} aria-label={t('home.share')}>
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="dash-diamonds" aria-hidden="true" />
              </article>

              {/* Discovery */}
              <div className="dash-section-head"><span>{t('home.discovery')}</span></div>
              <div className="dash-discovery">
                <article className="dash-compass">
                  <div className="dash-compass-bars" aria-hidden="true"><i /><i /><i /><i /></div>
                  <span className="dash-tag dash-tag--glass">{t('home.culturalCompass')}</span>
                  <h3>{t('home.knowRwandanCulture')}</h3>
                  <p>{t('home.compassDesc')}</p>
                  <div className="dash-compass-foot">
                    <span>{t('home.curatedJourneys')}</span>
                    <button type="button" className="dash-btn dash-btn--light" onClick={() => navigate('/explore')}>
                      {t('sidebar.explore')} <ArrowRight size={12} />
                    </button>
                  </div>
                </article>

                <article className="dash-quote">
                  <span className="dash-quote-mark" aria-hidden="true">99</span>
                  <span className="dash-kicker"><Quote size={11} /> {t('home.quoteOfDay')}</span>
                  {proverb ? (
                    <>
                      <h3>&ldquo;{proverb.rw}&rdquo;</h3>
                      <p>{proverbTranslation}{proverb.meaning ? ` ${proverb.meaning}` : ''}</p>
                    </>
                  ) : (
                    <h3>{t('home.quoteText')}</h3>
                  )}
                  <div className="dash-quote-foot">
                    <span>{t('home.kinyarwandaProverb')}</span>
                    <button type="button" onClick={shareProverb}><Share2 size={12} /> {t('home.share')}</button>
                  </div>
                </article>
              </div>

              {/* Actions */}
              <div className="dash-section-head"><span>{t('home.actions')}</span></div>
              <div className="dash-actions">
                <button type="button" className="dash-action" onClick={() => navigate('/contribute')}>
                  <span className="dash-action-icon dash-action-icon--pink"><Plus size={16} /></span>
                  <span>
                    <strong>{t('sidebar.contribute')} <ArrowRight size={12} /></strong>
                    <small>{t('home.contributeDesc')}</small>
                  </span>
                </button>
                <button type="button" className="dash-action" onClick={() => navigate('/library')}>
                  <span className="dash-action-icon dash-action-icon--green"><BookOpen size={16} /></span>
                  <span>
                    <strong>{t('ui.library')} <ArrowRight size={12} /></strong>
                    <small>{t('home.libraryDesc')}</small>
                  </span>
                </button>
              </div>
            </div>

            {/* Right rail */}
            <aside className="dash-rail">
              <section className="dash-card dash-xp">
                <span className="dash-xp-title">{t('home.xpProgress')}</span>
                <div className="dash-xp-count"><strong>{xp || 0}</strong> / {nextLevelXP} XP</div>
                <div className="dash-xp-track"><span style={{ width: `${xpPct}%` }} /></div>
                <p>{t('home.xpToNext', { xp: xpToNext, name: nextLevel?.name || `${t('gamification.level')} ${(level || 1) + 1}` })}</p>
              </section>

              <div className="dash-section-head dash-section-head--rail">
                <span>{t('gamification.leaderboard')}</span>
                <small>{t('home.thisWeek')}</small>
              </div>
              <section className="dash-card dash-leaders">
                {topLeaders.length === 0 && <p className="dash-empty">{t('gamification.noLeaderboard')}</p>}
                {topLeaders.map((entry, i) => {
                  const name = entry.name || entry.username || t('gamification.explorer');
                  const isMe = [entry.userId, entry.id, entry.user_id].includes(user?.id);
                  return (
                    <div key={entry.userId || entry.id || entry.user_id || i} className={`dash-leader ${i === 0 ? 'is-top' : ''} ${isMe ? 'is-me' : ''}`}>
                      <span className={`dash-leader-rank rank-${i + 1}`}>{i + 1}</span>
                      <span className={`dash-leader-avatar tone-${i % 5}`}>{initialsOf(name)}</span>
                      <span className="dash-leader-name">{name}</span>
                      <span className="dash-leader-xp">{entry.xp || entry.total_xp || 0} XP</span>
                    </div>
                  );
                })}
              </section>

              <div className="dash-section-head dash-section-head--rail"><span>{t('home.progress')}</span></div>
              <section className="dash-card dash-milestone">
                <div className="dash-milestone-head">
                  <span className="dash-milestone-icon"><Award size={16} /></span>
                  <div>
                    <strong>{t('home.weeklyMilestone')}</strong>
                    <small>{t('home.milestoneTask', { days: milestoneTarget })}</small>
                  </div>
                  <span className="dash-milestone-count">{milestoneValue}/{milestoneTarget}</span>
                </div>
                <div className="dash-xp-track"><span style={{ width: `${milestonePct}%` }} /></div>
                <p>{t('home.milestoneReward')}</p>
              </section>
            </aside>
          </div>
        </Layout>
      )}
    </>
  );
}
