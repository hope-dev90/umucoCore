import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import './Explore.css';
import HeritageMap, { hasValidCoordinates } from '../components/Map/HeritageMap';
import MapDiscoveryHint from '../components/Map/MapDiscoveryHint';
import { mapHeritageApiItem } from '../utils/heritageMapping';
import { localizeItem } from '../utils/contentLocale';
import commonsImagesCached from '../data/commonsImageCache.json';
import { BookOpen, CheckCircle2, ChevronDown, Flag, Headphones, MapPinned, Play, RefreshCw, X } from 'lucide-react';
import { API_BASE } from '../config/api';
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
// Titles, category labels, locations and descriptions are in Kinyarwanda.
// catKey values are unchanged so CSS classes and explorer-type sorting work.
const FALLBACK_ITEMS = [
  {
    //{
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
    // Card 7 -- Ibyivugo (warrior self-praise poetry)
    category: 'Imigani', catKey: 'culture',
    title: "Ibyivugo – Ibisigo by'Ubutwari", location: 'Igihugu hose', locationKey: 'National',
    image: intoreImg,
    desc: "Ibisigo byanditswe n'ababivuga ubwabo, bikavugwa n'abasirikare n'abahigi basingiza ubutwari n'ibikorwa byabo bwite.",
    lat: -1.9700, lng: 30.1040, era: 'pre-colonial',
  },
  {
    // Card 8 -- Inzira z'Ubwenge (riddles and wisdom)
    category: 'Imigani', catKey: 'culture',
    title: "Inzira z'Ubwenge – Ibisakuzo n'Ubuhanga", location: 'Igihugu hose', locationKey: 'National',
    image: artifactImg,
    desc: "Ibisakuzo n'imigani gakondo byakoreshwaga mu kwigisha ubuhanga no gutekereza neza mu bisekuru.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 9 -- Ingoma (royal drums)
    category: 'Umuziki', catKey: 'performance',
    title: "Ingoma – Ingoma Zera z'Ubwami", location: 'Nyanza', locationKey: 'Nyanza',
    image: nyanzaImg,
    desc: "Ingoma zari umutima w'urukiko rw'ubwami, zikoreshwa mu mihango, mu gutangaza amakuru no mu birori.",
    lat: -2.358, lng: 29.546, era: 'pre-colonial',
  },
  {
    // Card 10 -- Umuvugo (praise songs)
    category: 'Umuziki', catKey: 'artifacts',
    title: "Umuvugo – Indirimbo z'Ishimwe", location: 'Igihugu hose', locationKey: 'National',
    image: buhangaImg,
    desc: "Indirimbo gakondo zasingizaga abami, intwari n'ibintu bikomeye, zicurangwa kugira ngo babishimire.",
    lat: -1.9500, lng: 29.9000, era: 'pre-colonial',
  },
  {
    // Card 11 -- Ubudehe (community work)
    category: 'Rusange', catKey: 'crafts',
    title: "Ubudehe – Ubufatanye bw'Abaturage", location: 'Igihugu hose', locationKey: 'National',
    image: weavingImg,
    desc: "Umuco wa kera w'akazi gakorwa hamwe no gufashanya, wagaragaje ubuzima bw'abaturage b'u Rwanda mu binyejana byinshi.",
    lat: -1.9500, lng: 29.9000, era: 'colonial',
  },
  {
    // Card 12 -- Agaseke baskets
    category: 'Rusange', catKey: 'crafts',
    title: "Agaseke – Ibiseke by'Amahoro", location: 'Igihugu hose', locationKey: 'National',
    image: weavingImg,
    desc: "Ibiseke bidukanywe mu buryo bw'ubuhanga, bifite icyerekezo cy'umuco mwinshi, bikoreshwa mu mihango, nk'impano no mu bikoresho bya buri munsi.",
    lat: -2.073, lng: 29.752, era: 'pre-colonial',
  },
  {
    // Card 13 -- Ingabo royal guard
    category: 'Ubutwari', catKey: 'history',
    title: "Ingabo – Abarinzi b'Ubwami", location: 'Kigali', locationKey: 'Kigali',
    image: intoreImg,
    desc: "Abarinzi b'intwari b'ubwami barinzaga Umwami kandi bagacunga umutekano mu gihugu.",
    lat: -1.9346, lng: 30.0621, era: 'post-1994',
  },
  {
    // Card 14 -- Nyungwe Forest National Park
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Nyungwe Forest National Park", location: 'Rusizi', locationKey: 'Rusizi',
    image: safariImg,
    desc: "Ishyamba ritandukanye mu Rwanda, harimo inyamaswa n'inyamaswa z'ibihumbi byinshi, inyungura n'inzoka z'amakungu.",
    lat: -2.47, lng: 29.24, era: 'pre-colonial',
  },
  {
    // Card 15 -- Akagera National Park
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Akagera National Park", location: 'Kayonza', locationKey: 'Kayonza',
    image: safariImg,
    desc: "Pariki y'ibisura yabera mu bwongereza bw'u Rwanda, harimo ibisura nk'inyambo, imvura, amavumbi n'ibindi.",
    lat: -1.65, lng: 30.75, era: 'pre-colonial',
  },
  {
    // Card 16 -- Lake Kivu
    category: 'Ibyitangira Cyumweru', catKey: 'lakes',
    title: "Lake Kivu", location: 'Rubavu', locationKey: 'Rubavu',
    image: safariImg,
    desc: "Ikiyaga kigari cyo mu ruhande rwa burenga bw'u Rwanda, cyuzuye amateka y'ibihumbi n'ibintu bikomeye.",
    lat: -1.66, lng: 29.22, era: 'pre-colonial',
  },
 
  {
    // Card 18 -- Butare National Museum of Rwanda
    category: 'Ubwenge', catKey: 'artifacts',
    title: "Butare National Museum of Rwanda", location: 'Huye', locationKey: 'Gitarama',
    image: buhangaImg,
    desc: "Ihaha ry'ibitekerezo ry'amateka y'u Rwanda, harimo ibintu byinshi by'umugambi n'amaherezo.",
    lat: -2.59, lng: 29.74, era: 'colonial',
  },
  {
    // Card 19 -- Murambi Genocide Memorial
    category: 'Amateka', catKey: 'history',
    title: "Murambi Genocide Memorial", location: 'Nyamagabe', locationKey: 'Gitarama',
    image: artifactImg,
    desc: "Ihaha rya jenoside rya 1994 mu Murambi, rishobora kumenya abantu kugira ngo babigire icyo ariyo.",
    lat: -2.39, lng: 29.67, era: 'post-1994',
  },
  {
    // Card 20 -- Nyarugenge Church
    category: 'Ubwenge', catKey: 'architecture',
    title: "Nyarugenge Church", location: 'Kigali', locationKey: 'Kigali',
    image: nyanzaImg,
    desc: "Itorero rya kera rya Nyarugenge, rikubiyemo ubwubatsi bw'ibihumbi.",
    lat: -1.95, lng: 30.06, era: 'colonial',
  },
  {
    // Card 21 -- Kibeho
    category: 'Ubwenge', catKey: 'culture',
    title: "Kibeho Shrine", location: 'Nyaruguru', locationKey: 'Gitarama',
    image: buhangaImg,
    desc: "Aho Maria yaboneje mu Rwanda, harimo itorero n'ibindi bikomeye.",
    lat: -2.65, lng: 29.55, era: 'colonial',
  },
  {
    // Card 22 -- Rwankeri Hill
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Rwankeri Hill", location: 'Rwamagana', locationKey: 'Kayonza',
    image: imigongoImg,
    desc: "Umusozi ukomeye mu Rwanda, harimo imirima y'amakungu n'ibintu bikomeye.",
    lat: -1.95, lng: 30.35, era: 'pre-colonial',
  },
  {
    // Card 23 -- Lake Muhazi
    category: 'Ibyitangira Cyumweru', catKey: 'lakes',
    title: "Lake Muhazi", location: 'Rwamagana', locationKey: 'Kayonza',
    image: safariImg,
    desc: "Ikiyaga kigari cyo mu Rwanda, cyuzuye amateka n'ibintu bikomeye.",
    lat: -1.85, lng: 30.25, era: 'pre-colonial',
  },
  {
    // Card 24 -- Bisesero Genocide Memorial
    category: 'Amateka', catKey: 'history',
    title: "Bisesero Genocide Memorial", location: 'Karongi', locationKey: 'Rubavu',
    image: artifactImg,
    desc: "Ihaha rya jenoside rya 1994 mu Bisesero.",
    lat: -2.15, lng: 29.35, era: 'post-1994',
  },
  {
    // Card 25 -- Mount Karisimbi
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Mount Karisimbi", location: 'Musanze', locationKey: 'Musanze',
    image: imigongoImg,
    desc: "Umusozi mukuru mu Virunga, harimo ibisura n'inyamaswa.",
    lat: -1.50, lng: 29.45, era: 'pre-colonial',
  },
  {
    // Card 26 -- Gishwati Forest
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Gishwati Forest", location: 'Ngororero', locationKey: 'Musanze',
    image: safariImg,
    desc: "Ishyamba rikubiyemo ibintu bikomeye cyane.",
    lat: -1.75, lng: 29.55, era: 'pre-colonial',
  },
  {
    // Card 27 -- Rugezi Marsh
    category: 'Ibyitangira Cyumweru', catKey: 'lakes',
    title: "Rugezi Marsh", location: 'Burera', locationKey: 'Musanze',
    image: safariImg,
    desc: "Akabiriziro kizwi cyane mu Rwanda, harimo inyamaswa.",
    lat: -1.45, lng: 29.85, era: 'pre-colonial',
  },
  {
    // Card 28 -- Gatagara Crafts Village
    category: 'Rusange', catKey: 'crafts',
    title: "Gatagara Crafts Village", location: 'Huye', locationKey: 'Gitarama',
    image: weavingImg,
    desc: "Umujyi w'ibintu byahindutse, harimo imigongo n'ibindi byanditswe.",
    lat: -2.55, lng: 29.70, era: 'post-1994',
  },
  {
    // Card 29 -- Huye Mountain
    category: 'Ibyitangira Cyumweru', catKey: 'wildlife',
    title: "Huye Mountain", location: 'Huye', locationKey: 'Gitarama',
    image: imigongoImg,
    desc: "Umusozi ukomeye mu Rwanda, harimo imirima.",
    lat: -2.60, lng: 29.75, era: 'pre-colonial',
  },
  {
    // Card 30 -- Rusumo Falls
    category: 'Ibyitangira Cyumweru', catKey: 'lakes',
    title: "Rusumo Falls", location: 'Rusumo', locationKey: 'Kayonza',
    image: safariImg,
    desc: "Imirima y'ibisura, yabera mu Rusumo.",
    lat: -2.39, lng: 30.78, era: 'pre-colonial',
  },
  {
    // Card 31 -- Amahoro National Stadium
    category: 'Ubwenge', catKey: 'architecture',
    title: "Amahoro National Stadium", location: 'Kigali', locationKey: 'Kigali',
    image: imigongoImg,
    desc: "Ikibuga kizwi cyane mu Rwanda, cyuzuye amateka n'ibintu bikomeye.",
    lat: -1.94, lng: 30.07, era: 'post-1994',
  },
  {
    // Card 32 -- Rwanda Art Museum
    category: 'Ubwenge', catKey: 'art',
    title: "Rwanda Art Museum", location: 'Kigali', locationKey: 'Kigali',
    image: imigongoImg,
    desc: "Ihaha ry'imigongo n'ibindi by'ubwenge.",
    lat: -1.93, lng: 30.08, era: 'post-1994',
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
  // If the API responds in time, MERGE the real data in by title instead
  // of replacing the whole list, so items the DB doesn't know about yet
  // don't get wiped out.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // give up after 5s

    fetch(apiUrl('/api/heritage'), { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const apiMapped = data.items.map((item, index) => {
            const mapped = mapHeritageApiItem(item, index, fallbackImages, withSafeCoordinates);
            // First try commons cache, then overrides
            if (commonsImagesCached[mapped.title]) {
              mapped.image = commonsImagesCached[mapped.title];
            } else if (IMAGE_OVERRIDES[mapped.title]) {
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
      || (item.title || '').toLowerCase().includes(query)
      || (item.desc || '').toLowerCase().includes(query)
      || (item.category || '').toLowerCase().includes(query)
      || (item.location || '').toLowerCase().includes(query);
    return regionMatch && eraMatch && placeMatch && searchMatch;
  });

  // True when any filter differs from its default — drives the "Clear filters" control.
  const hasActiveFilters =
    activeRegion !== t('explore.allRegions') ||
    activePlace !== 'all' ||
    activeEras.length > 0 ||
    topbarSearch.trim() !== '';

  const clearAllFilters = useCallback(() => {
    setActiveRegion(t('explore.allRegions'));
    setActivePlace('all');
    setActiveEras([]);
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

  // Apply language-based translation to card fields at render time
  const localizedSortedItems = useMemo(() =>
    sortedItems.map(entry => ({
      ...entry,
      item: localizeItem(entry.item, language),
    })),
    [sortedItems, language]
  );

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
    trackView({
      type: 'Article',
      itemId: item.id,
      title: item.title,
      image: commonsImagesCached[item.title] || item.image || '',
      category: item.category || '',
      location: item.location || '',
    });
  }, []);

  const handleCardImageError = useCallback((title) => {
    setImageLoadErrors(prev => ({ ...prev, [title]: true }));
  }, []);

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
                  onClick={() => handleRegionChange(region)}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">{t('explore.places')}</span>
            <div className="filter-chips">
               {visiblePlaces.map((place) => (
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

          {hasActiveFilters && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={clearAllFilters}
            >
              <X size={13} aria-hidden="true" />
              {tf('explore.clearFilters', 'Clear filters')}
            </button>
          )}
        </div>

        <div className="archive-grid">
          {localizedSortedItems.length === 0 ? (
            <div className="archive-empty-state">
              <img
                src={notFoundImg}
                alt=""
                aria-hidden="true"
                className="archive-empty-illustration"
              />
              <h3 className="archive-empty-title">
                {tf('explore.noResultsTitle', 'No heritage sites match your search.')}
              </h3>
              <p className="archive-empty-desc">
                {tf('explore.noResultsDescLine1', "We couldn't find any results for the selected filters.")}
                <br />
                {tf(
                  'explore.noResultsDescLine2',
                  "Try adjusting your filters or explore other stories from Rwanda's rich cultural heritage."
                )}
              </p>
              <button type="button" className="archive-empty-clear-btn" onClick={clearAllFilters}>
                <RefreshCw size={14} aria-hidden="true" />
                {tf('explore.clearFilters', 'Clear filters')}
              </button>
            </div>
          ) : (
            localizedSortedItems.map(({ item, index, isCompleted, isAudio }) => (
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
                        src={commonsImagesCached[item.title] || item.image}
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
                    <div onClick={(e) => e.stopPropagation()}>
                      <ReportButton 
                        itemType="heritage" 
                        itemId={item.id || item.title}
                        itemTitle={item.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
              showPanel={true}
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