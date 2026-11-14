import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import './Explore.css';
import './ExploreDs.css';
import HeritageMap, { hasValidCoordinates } from '../components/Map/HeritageMap';
import { mapHeritageApiItem } from '../utils/heritageMapping';
import { localizeItem } from '../utils/contentLocale';
import { getLocalizedText } from '../utils/i18n';
import commonsImagesCached from '../data/commonsImageCache.json';
import { ArrowRight, CheckCircle2, ChevronDown, Headphones, History, Landmark, MapPin, MapPinned, Play, RefreshCw } from 'lucide-react';
import { apiUrl } from '../config/api';
import nyanzaImg from '../assets/explore/nyanza.jpg';
import buhangaImg from '../assets/explore/buhanga.jpg';
import intoreImg from '../assets/explore/intore2.jpg';
import weavingImg from '../assets/explore/weaving_agaseke.jpg';
import imigongoImg from '../assets/explore/imigongo.jpg';
import artifactImg from '../assets/explore/artifact.jpg';
import safariImg from '../assets/safari.jpg';
import craneStoryImg from '../assets/listen/crane-story.jpg';
import moonStoryImg from '../assets/listen/moon-story.jpg';
import ruganzuImg from '../assets/listen/ruganzu.png';
import notFoundImg from '../assets/explore/notfound.png';
import { trackView } from '../utils/trackView';
import ReportButton from '../components/ReportButton';
import exploreStories from '../data/explore-stories.json';

const fallbackImages = [nyanzaImg, buhangaImg, intoreImg, weavingImg, imigongoImg, artifactImg];

// Specific image overrides for API items that need correct image URLs
const IMAGE_OVERRIDES = {
  'The Thousand Hills – Ibirunga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mount_Karisimbi.jpg/800px-Mount_Karisimbi.jpg',
  'Sacred Forests of Gishwati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Gishwati_Forest.jpg/800px-Gishwati_Forest.jpg',
  'Battle of Rucuncu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Volcanoes_National_Park%2C_Rwanda.jpg/800px-Volcanoes_National_Park%2C_Rwanda.jpg',
};
const COMPLETED_STORIES_KEY = 'umuco_completed_story_ids';

// Maps a user's chosen explorer/adventure type → the heritage catKey(s)
// that are most relevant to them. Cards matching one of these catKeys
// are sorted to the top of the (not-yet-completed) grid.
// Adjust these mappings to match your content taxonomy as needed.
const EXPLORER_CATKEY_MAP = {
  'warrior':         ['performance', 'history'],
  'nature-lover':    ['wildlife', 'lakes'],
  'royal-historian': ['architecture', 'history'],
  'folktale-hunter': ['culture', 'crafts', 'art'],
  'music-explorer':  ['artifacts'],
};

// Shown immediately -- API data merges into these in the background.
// Now loaded from explore-stories.json for single-source-of-truth.
// Titles, category labels, locations and descriptions are in Kinyarwanda.
// catKey values are unchanged so CSS classes and explorer-type sorting work.
const FALLBACK_ITEMS = exploreStories.map((story, index) => ({
  ...story,
  // Assign images based on imageKey
  image: story.imageKey === 'nyanza' ? nyanzaImg :
         story.imageKey === 'buhanga' ? buhangaImg :
         story.imageKey === 'intore' ? intoreImg :
         story.imageKey === 'weaving' ? weavingImg :
         story.imageKey === 'imigongo' ? imigongoImg :
         story.imageKey === 'artifact' ? artifactImg :
         story.imageKey === 'safari' ? safariImg :
         fallbackImages[index % fallbackImages.length],
}));

const toCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const withSafeCoordinates = (item) => ({
  ...item,
  lat: toCoordinate(item.lat),
  lng: toCoordinate(item.lng),
});

const getStoryId = (item) => String(item?.id || item?.title || item?.location || '');

const normalizePlaceValue = (value) => String(value ?? '').trim().toLowerCase();

// Rough reading time for a card description (min 2 minutes).
const readMinutes = (text) => Math.max(2, Math.round(String(text || '').split(/\s+/).length / 12));

