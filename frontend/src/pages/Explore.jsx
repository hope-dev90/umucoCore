import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
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
  const [activeRegion, setActiveRegion] = useState(t('explore.allRegions'));
  const [activeEras, setActiveEras] = useState([]);
  const [activePlace, setActivePlace] = useState(t('explore.allPlaces'));
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [heritageItems, setHeritageItems] = useState(FALLBACK_ITEMS);
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

  const toggleEra = (era) => {
    setActiveEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  const filteredItems = heritageItems.filter(item => {
    const regionMatch = activeRegion === t('explore.allRegions');
    const eraMatch = activeEras.length === 0;
    const placeMatch = activePlace === t('explore.allPlaces') || item.locationKey === activePlace;
    return regionMatch && eraMatch && placeMatch;
  });

  const sortedItems = useMemo(() => (
    filteredItems
      .map((item, index) => ({ item, index, isCompleted: completedStoryIds.has(getStoryId(item)) }))
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return a.index - b.index;
      })
  ), [completedStoryIds, filteredItems]);

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
          {sortedItems.map(({ item, index, isCompleted }) => (
            <div 
              key={getStoryId(item) || index} 
              className="heritage-card"
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="heritage-img-wrap">
                <span className={`heritage-card-category cat-${item.catKey}`}>
                  {item.category}
                </span>
                {isCompleted && (
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
                <img
                  src={item.image}
                  alt={item.title}
                  className="heritage-card-image"
                />
              </div>
              <div className="heritage-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="heritage-card-title">{item.title}</h3>
                  <span className="heritage-card-location">{item.location}</span>
                </div>
                <p className="heritage-card-desc">{item.desc}</p>
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
    </Layout>
  );
}
