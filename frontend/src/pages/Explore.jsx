import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import './Explore.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import nyanzaImg from '../assets/explore/nyanza.jpg';
import buhangaImg from '../assets/explore/buhanga.jpg';
import intoreImg from '../assets/explore/intore2.jpg';
import weavingImg from '../assets/explore/weaving_agaseke.jpg';
import imigongoImg from '../assets/explore/imigongo.jpg';
import artifactImg from '../assets/explore/artifact.jpg';

const fallbackImages = [nyanzaImg, buhangaImg, intoreImg, weavingImg, imigongoImg, artifactImg];
const RWANDA_CENTER = [-1.940, 30.062];
const COMPLETED_STORIES_KEY = 'umuco_completed_story_ids';

// Shown immediately — API data replaces these in the background
const FALLBACK_ITEMS = [
  {
    category: 'Architecture', catKey: 'architecture',
    title: "The King's Palace", location: 'Nyanza', locationKey: 'Nyanza',
    image: nyanzaImg,
    desc: 'Discover the majestic dome-shaped structures that served as the heart of pre-colonial Rwanda.',
    lat: -2.358, lng: 29.546,
  },
  {
    category: 'History', catKey: 'history',
    title: 'Buhanga Eco-Park', location: 'Musanze', locationKey: 'Musanze',
    image: buhangaImg,
    desc: 'An ancient forest where kings were consecrated, preserving both the ecological and spiritual heritage of the nation.',
    lat: -1.507, lng: 29.632,
  },
  {
    category: 'Performance', catKey: 'performance',
    title: 'Intore Rituals', location: 'National', locationKey: 'National',
    image: intoreImg,
    desc: 'The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.',
    lat: -1.970, lng: 30.104,
  },
  {
    category: 'Crafts', catKey: 'crafts',
    title: 'Agaseke Weaving', location: 'Gitarama', locationKey: 'Gitarama',
    image: weavingImg,
    desc: 'The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed down through generations.',
    lat: -2.073, lng: 29.752,
  },
  {
    category: 'Art', catKey: 'art',
    title: 'Imigongo Geometry', location: 'Kibungo', locationKey: 'Kibungo',
    image: imigongoImg,
    desc: 'Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.',
    lat: -2.237, lng: 30.456,
  },
  {
    category: 'Artifacts', catKey: 'artifacts',
    title: 'Earthenware Legacy', location: 'Rubavu', locationKey: 'Rubavu',
    image: artifactImg,
    desc: 'Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.',
    lat: -1.703, lng: 29.270,
  },
];

const toCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const hasValidCoordinates = (item) => (
  toCoordinate(item?.lat) !== null && toCoordinate(item?.lng) !== null
);

const withSafeCoordinates = (item) => ({
  ...item,
  lat: toCoordinate(item.lat),
  lng: toCoordinate(item.lng),
});

const getStoryId = (item) => String(item?.id || item?.title || item?.location || '');