export default function Explore() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { fetchUserActivityItems, trackActivity } = useGamificationContext();

  // Some i18n setups return the key itself (e.g. "explore.clearFilters")
  // when a translation is missing, instead of '' or undefined. That makes
  // `t(key) || fallback` useless, since the returned key is truthy.
  // This helper treats "t() echoed the key back" as "missing" too.
  const tf = useCallback((key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  }, [t]);
  const [activeRegion, setActiveRegion] = useState(t('explore.allRegions'));
  const [activeEras, setActiveEras] = useState([]);
  const [activePlace, setActivePlace] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [clickPopup, setClickPopup] = useState(null); // { lat, lng, status, location }
  const [heritageItems, setHeritageItems] = useState(FALLBACK_ITEMS);
  const [audioItems, setAudioItems] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const commonsImages = commonsImagesCached;
  const [completedStoryIds, setCompletedStoryIds] = useState(new Set());

  // Fetch completed story ids from backend
  useEffect(() => {
    if (!user?.id) {
      setCompletedStoryIds(new Set());
      return;
    }
    const loadCompleted = async () => {
      const items = await fetchUserActivityItems('story');
      setCompletedStoryIds(new Set(items.map(id => String(id))));
    };
    loadCompleted();
  }, [user?.id, fetchUserActivityItems]);

  const activeExplorerType = user?.explorerType || user?.explorer_type;
  const isMusicExplorer = activeExplorerType === 'music-explorer';

  const [topbarSearch, setTopbarSearch] = useState('');

  const regions = [
    t('explore.allRegions'),
    t('explore.north'),
    t('explore.south'),
    t('explore.east'),
    t('explore.west'),
    t('explore.kigali'),
  ];

  const eras = [
    t('explore.preColonial'),
    t('explore.colonial'),
    t('explore.post1994'),
  ];

  const places = [
    { label: t('explore.allPlaces'), value: 'all' },
    { label: t('explore.nyanza'), value: 'Nyanza' },
    { label: t('explore.musanze'), value: 'Musanze' },
    { label: t('explore.kibungo'), value: 'Kibungo' },
    { label: t('explore.gitarama'), value: 'Gitarama' },
    { label: t('explore.rubavu'), value: 'Rubavu' },
    { label: t('explore.rusizi'), value: 'Rusizi' },
    { label: t('explore.kayonza'), value: 'Kayonza' },
    { label: t('explore.kigali'), value: 'Kigali' },
  ];

  // Background fetch — cards are already visible from FALLBACK_ITEMS.
  // explore-stories.json is always the source of truth for the 31 cards.
  // Any extra items the API returns (not matching a JSON card by English title)
  // are appended so they show up too, but they can never replace JSON cards.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // give up after 5s

    // Build a set of English titles from the JSON cards for fast lookup
    const jsonTitles = new Set(
      exploreStories.map(s =>
        (typeof s.title === 'object' ? s.title.en : s.title || '').toLowerCase().trim()
      )
    );

    fetch(apiUrl('/api/heritage'), { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          // Only keep API items whose title doesn't match any JSON card
          const extraApiItems = data.items
            .filter(item => {
              const apiTitle = (typeof item.title === 'object' ? item.title.en : item.title || '')
                .toLowerCase().trim();
              return !jsonTitles.has(apiTitle);
            })
            .map((item, index) => {
              const mapped = mapHeritageApiItem(item, index, fallbackImages, withSafeCoordinates);
              if (commonsImagesCached[mapped.title]) {
                mapped.image = commonsImagesCached[mapped.title];
              } else if (IMAGE_OVERRIDES[mapped.title]) {
                mapped.image = IMAGE_OVERRIDES[mapped.title];
              }
              return mapped;
            });

          if (extraApiItems.length > 0) {
            // Append API-only extras after the JSON cards — never replace them
            setHeritageItems(prev => {
              const existingIds = new Set(prev.map(i => String(i.id)));
              const newExtras = extraApiItems.filter(i => !existingIds.has(String(i.id)));
              return newExtras.length > 0 ? [...prev, ...newExtras] : prev;
            });
          }
        }
      })
      .catch(() => {/* keep fallback */})
      .finally(() => clearTimeout(timeout));

    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  // Fetch audio for music-explorer users
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const res = await fetch(apiUrl('/api/audio'));
        const data = await res.json();
        if (data.audio && data.audio.length > 0) {
          setAudioItems(data.audio);
        }
      } catch (err) {
        console.error('Failed to fetch audio:', err);
      }
    };
    fetchAudio();
  }, []);



  const toggleEra = (era) => {
    setActiveEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  // Region → locationKey mapping (maps display labels to locationKey values in items)
  const REGION_LOCATION_MAP = useMemo(() => ({
    [t('explore.north')]:  ['Musanze', 'Rubavu'],
    [t('explore.south')]:  ['Nyanza', 'Gitarama', 'Rusizi'],
    [t('explore.east')]:   ['Kibungo', 'Kayonza'],
    [t('explore.west')]:   ['Rubavu', 'Rusizi'],
    [t('explore.kigali')]: ['Kigali'],
  }), [t]);

  // Era label → era key mapping
  const ERA_KEY_MAP = useMemo(() => ({
    [t('explore.preColonial')]: 'pre-colonial',
    [t('explore.colonial')]:    'colonial',
    [t('explore.post1994')]:    'post-1994',
  }), [t]);

  const ERA_LABELS = useMemo(() => ({
    'pre-colonial': t('explore.preColonial'),
    'colonial': t('explore.colonial'),
    'post-1994': t('explore.post1994'),
  }), [t]);

  const categoryOptions = useMemo(() => {
    const seen = new Map();
    heritageItems.forEach((item) => {
      if (item.catKey && !seen.has(item.catKey)) {
        seen.set(item.catKey, getLocalizedText(item.category, language) || item.catKey);
      }
    });
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [heritageItems, language]);

  // Only show Place chips that are valid for the currently selected Region.
  // "All places" is always shown. When Region = "All regions", every place is shown.
  // This is what prevents the user from ever building an impossible
  // region + place combination that silently empties the grid.
  const visiblePlaces = useMemo(() => {
    if (activeRegion === t('explore.allRegions')) return places;
    const allowedKeys = REGION_LOCATION_MAP[activeRegion] || [];
    return places.filter((p) => p.value === 'all' || allowedKeys.includes(p.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegion, REGION_LOCATION_MAP, t]);

  // Changing Region resets Place, so the two filters can never conflict.
  const handleRegionChange = useCallback((region) => {
    setActiveRegion(region);
    setActivePlace('all');
  }, []);

  const filteredHeritageItems = heritageItems.filter(item => {
    const regionMatch = activeRegion === t('explore.allRegions')
      || (REGION_LOCATION_MAP[activeRegion] || []).includes(item.locationKey);
    const eraMatch = activeEras.length === 0
      || activeEras.some(era => ERA_KEY_MAP[era] === item.era);
    const placeMatch = activePlace === 'all' || normalizePlaceValue(item.locationKey) === normalizePlaceValue(activePlace);
    const query = topbarSearch.trim().toLowerCase();
    const searchMatch = !query
      || getLocalizedText(item.title, language).toLowerCase().includes(query)
      || getLocalizedText(item.desc, language).toLowerCase().includes(query)
      || getLocalizedText(item.category, language).toLowerCase().includes(query)
      || getLocalizedText(item.location, language).toLowerCase().includes(query);
    const categoryMatch = activeCategory === 'all' || item.catKey === activeCategory;
    return regionMatch && eraMatch && placeMatch && categoryMatch && searchMatch;
  });

  // True when any filter differs from its default — drives the "Clear filters" control.
  const hasActiveFilters =
    activeRegion !== t('explore.allRegions') ||
    activePlace !== 'all' ||
    activeEras.length > 0 ||
    activeCategory !== 'all' ||
    topbarSearch.trim() !== '';

  const clearAllFilters = useCallback(() => {
    setActiveRegion(t('explore.allRegions'));
    setActivePlace('all');
    setActiveEras([]);
    setActiveCategory('all');
    setTopbarSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // Reset filters when language changes to avoid mismatched translated values
  useEffect(() => {
    // If activeRegion is not in the new regions list (because language changed), reset all filters
    const currentRegions = [
      t('explore.allRegions'),
      t('explore.north'),
      t('explore.south'),
      t('explore.east'),
      t('explore.west'),
      t('explore.kigali'),
    ];
    const currentEras = [
      t('explore.preColonial'),
      t('explore.colonial'),
      t('explore.post1994'),
    ];
    const regionMismatch = !currentRegions.includes(activeRegion);
    const eraMismatch = activeEras.some(era => !currentEras.includes(era));
    if (regionMismatch || eraMismatch) {
      clearAllFilters();
    }
  }, [t, activeRegion, activeEras, clearAllFilters]);

  // Removed pendingStoryRead localStorage usage

  const audioForExplorer = useMemo(() => {
    if (!isMusicExplorer || !audioItems.length) return [];
    return audioItems.map((audio, index) => {
      const resolvedCategory = getLocalizedText(audio.category, language) || 'Audio';
      const resolvedDesc = getLocalizedText(audio.description, language) || '';
      const resolvedTitle = getLocalizedText(audio.title, language) || '';
      return {
        ...audio,
        isAudio: true,
        title: resolvedTitle,
        catKey: resolvedCategory.toLowerCase().replace(/\s+/g, ''),
        location: resolvedCategory,
        locationKey: resolvedCategory,
        image: '',
        desc: resolvedDesc,
        description: resolvedDesc,
        gridIndex: filteredHeritageItems.length + index,
      };
    });
  }, [isMusicExplorer, audioItems, filteredHeritageItems.length, language]);

  const combinedItems = useMemo(() => {
    const heritageMapped = filteredHeritageItems.map((item, index) => ({
      item,
      index,
      isCompleted: completedStoryIds.has(getStoryId(item)),
      isAudio: false,
    }));
    const audioMapped = audioForExplorer.map((item, index) => ({
      item,
      index: filteredHeritageItems.length + index,
      isCompleted: false,
      isAudio: true,
    }));
    return [...heritageMapped, ...audioMapped];
  }, [filteredHeritageItems, audioForExplorer, completedStoryIds]);

  // Sort priority: not-completed & matches the user's explorer type first,
  // then not-completed & non-matching, then completed items last.
  // Ties within each group preserve original relative order.
  const sortedItems = useMemo(() => {
    const matchCatKeys = EXPLORER_CATKEY_MAP[activeExplorerType] || [];

    return combinedItems.slice().sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;

      const aMatch = !a.isAudio && matchCatKeys.includes(a.item.catKey) ? 0 : 1;
      const bMatch = !b.isAudio && matchCatKeys.includes(b.item.catKey) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;

      return a.index - b.index;
    });
  }, [combinedItems, activeExplorerType]);

  const [selectedStory, setSelectedStory] = useState(null);

  // Apply language-based translation to card fields at render time
  const localizedSortedItems = useMemo(() =>
    sortedItems.map(entry => ({
      ...entry,
      item: localizeItem(entry.item, language),
    })),
    [sortedItems, language]
  );

  // Localized version of heritageItems for the map — HeritageMap renders
  // item.title / category / location / desc directly so they must be strings.
  const localizedHeritageItems = useMemo(() =>
    heritageItems.map(item => localizeItem(item, language)),
    [heritageItems, language]
  );

  // Keep selectedMarker in sync with the active language. When the user
  // switches language, re-derive the panel item from localizedHeritageItems
  // so the map panel always shows the correct language strings.
  const localizedSelectedMarker = useMemo(() => {
    if (!selectedMarker) return null;
    const id = String(selectedMarker.id || selectedMarker.originalTitle || selectedMarker.title || '');
    const fresh = localizedHeritageItems.find(i =>
      String(i.id || i.originalTitle || i.title || '') === id
    );
    return fresh || localizeItem(selectedMarker, language);
  }, [selectedMarker, localizedHeritageItems, language]);

  const handleCardClick = useCallback((item) => {
    setMapVisible(true);
    if (hasValidCoordinates(item)) {
      setSelectedMarker(item);
      setTimeout(() => {
        if (window.leafletMap) {
          window.leafletMap.setView([item.lat, item.lng], 10);
        }
      }, 100);
    } else {
      setSelectedMarker(null);
    }
  }, []);

  const handleReadMore = useCallback((e, item) => {
    e.stopPropagation();
    setSelectedStory(item);
    const stableKey = item.originalTitle || item.title;
    const cachedImage = commonsImagesCached[stableKey] || commonsImagesCached[item.title];
    trackView({
      type: 'Article',
      itemId: item.id,
      title: item.title,
      image: cachedImage || item.image || '',
      category: item.category || '',
      location: item.location || '',
    });
  }, []);

  const handleCardImageError = useCallback((title) => {
    setImageLoadErrors(prev => ({ ...prev, [title]: true }));
  }, []);

  // Escape key closes the audio player modal
  useEffect(() => {
    if (!selectedAudio) return;
    const handler = (e) => { if (e.key === 'Escape') setSelectedAudio(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedAudio]);

  const handleStoryComplete = useCallback((story) => {
    const storyId = getStoryId(story);
    if (!storyId) return;

    // Call trackActivity to mark as completed in backend
    trackActivity('story', storyId, { 
      title: story.title,
      category: story.category 
    });

    // Update local state
    setCompletedStoryIds(prev => {
      const next = new Set(prev);
      next.add(storyId);
      return next;
    });
  }, [trackActivity]);

  // Click-to-view: immediately show a loading popup, then fetch the
  // nearest location from the DB and replace its content.
  const handleMapPick = useCallback((lat, lng) => {
    setClickPopup({ lat, lng, status: 'loading', location: null });

    const controller = new AbortController();
    fetch(
      apiUrl(`/api/locations/nearest?lat=${lat}&lng=${lng}`),
      { signal: controller.signal }
    )
      .then(async (res) => {
        if (res.status === 404) {
          setClickPopup({ lat, lng, status: 'notfound', location: null });
          return;
        }
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json = await res.json();
        setClickPopup({ lat, lng, status: 'loaded', location: json.location });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setClickPopup({ lat, lng, status: 'error', location: null });
      });
  }, []);

  return (
    <Layout searchPlaceholder={t('ui.searchArchive')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="ds-page explore-ds">
        <section className="ds-hero explore-hero">
          <span className="ds-kicker">{t('explore.heroKicker')}</span>
          <h1>{t('explore.heroTitle')}</h1>
          <p>{t('explore.heroDesc')}</p>
          <div className="explore-filters">
            <label className="explore-select">
              <MapPin size={13} aria-hidden="true" />
              <select value={activeRegion} onChange={(e) => handleRegionChange(e.target.value)} aria-label={t('explore.regions')}>
                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
            <label className="explore-select">
              <MapPinned size={13} aria-hidden="true" />
              <select value={activePlace} onChange={(e) => setActivePlace(e.target.value)} aria-label={t('explore.places')}>
                {visiblePlaces.map((place) => <option key={place.value} value={place.value}>{place.label}</option>)}
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
            <label className="explore-select">
              <History size={13} aria-hidden="true" />
              <select
                value={activeEras[0] || ''}
                onChange={(e) => setActiveEras(e.target.value ? [e.target.value] : [])}
                aria-label={t('explore.eras')}
              >
                <option value="">{t('explore.historicalPeriod')}</option>
                {eras.map((era) => <option key={era} value={era}>{era}</option>)}
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
            <label className="explore-select">
              <Landmark size={13} aria-hidden="true" />
              <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} aria-label={t('explore.topicCategory')}>
                <option value="all">{t('explore.topicCategory')}</option>
                {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown size={12} aria-hidden="true" />
            </label>
            <button type="button" className="explore-reset" onClick={clearAllFilters} disabled={!hasActiveFilters}>
              {t('explore.reset')}
            </button>
          </div>
          <div className="ds-diamonds" aria-hidden="true" />
        </section>

        {localizedSortedItems.length === 0 ? (
          <div className="ds-card archive-empty-state">
            <img src={notFoundImg} alt="" aria-hidden="true" className="archive-empty-illustration" />
            <h3 className="archive-empty-title">
              {tf('explore.noResultsTitle', 'No heritage sites match your search.')}
            </h3>
            <p className="archive-empty-desc">
              {tf('explore.noResultsDescLine1', "We couldn't find any results for the selected filters.")}
            </p>
            <button type="button" className="ds-btn" onClick={clearAllFilters}>
              <RefreshCw size={13} aria-hidden="true" />
              {tf('explore.clearFilters', 'Clear filters')}
            </button>
          </div>
        ) : (
          <div className="explore-rail">
            {localizedSortedItems.map(({ item, index, isCompleted, isAudio }) => {
              const stableKey = item.originalTitle || item.title;
              const cachedImage = commonsImagesCached[stableKey] || commonsImagesCached[item.title];
              const openMap = (e) => {
                e.stopPropagation();
                handleCardClick(item);
                setTimeout(() => {
                  document.getElementById('explore-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 60);
              };
              return (
                <article
                  key={isAudio ? `audio-${item.id}` : (getStoryId(item) || index)}
                  className="explore-card"
                  onClick={(e) => (isAudio ? setSelectedAudio(item) : handleReadMore(e, item))}
                >
                  <div className="explore-card-media">
                    {isAudio || imageLoadErrors[stableKey] ? (
                      <div className="explore-card-fallback" role="img" aria-label={item.title}>
                        {isAudio ? <Headphones size={40} aria-hidden="true" /> : null}
                      </div>
                    ) : (
                      <img src={cachedImage || item.image} alt={item.title} onError={() => handleCardImageError(stableKey)} />
                    )}
                    <div className="explore-card-tags">
                      <span className="explore-tag">{item.location}</span>
                      {isCompleted && !isAudio
                        ? <span className="explore-tag explore-tag--done"><CheckCircle2 size={11} /> {t('explore.read')}</span>
                        : <span className="explore-tag explore-tag--xp">+{item.xpReward ?? 50} XP</span>}
                    </div>
                    <div className="explore-card-report" onClick={(e) => e.stopPropagation()}>
                      <ReportButton itemType="heritage" itemId={item.id || item.title} itemTitle={item.title} />
                    </div>
                  </div>
                  <div className="explore-card-body">
                    <div className="explore-card-meta">
                      <span>{item.category}{item.era ? ` • ${ERA_LABELS[item.era] || item.era}` : ''}</span>
                      <span>{isAudio ? t('explore.audio') : t('explore.minRead', { minutes: readMinutes(item.desc) })}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="explore-card-actions">
                      {!isAudio && hasValidCoordinates(item) && (
                        <button type="button" className="ds-btn" onClick={openMap}>
                          {t('explore.mapBtn')} <ArrowRight size={12} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="ds-btn ds-btn--soft explore-card-read"
                        onClick={(e) => {
                          if (isAudio) { e.stopPropagation(); setSelectedAudio(item); return; }
                          handleReadMore(e, item);
                        }}
                      >
                        {isAudio ? <Play size={12} aria-hidden="true" /> : null}
                        {isAudio ? t('explore.play') : t('explore.readBtn')} {!isAudio && <ArrowRight size={12} aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div id="explore-map-section" className="ds-card explore-map">
          <HeritageMap
            items={localizedHeritageItems}
            selectedMarker={localizedSelectedMarker}
            onMarkerClick={(item) => setSelectedMarker(item)}
            clickPopup={clickPopup}
            onMapPick={handleMapPick}
            language={language}
            onClosePanel={() => {
              setSelectedMarker(null);
              setClickPopup(null);
            }}
            showPanel={true}
          />
        </div>
      </div>
      {/* Story read modal */}
      {selectedStory && (
        <StoryReadModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onComplete={handleStoryComplete}
        />
      )}

      {/* Audio player modal */}
      {selectedAudio && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(44,26,20,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setSelectedAudio(null)}
        >
          <div
            style={{
              background: '#FDFBF7', borderRadius: 24, width: '90%', maxWidth: 520,
              boxShadow: '0 32px 80px rgba(44,26,20,0.35)', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #EADBC8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8D493A', marginBottom: 4 }}>
                  {getLocalizedText(selectedAudio.category, language) || 'Audio'}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2C1A14' }}>
                  {getLocalizedText(selectedAudio.title, language)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudio(null)}
                aria-label="Close audio player"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6F5B55' }}
              >
                {'\u2715'}
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {selectedAudio.description && (
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#6F5B55', lineHeight: 1.6 }}>
                  {getLocalizedText(selectedAudio.description, language)}
                </p>
              )}
              {selectedAudio.audio_url ? (
                <audio
                  controls
                  autoPlay
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  src={selectedAudio.audio_url}
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6F5B55', fontSize: '0.9rem', background: 'rgba(141,73,58,0.06)', borderRadius: 12 }}>
                  No audio file available for this item.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}