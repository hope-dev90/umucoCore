import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
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

export default function Explore() {
  const { t } = useLanguage();
  const [activeRegion, setActiveRegion] = useState(t('explore.allRegions'));
  const [activeEras, setActiveEras] = useState([]);
  const [activePlace, setActivePlace] = useState(t('explore.allPlaces'));
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [heritageItems, setHeritageItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/heritage');
        const data = await response.json();
        
        // If no data from backend, use fallback hardcoded data
        if (data.items && data.items.length > 0) {
          setHeritageItems(data.items.map((item, index) => ({
            ...item,
            category: item.category,
            catKey: item.category.toLowerCase().replace(/\s+/g, ''),
            locationKey: item.location,
            image: fallbackImages[index % fallbackImages.length],
            desc: item.description,
            lat: item.lat,
            lng: item.lng
          })));
        } else {
          // Fallback to hardcoded
          const fallbackItems = [
            {
              category: 'Architecture',
              catKey: 'architecture',
              title: "The King's Palace",
              location: 'Nyanza',
              locationKey: t('explore.nyanza'),
              image: nyanzaImg,
              desc: 'Discover the majestic dome-shaped structures that served as the heart of pre-colonial...',
              bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
              lat: -2.358,
              lng: 29.546,
            },
            {
              category: 'History',
              catKey: 'history',
              title: 'Buhanga Eco-Park',
              location: 'Musanze',
              locationKey: t('explore.musanze'),
              image: buhangaImg,
              desc: 'An ancient forest where kings were consecrated, preserving both the ecological and spiritual heritage of the nation.',
              bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
              lat: -1.507,
              lng: 29.632,
            },
            {
              category: 'Performance',
              catKey: 'performance',
              title: 'Intore Rituals',
              location: 'National',
              locationKey: 'National',
              image: intoreImg,
              desc: 'The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.',
              bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
              lat: -1.970,
              lng: 30.104,
            },
            {
              category: 'Crafts',
              catKey: 'crafts',
              title: 'Agaseke Weaving',
              location: 'Gitarama',
              locationKey: t('explore.gitarama'),
              image: weavingImg,
              desc: 'The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed down through generations.',
              bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
              lat: -2.073,
              lng: 29.752,
            },
            {
              category: 'Art',
              catKey: 'art',
              title: 'Imigongo Geometry',
              location: 'Kibungo',
              locationKey: t('explore.kibungo'),
              image: imigongoImg,
              desc: "Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.",
              bg: 'linear-gradient(160deg,var(--primary-dark) 0%,var(--primary-dark) 100%)',
              lat: -2.237,
              lng: 30.456,
            },
            {
              category: 'Artifacts',
              catKey: 'artifacts',
              title: 'Earthenware Legacy',
              location: 'Rubavu',
              locationKey: t('explore.rubavu'),
              desc: 'Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.',
              image: artifactImg,
              bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
              lat: -1.703,
              lng: 29.270,
            },
          ];
          setHeritageItems(fallbackItems);
        }
      } catch (err) {
        console.error("Error fetching heritage items:", err);
        // Fallback to hardcoded data
        const fallbackItems = [
          {
            category: 'Architecture',
            catKey: 'architecture',
            title: "The King's Palace",
            location: 'Nyanza',
            locationKey: t('explore.nyanza'),
            image: nyanzaImg,
            desc: 'Discover the majestic dome-shaped structures that served as the heart of pre-colonial...',
            bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
            lat: -2.358,
            lng: 29.546,
          },
          {
            category: 'History',
            catKey: 'history',
            title: 'Buhanga Eco-Park',
            location: 'Musanze',
            locationKey: t('explore.musanze'),
            image: buhangaImg,
            desc: 'An ancient forest where kings were consecrated, preserving both the ecological and spiritual heritage of the nation.',
            bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
            lat: -1.507,
            lng: 29.632,
          },
          {
            category: 'Performance',
            catKey: 'performance',
            title: 'Intore Rituals',
            location: 'National',
            locationKey: 'National',
            image: intoreImg,
            desc: 'The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.',
            bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
            lat: -1.970,
            lng: 30.104,
          },
          {
            category: 'Crafts',
            catKey: 'crafts',
            title: 'Agaseke Weaving',
            location: 'Gitarama',
            locationKey: t('explore.gitarama'),
            image: weavingImg,
            desc: 'The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed down through generations.',
            bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
            lat: -2.073,
            lng: 29.752,
          },
          {
            category: 'Art',
            catKey: 'art',
            title: 'Imigongo Geometry',
            location: 'Kibungo',
            locationKey: t('explore.kibungo'),
            image: imigongoImg,
            desc: "Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.",
            bg: 'linear-gradient(160deg,var(--primary-dark) 0%,var(--primary-dark) 100%)',
            lat: -2.237,
            lng: 30.456,
          },
          {
            category: 'Artifacts',
            catKey: 'artifacts',
            title: 'Earthenware Legacy',
            location: 'Rubavu',
            locationKey: t('explore.rubavu'),
            desc: 'Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.',
            image: artifactImg,
            bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
            lat: -1.703,
            lng: 29.270,
          },
        ];
        setHeritageItems(fallbackItems);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

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

  const handleCardClick = (item) => {
    setMapVisible(true);
    setSelectedMarker(item);
    // Small timeout to allow map to render before focusing
    setTimeout(() => {
      const mapElement = document.querySelector('.leaflet-container');
      if (mapElement && window.leafletMap) {
        window.leafletMap.setView([item.lat, item.lng], 10);
      }
    }, 100);
  };

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
          {filteredItems.map((item, i) => (
            <div 
              key={i} 
              className="heritage-card"
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="heritage-img-wrap">
                <span className={`heritage-card-category cat-${item.catKey}`}>
                  {item.category}
                </span>
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
                center={selectedMarker ? [selectedMarker.lat, selectedMarker.lng] : [-1.940, 30.062]} 
                zoom={selectedMarker ? 10 : 8} 
                style={{ height: '100%', width: '100%' }}
                ref={(map) => { if (map) window.leafletMap = map; }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {heritageItems.map((item, i) => (
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
    </Layout>
  );
}