export default function Explore() {
  const { t } = useLanguage();
  const { awardXP } = useGamificationContext();
  const { user } = useAuth();
  const [activeRegion, setActiveRegion] = useState(t('explore.allRegions'));
  const [activeEras, setActiveEras] = useState([]);
  const [activePlace, setActivePlace] = useState(t('explore.allPlaces'));
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [heritageItems, setHeritageItems] = useState(FALLBACK_ITEMS);
  const [audioItems, setAudioItems] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [completedStoryIds, setCompletedStoryIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(COMPLETED_STORIES_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

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
    t('explore.allPlaces'),
    t('explore.nyanza'),
    t('explore.musanze'),
    t('explore.kibungo'),
    t('explore.gitarama'),
    t('explore.rubavu'),
  ];

  // Background fetch — cards are already visible from FALLBACK_ITEMS.
  // If the API responds in time, silently swap in the real data.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // give up after 5s

    fetch('http://localhost:5000/api/heritage', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          setHeritageItems(data.items.map((item, index) => withSafeCoordinates({
            ...item,
            catKey: item.category.toLowerCase().replace(/\s+/g, ''),
            locationKey: item.location,
            image: fallbackImages[index % fallbackImages.length],
            desc: item.description,
          })));
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
        awardXP(10, 'story_started').catch(() => {});
      }
    } catch {
      localStorage.removeItem('pendingStoryRead');
    }
  }, [heritageItems]);

  const isMusicExplorer = (user?.explorerType || user?.explorer_type) === 'music-explorer';

  const toggleEra = (era) => {
    setActiveEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  const filteredHeritageItems = heritageItems.filter(item => {
    const regionMatch = activeRegion === t('explore.allRegions');
    const eraMatch = activeEras.length === 0;
    const placeMatch = activePlace === t('explore.allPlaces') || item.locationKey === activePlace;
    return regionMatch && eraMatch && placeMatch;
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

  const sortedItems = useMemo(() => (
    combinedItems
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return a.index - b.index;
      })
  ), [combinedItems]);

  const mappableItems = heritageItems.filter(hasValidCoordinates);

  const [awardedItems, setAwardedItems] = useState(new Set());
  const [selectedStory, setSelectedStory] = useState(null);

  const handleCardClick = useCallback((item) => {
    if (!awardedItems.has(item.title)) {
      awardXP(20, `Explored heritage: ${item.title}`);
      setAwardedItems(prev => new Set([...prev, item.title]));
    }
    setMapVisible(true);
    if (hasValidCoordinates(item)) {
      setSelectedMarker(item);
      setTimeout(() => {
        const mapElement = document.querySelector('.leaflet-container');
        if (mapElement && window.leafletMap) {
          window.leafletMap.setView([item.lat, item.lng], 10);
        }
      }, 100);
    } else {
      setSelectedMarker(null);
    }
  }, [awardedItems, awardXP]);

  const handleReadMore = useCallback((e, item) => {
    e.stopPropagation(); // don't trigger map logic
    awardXP(10, 'story_started').catch(() => {});
    setSelectedStory(item);
  }, [awardXP]);

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

  const mapCenter = selectedMarker && hasValidCoordinates(selectedMarker)
    ? [selectedMarker.lat, selectedMarker.lng]
    : RWANDA_CENTER;

  return (
    <Layout searchPlaceholder={t('search.placeholder')}>
      <div className="explore-page">
        <h1>{t('explore.title')}</h1>

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
                  key={place}
                  className={`filter-chip ${activePlace === place ? 'active' : ''}`}
                  onClick={() => setActivePlace(place)}
                >
                  {place}
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
              style={{ cursor: 'pointer' }}
            >
              <div className="heritage-img-wrap">
                <span className={`heritage-card-category cat-${item.catKey}`}>
                  {isAudio ? '🎵 ' : ''}{item.category}
                </span>
                {isCompleted && !isAudio && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      zIndex: 2,
                      borderRadius: 999,
                      background: 'rgba(253,251,247,0.94)',
                      color: '#2F6B3D',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '4px 9px',
                      boxShadow: '0 6px 18px rgba(44,26,20,0.16)',
                    }}
                  >
                    Read
                  </span>
                )}
                {isAudio && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      zIndex: 2,
                      borderRadius: 999,
                      background: 'rgba(253,251,247,0.94)',
                      color: '#1F7A8C',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '4px 9px',
                      boxShadow: '0 6px 18px rgba(44,26,20,0.16)',
                    }}
                  >
                    🎧 Listen
                  </span>
                )}
                {isAudio ? (
                  <div
                    className="heritage-card-image"
                    style={{
                      height: 230,
                      background: 'linear-gradient(135deg, #1F7A8C 0%, #134A56 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                    }}
                  >
                    🎵
                  </div>
                ) : (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="heritage-card-image"
                  />
                )}
              </div>
              <div className="heritage-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="heritage-card-title">{item.title}</h3>
                  <span className="heritage-card-location">{item.location}</span>
                </div>
                <p className="heritage-card-desc">{item.desc}</p>
                {isAudio ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedAudio(item); }}
                    style={{
                      marginTop: '0.5rem', background: '#1F7A8C', border: 'none',
                      cursor: 'pointer', color: '#fff', fontWeight: 700,
                      fontSize: '0.8rem', padding: '0.5rem 1rem',
                      borderRadius: 8,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    ▶ Play Audio
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleReadMore(e, item)}
                    style={{
                      marginTop: '0.5rem', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#8D493A', fontWeight: 700,
                      fontSize: '0.8rem', padding: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Read More →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="discover-more-wrap">
          <button className="discover-btn" onClick={() => setMapVisible(!mapVisible)}>
            {mapVisible ? 'Hide Map' : t('explore.map')}
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: mapVisible ? 'rotate(180deg)' : 'none' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {mapVisible && (
          <div className="map-section">
            <div className="map-container">
              <MapContainer 
                center={mapCenter} 
                zoom={selectedMarker && hasValidCoordinates(selectedMarker) ? 10 : 8} 
                style={{ height: '100%', width: '100%' }}
                ref={(map) => { if (map) window.leafletMap = map; }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mappableItems.map((item, i) => (
                  <Marker key={i} position={[item.lat, item.lng]}>
                    <Popup>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontWeight: '700' }}>{item.title}</h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.location}</p>
                        <p style={{ margin: '0', fontSize: '0.85rem' }}>{item.desc}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
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
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1F7A8C', marginBottom: 4 }}>
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
                ✕
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
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6F5B55', fontSize: '0.9rem', background: 'rgba(31,122,140,0.06)', borderRadius: 12 }}>
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
