import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Explore.css';
import nyanzaImg from '../assets/explore/nyanza.jpg';
import buhangaImg from '../assets/explore/buhanga.jpg';
import intoreImg from '../assets/explore/intore2.jpg';
import weavingImg from '../assets/explore/weaving_agaseke.jpg';
import imigongoImg from '../assets/explore/imigongo.jpg';
import artifactImg from '../assets/explore/artifact.jpg';


const regions = ['All Regions', 'North', 'South', 'East', 'West', 'Kigali'];
const eras = ['Pre-colonial', 'Colonial', 'Post-1994'];

const heritageItems = [
  {
    category: 'Architecture',
    catKey: 'architecture',
    title: "The King's Palace",
    location: 'Nyanza',
    image: nyanzaImg,
    desc: 'Discover the majestic dome-shaped structures that served as the heart of pre-colonial...',
    bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
  },
  {
    category: 'History',
    catKey: 'history',
    title: 'Buhanga Eco-Park',
    location: 'Musanze',
    image: buhangaImg,
    desc: 'An ancient forest where kings were consecrated, preserving both the ecological and spiritual heritage of the nation.',
    bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
  },
  {
    category: 'Performance',
    catKey: 'performance',
    title: 'Intore Rituals',
    location: 'National',
    image: intoreImg,
    desc: 'The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.',
    bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
  },
  {
    category: 'Crafts',
    catKey: 'crafts',
    title: 'Agaseke Weaving',
    location: 'Gitarama',
    image: weavingImg,
    desc: 'The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed down through generations.',
    bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
  },
  {
    category: 'Art',
    catKey: 'art',
    title: 'Imigongo Geometry',
    location: 'Kibungo',
    image: imigongoImg,
    desc: "Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.",
    bg: 'linear-gradient(160deg,var(--primary-dark) 0%,var(--primary-dark) 100%)',
  },
  {
    category: 'Artifacts',
    catKey: 'artifacts',
    title: 'Earthenware Legacy',
    location: 'Rubavu',
    desc: 'Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.',
    image: artifactImg,
    bg: 'linear-gradient(160deg,var(--primary) 0%,var(--primary-dark) 100%)',
  },
];

export default function Explore() {
  const [activeRegion, setActiveRegion] = useState('All Regions');
  const [activeEras, setActiveEras] = useState([]);

  const toggleEra = (era) => {
    setActiveEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  return (
    <Layout searchPlaceholder="Search heritage, sites, or traditions...">
      <div className="explore-page">
        <h1>Explore the Archive</h1>

        <div className="filter-bar">
          <div className="filter-row">
            <span className="filter-label">Regions</span>
            <div className="filter-chips">
              {regions.map(r => (
                <button
                  key={r}
                  className={`filter-chip ${activeRegion === r ? 'active' : ''}`}
                  onClick={() => setActiveRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">Eras</span>
            <div className="filter-chips">
              {eras.map(e => (
                <button
                  key={e}
                  className={`filter-chip ${activeEras.includes(e) ? 'active' : ''}`}
                  onClick={() => toggleEra(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="archive-grid">
          {heritageItems.map((item, i) => (
            <div key={i} className="heritage-card">

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
          <button className="discover-btn">
            Discover More Heritage
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating buttons */}
      <button className="accessibility-fab"></button>
    </Layout>
  );
}
