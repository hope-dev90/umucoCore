import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import './Explore.css';
import HeritageMap, { hasValidCoordinates } from '../components/Map/HeritageMap';
import MapDiscoveryHint from '../components/Map/MapDiscoveryHint';
import { mapHeritageApiItem } from '../utils/heritageMapping';
import { getCommonsImage } from '../utils/getCommonsImage';
import { BookOpen, CheckCircle2, ChevronDown, Headphones, MapPinned, Play } from 'lucide-react';
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

const earthenwareImg = 'data:image/jpeg;base64,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';

const fallbackImages = [nyanzaImg, buhangaImg, intoreImg, weavingImg, imigongoImg, artifactImg];

// Specific image overrides for API items that need correct image URLs
const IMAGE_OVERRIDES = {
  'The Thousand Hills – Ibirunga': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR781_f6vFqZEveezxtFgrZbJ_POQYbWooR25GEAbgWiQ&s=10',
  'Sacred Forests of Gishwati': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTify2NLcWEBb8g927UpyVaRA2YUV3JwS2OKCo61JB68Q&s=10',
  'Battle of Rucuncu': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmT58u4m8_6WvqcJHpwbz1yoTqeMld-HCKkaokKNn3-A&s=10',
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
// Titles, category labels, locations and descriptions are in Kinyarwanda.
// catKey values are unchanged so CSS classes and explorer-type sorting work.
const FALLBACK_ITEMS = [
  {
    // Card 1 -- Ingoro y'Ubwami ya Nyanza
    category: 'Ubwami', catKey: 'architecture',
    title: "Ingoro y'Ubwami ya Nyanza", location: 'Nyanza', locationKey: 'Nyanza',
    image: nyanzaImg,
    desc: "Ingoro y'Ubwami yubatswe bundi bushya, yerekana ubwubatsi, imihango n'ubuzima bwa buri munsi bw'Urukiko rw'Ubwami rw'u Rwanda.",
    lat: -2.358, lng: 29.546, era: 'pre-colonial',
  },
  {
    // Card 2 -- Intore
    category: 'Ubutwari', catKey: 'performance',
    title: "Intore – Umubyino w'Ubutwari", location: 'Nyanza', locationKey: 'Nyanza',
    image: intoreImg,
    desc: "Umuco ukomeye wa Intore, umubyino w'abasirikare uzwi cyane mu Rwanda, wavutse ku murwa w'intambara z'ubwami maze ugezwa ku bindi bisekuru.",
    lat: -1.970, lng: 30.104, era: 'pre-colonial',
  },
  {
    // Card 3 -- Inanga (music instrument, nationwide)
    category: 'Umuziki', catKey: 'artifacts',
    title: "Inanga – Umutima w'Umuziki Nyarwanda", location: 'Igihugu hose', locationKey: 'National',
    image: artifactImg,
    desc: "Umva inanga, ikembe n'ingoma nk'uko byacurangwaga mu binyejana byinshi mu nkambi z'ubwami no mu materaniro y'imidugudu mu Rwanda hose.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 4 -- Imigani (fireside folktales)
    category: 'Imigani', catKey: 'culture',
    title: "Imigani – Inkuru zivugwa ku Muriro", location: 'Igihugu hose', locationKey: 'National',
    image: buhangaImg,
    desc: "Injira mu muco nyarwanda w'imvugo dukesha abakurambere: imigani, inkuru n'ibitekerezo byigishwa ku muriro w'ijoro, uva ku gisekuru kigana ikindi.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 5 -- Kigeli IV Rwabugiri
    category: 'Ubwami', catKey: 'history',
    title: "Kigeli IV Rwabugiri – Umwami w'Intwari", location: 'Kigali', locationKey: 'Kigali',
    image: weavingImg,
    desc: "Umwe mu bami b'u Rwanda bakomeye cyane, wagushije ubutaka bw'igihugu binyuze mu ntambara no mu ivugurura ry'ubuyobozi.",
    lat: -1.9346, lng: 30.0621, era: 'colonial',
  },
  {
    // Card 6 -- Ubwiru (royal court ceremonies)
    category: 'Imigani', catKey: 'culture',
    title: "Ubwiru – Imihango y'Urukiko rw'Ubwami", location: 'Nyanza', locationKey: 'Nyanza',
    image: nyanzaImg,
    desc: "Imihango yera n'ubumenyi bwihishe byayoboraga ubuzima bw'urukiko rw'ubwami, bigezwa gusa ku bantu bemerewe kubimenya.",
    lat: -2.358, lng: 29.546, era: 'pre-colonial',
  },
  {
    // Card 7 -- Imigani zo ku Muriro (second fireside variant, different image)
    category: 'Imigani', catKey: 'culture',
    title: "Imigani – Inkuru zo ku Muriro", location: 'Igihugu hose', locationKey: 'National',
    image: imigongoImg,
    desc: "Umuco nyarwanda w'imvugo, aho abakuru bateranyaga abana ku muriro kugira ngo babibwire imigani n'inyigisho z'imyitwarire.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 8 -- Ibyivugo (warrior self-praise poetry)
    category: 'Imigani', catKey: 'culture',
    title: "Ibyivugo – Ibisigo by'Ubutwari", location: 'Igihugu hose', locationKey: 'National',
    image: intoreImg,
    desc: "Ibisigo byanditswe n'ababivuga ubwabo, bikavugwa n'abasirikare n'abahigi basingiza ubutwari n'ibikorwa byabo bwite.",
    lat: -1.9700, lng: 30.1040, era: 'pre-colonial',
  },
  {
    // Card 9 -- Inzira z'Ubwenge (riddles and wisdom)
    category: 'Imigani', catKey: 'culture',
    title: "Inzira z'Ubwenge – Ibisakuzo n'Ubuhanga", location: 'Igihugu hose', locationKey: 'National',
    image: artifactImg,
    desc: "Ibisakuzo n'imigani gakondo byakoreshwaga mu kwigisha ubuhanga no gutekereza neza mu bisekuru.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 10 -- Ingoma (royal drums)
    category: 'Umuziki', catKey: 'performance',
    title: "Ingoma – Ingoma Zera z'Ubwami", location: 'Nyanza', locationKey: 'Nyanza',
    image: nyanzaImg,
    desc: "Ingoma zari umutima w'urukiko rw'ubwami, zikoreshwa mu mihango, mu gutangaza amakuru no mu birori.",
    lat: -2.358, lng: 29.546, era: 'pre-colonial',
  },
  {
    // Card 11 -- Umuvugo (praise songs)
    category: 'Umuziki', catKey: 'artifacts',
    title: "Umuvugo – Indirimbo z'Ishimwe", location: 'Igihugu hose', locationKey: 'National',
    image: buhangaImg,
    desc: "Indirimbo gakondo zasingizaga abami, intwari n'ibintu bikomeye, zicurangwa kugira ngo babishimire.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 12 -- Ubudehe (community work)
    category: 'Rusange', catKey: 'crafts',
    title: "Ubudehe – Ubufatanye bw'Abaturage", location: 'Igihugu hose', locationKey: 'National',
    image: weavingImg,
    desc: "Umuco wa kera w'akazi gakorwa hamwe no gufashanya, wagaragaje ubuzima bw'abaturage b'u Rwanda mu binyejana byinshi.",
    lat: -1.9500, lng: 29.9000, era: 'colonial',
  },
  {
    // Card 13 -- Agaseke baskets
    category: 'Rusange', catKey: 'crafts',
    title: "Agaseke – Ibiseke by'Amahoro", location: 'Igihugu hose', locationKey: 'National',
    image: weavingImg,
    desc: "Ibiseke bidukanywe mu buryo bw'ubuhanga, bifite icyerekezo cy'umuco mwinshi, bikoreshwa mu mihango, nk'impano no mu bikoresho bya buri munsi.",
    lat: -2.073, lng: 29.752, era: 'pre-colonial',
  },
  {
    // Card 14 -- Inanga instrument
    category: 'Umuziki', catKey: 'artifacts',
    title: "Inanga – Ikinanga cy'u Rwanda", location: 'Igihugu hose', locationKey: 'National',
    image: artifactImg,
    desc: "Ikirangantego mu bikoresho by'umuziki gakondo by'u Rwanda, inanga icurangwa mu nkambi z'ubwami no mu mihango y'imidugudu.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 15 -- Ingabo royal guard
    category: 'Ubutwari', catKey: 'history',
    title: "Ingabo – Abarinzi b'Ubwami", location: 'Kigali', locationKey: 'Kigali',
    image: intoreImg,
    desc: "Abarinzi b'intwari b'ubwami barinzaga Umwami kandi bagacunga umutekano mu gihugu.",
    lat: -1.9346, lng: 30.0621, era: 'post-1994',
  },
];

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

export default function Explore() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeRegion, setActiveRegion] = useState(t('explore.allRegions'));
  const [activeEras, setActiveEras] = useState([]);
  const [activePlace, setActivePlace] = useState('all');
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [clickPopup, setClickPopup] = useState(null); // { lat, lng, status, location }
  const [heritageItems, setHeritageItems] = useState(FALLBACK_ITEMS);
  const [audioItems, setAudioItems] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [commonsImages, setCommonsImages] = useState({});
  const [completedStoryIds, setCompletedStoryIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(COMPLETED_STORIES_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

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
  // If the API responds in time, MERGE the real data in by title instead
  // of replacing the whole list, so items the DB doesn't know about yet
  // don't get wiped out.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // give up after 5s

    fetch('http://localhost:5000/api/heritage', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const apiMapped = data.items.map((item, index) => {
            const mapped = mapHeritageApiItem(item, index, fallbackImages, withSafeCoordinates);
            // Apply image overrides for known items with broken images
            if (IMAGE_OVERRIDES[mapped.title]) {
              mapped.image = IMAGE_OVERRIDES[mapped.title];
            }
            return mapped;
          });

          setHeritageItems(prev => {
            const byKey = new Map(prev.map(item => [item.title, item]));
            apiMapped.forEach(item => byKey.set(item.title, item));
            return Array.from(byKey.values());
          });
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
        const res = await fetch('http://localhost:5000/api/audio');
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

  // Load Commons images for all fallback cards.
  // Results are cached in commonsImageCache.json (committed) and sessionStorage
  // so the API is only hit once per browser session for missing entries.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const resolved = {};
      await Promise.all(
        FALLBACK_ITEMS.map(async (item) => {
          try {
            const url = await getCommonsImage(item.title);
            if (url && !cancelled) resolved[item.title] = url;
          } catch { /* fall back to local asset */ }
        })
      );
      if (!cancelled) setCommonsImages(resolved);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Handle pending story read from Saved page
  useEffect(() => {
    const pending = localStorage.getItem('pendingStoryRead');
    if (!pending) return;
    try {
      const payload = JSON.parse(pending);
      localStorage.removeItem('pendingStoryRead');
      const story = heritageItems.find(h => String(h.id) === String(payload.itemId));
      if (story) {
        setSelectedStory(story);
      }
    } catch {
      localStorage.removeItem('pendingStoryRead');
    }
  }, [heritageItems]);

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

  const filteredHeritageItems = heritageItems.filter(item => {
    const regionMatch = activeRegion === t('explore.allRegions')
      || (REGION_LOCATION_MAP[activeRegion] || []).includes(item.locationKey);
    const eraMatch = activeEras.length === 0
      || activeEras.some(era => ERA_KEY_MAP[era] === item.era);
    const placeMatch = activePlace === 'all' || normalizePlaceValue(item.locationKey) === normalizePlaceValue(activePlace);
    const query = topbarSearch.trim().toLowerCase();
    const searchMatch = !query
      || (item.title || '').toLowerCase().includes(query)
      || (item.desc || '').toLowerCase().includes(query)
      || (item.category || '').toLowerCase().includes(query)
      || (item.location || '').toLowerCase().includes(query);
    return regionMatch && eraMatch && placeMatch && searchMatch;
  });

  const audioForExplorer = useMemo(() => {
    if (!isMusicExplorer || !audioItems.length) return [];
    return audioItems.map((audio, index) => ({
      ...audio,
      isAudio: true,
      catKey: (audio.category || 'audio').toLowerCase().replace(/\s+/g, ''),
      location: audio.category || 'Audio',
      locationKey: audio.category || 'Audio',
      image: '',
      desc: audio.description || '',
      gridIndex: filteredHeritageItems.length + index,
    }));
  }, [isMusicExplorer, audioItems, filteredHeritageItems.length]);

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
    e.stopPropagation(); // don't trigger map logic
    setSelectedStory(item);
  }, []);

  const handleCardImageError = useCallback((title) => {
    setImageLoadErrors(prev => ({ ...prev, [title]: true }));
  }, []);

  const handleStoryComplete = useCallback((story) => {
    const storyId = getStoryId(story);
    if (!storyId) return;

    setCompletedStoryIds(prev => {
      const next = new Set(prev);
      next.add(storyId);
      localStorage.setItem(COMPLETED_STORIES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Click-to-view: immediately show a loading popup, then fetch the
  // nearest location from the DB and replace its content.
  const handleMapPick = useCallback((lat, lng) => {
    setClickPopup({ lat, lng, status: 'loading', location: null });

    const controller = new AbortController();
    fetch(
      `http://localhost:5000/api/locations/nearest?lat=${lat}&lng=${lng}`,
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
    <Layout searchPlaceholder={t('search.placeholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="explore-page">
        <div className="explore-header">
          <div>
            <span className="explore-kicker">{t('sidebar.explore')}</span>
            <h1>{t('explore.title')}</h1>
          </div>
          <button
            type="button"
            className="explore-map-cta"
            onClick={() => {
              setMapVisible(true);
              setTimeout(() => {
                document.getElementById('explore-map-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
          >
            <MapPinned size={17} />
            {t('explore.map')}
          </button>
        </div>

        <div className="filter-bar">
          <div className="filter-row">
            <span className="filter-label">{t('explore.regions')}</span>
            <div className="filter-chips">
              {regions.map((region) => (
                <button
                  key={region}
                  className={`filter-chip ${activeRegion === region ? 'active' : ''}`}
                  onClick={() => setActiveRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">{t('explore.places')}</span>
            <div className="filter-chips">
               {places.map((place) => (
                 <button
                   key={place.value}
                   className={`filter-chip ${activePlace === place.value ? 'active' : ''}`}
                   onClick={() => setActivePlace(place.value)}
                 >
                   {place.label}
                 </button>
               ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">{t('explore.eras')}</span>
            <div className="filter-chips">
              {eras.map((era) => (
                <button
                  key={era}
                  className={`filter-chip ${activeEras.includes(era) ? 'active' : ''}`}
                  onClick={() => toggleEra(era)}
                >
                  {era}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="archive-grid">
          {sortedItems.map(({ item, index, isCompleted, isAudio }) => (
            <div 
              key={isAudio ? `audio-${item.id}` : (getStoryId(item) || index)} 
              className="heritage-card"
              onClick={() => {
                if (isAudio) {
                  setSelectedAudio(item);
                  return;
                }
                handleCardClick(item);
              }}
            >
              <div className="heritage-img-wrap">
                <span className={`heritage-card-category cat-${item.catKey}`}>
                  {isAudio ? <Headphones size={12} aria-hidden="true" /> : null}
                  {item.category}
                </span>
                {isCompleted && !isAudio && (
                  <span className="heritage-status-badge completed">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Read
                  </span>
                )}
                {isAudio && (
                  <span className="heritage-status-badge audio">
                    <Headphones size={12} aria-hidden="true" />
                    Listen
                  </span>
                )}
                {isAudio ? (
                  <div className="heritage-card-image heritage-card-audio-art" role="img" aria-label={item.title}>
                    <Headphones size={52} aria-hidden="true" />
                  </div>
                ) : (
                  // Task 2: prefer Commons image, then local asset, then brown placeholder
                  imageLoadErrors[item.title] ? (
                    <div
                      className="heritage-card-image"
                      style={{
                        height: 230,
                        background: 'linear-gradient(135deg, #6B4226 0%, #3E2723 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      role="img"
                      aria-label={item.title}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(245,235,224,0.5)" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={commonsImages[item.title] || item.image}
                      alt={item.title}
                      className="heritage-card-image"
                      onError={() => handleCardImageError(item.title)}
                    />
                  )
                )}
              </div>
              <div className="heritage-card-body">
                <div className="heritage-card-heading">
                  <h3 className="heritage-card-title">{item.title}</h3>
                  <span className="heritage-card-location">{item.location}</span>
                </div>
                <p className="heritage-card-desc">{item.desc}</p>
                <div className="heritage-card-actions">
                  {!isAudio ? (
                    <button
                      type="button"
                      className="heritage-action secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(item);
                        setMapVisible(true);
                        setTimeout(() => {
                          document.getElementById('explore-map-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                    >
                      <MapPinned size={15} aria-hidden="true" />
                      Map
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="heritage-action primary"
                    onClick={(e) => {
                      if (isAudio) {
                        e.stopPropagation();
                        setSelectedAudio(item);
                        return;
                      }
                      handleReadMore(e, item);
                    }}
                  >
                    {isAudio ? <Play size={14} aria-hidden="true" /> : <BookOpen size={14} aria-hidden="true" />}
                    {isAudio ? 'Play audio' : 'Read more'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="discover-more-wrap">
          <button className="discover-btn" onClick={() => setMapVisible(!mapVisible)}>
            {mapVisible ? 'Hide map' : t('explore.map')}
            <ChevronDown size={14} className={mapVisible ? 'is-open' : ''} aria-hidden="true" />
          </button>
          <MapDiscoveryHint
            mapVisible={mapVisible}
            onOpenMap={() => setMapVisible(true)}
          />
        </div>

        {mapVisible && (
          <div id="explore-map-section" className="map-section">
            <HeritageMap
              items={heritageItems}
              selectedMarker={selectedMarker}
              onMarkerClick={(item) => setSelectedMarker(item)}
              clickPopup={clickPopup}
              onMapPick={handleMapPick}
              onClosePanel={() => {
                setSelectedMarker(null);
                setClickPopup(null);
              }}
              showPanel={false}
            />
          </div>
        )}
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
                  {selectedAudio.category || 'Audio'}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2C1A14' }}>
                  {selectedAudio.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudio(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6F5B55' }}
              >
                {'\u2715'}
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {selectedAudio.description && (
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#6F5B55', lineHeight: 1.6 }}>
                  {selectedAudio.description}
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
