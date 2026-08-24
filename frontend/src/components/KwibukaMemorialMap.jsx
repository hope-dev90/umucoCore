import React, { useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import memorialData from '../data/genocideMemorialSites.json';
import siteImages from '../data/memorialSiteImages.json';
import { useLanguage } from '../contexts/LanguageContext';
import './KwibukaMemorialMap.css';

// ── constants ─────────────────────────────────────────────────────────────────

const RWANDA_BOUNDS = [
  [-2.95, 28.75],
  [-1.0, 30.95],
];

const TYPE_COLORS = {
  national:   '#8D493A',
  church:     '#5C4033',
  resistance: '#3E2723',
  other:      '#6F5B55',
};

// Multilingual UI strings — matches the MAP_STRINGS pattern in HeritageMap.jsx
const KMM_STRINGS = {
  en: {
    placeholder_title:  'Memorial Sites',
    placeholder_text:   'Tap a flame marker or select a site from the list to view details.',
    get_directions:     'Get Directions',
    type: {
      national:   'National Memorial',
      church:     'Church Memorial',
      resistance: 'Resistance Memorial',
      other:      'Memorial Site',
    },
    established: 'Est.',
  },
  fr: {
    placeholder_title:  'Sites mémoriaux',
    placeholder_text:   'Touchez un marqueur ou sélectionnez un site dans la liste pour voir les détails.',
    get_directions:     'Itinéraire',
    type: {
      national:   'Mémorial national',
      church:     'Mémorial d\'église',
      resistance: 'Mémorial de résistance',
      other:      'Site mémoriel',
    },
    established: 'Fondé en',
  },
  rw: {
    placeholder_title:  'Inzu z\'Urwibutso',
    placeholder_text:   'Kanda ku kibondo cy\'amaraso cyangwa hitamo ahantu ku rutonde kugirango ubone amakuru.',
    get_directions:     'Inzira',
    type: {
      national:   'Urwibutso rw\'Igihugu',
      church:     'Urwibutso rw\'Itorero',
      resistance: 'Urwibutso bw\'Ubutwari',
      other:      'Ahantu h\'Urwibutso',
    },
    established: 'Hashyizweho',
  },
};

// ── helpers ───────────────────────────────────────────────────────────────────

function localized(field, lang) {
  if (!field || typeof field === 'string') return field || '';
  return field[lang] || field.en || '';
}

function getSiteImage(siteId) {
  return siteImages.sites?.[siteId]?.image || '';
}

function getSiteAlt(siteId, lang) {
  return siteImages.sites?.[siteId]?.alt?.[lang]
    || siteImages.sites?.[siteId]?.alt?.en
    || '';
}

// ── map sub-components ────────────────────────────────────────────────────────

function FitSites({ sites }) {
  const map = useMap();
  React.useEffect(() => {
    if (!sites.length) return;
    const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds.pad(0.18), { animate: false });
  }, [map, sites]);
  return null;
}

function FlyToSite({ site }) {
  const map = useMap();
  const prevIdRef = React.useRef(null);
  React.useEffect(() => {
    if (!site) return;
    if (site.id === prevIdRef.current) return;
    prevIdRef.current = site.id;
    map.flyTo([site.lat, site.lng], 12, { duration: 0.8 });
  }, [map, site]);
  return null;
}

function createFlameIcon(selected) {
  const size = selected ? 36 : 28;
  const html = `
    <div class="kmm-marker${selected ? ' kmm-marker--active' : ''}" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 120 160" aria-hidden="true">
        <path d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z" fill="currentColor"/>
        <path d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z" fill="currentColor"/>
        <path d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z" fill="currentColor"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: 'kmm-marker-wrap',
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    tooltipAnchor: [0, -size + 4],
  });
}

// ── panel components (mirror HeritageMap PanelItemCard) ───────────────────────

function PanelPlaceholder({ strings }) {
  return (
    <div className="kmm-panel-placeholder">
      <div className="kmm-panel-placeholder-icon">🕯️</div>
      <p className="kmm-panel-placeholder-title">{strings.placeholder_title}</p>
      <p className="kmm-panel-placeholder-text">{strings.placeholder_text}</p>
    </div>
  );
}

function SiteCard({ site, language, strings, onClose }) {
  const imageUrl  = getSiteImage(site.id);
  const altText   = getSiteAlt(site.id, language);
  const name      = localized(site.name,        language);
  const district  = localized(site.district,    language);
  const desc      = localized(site.description, language);
  const typeLabel = strings.type[site.type] || site.type;
  const color     = TYPE_COLORS[site.type] || TYPE_COLORS.other;
  const directionsUrl =
    `https://www.openstreetmap.org/directions?to=${site.lat}%2C${site.lng}`;

  return (
    <div className="kmm-panel-card">
      {/* close button */}
      <button
        className="kmm-panel-close"
        onClick={onClose}
        aria-label="Close"
      >
        &#xd7;
      </button>

      {/* hero image or placeholder gradient */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={altText}
          className="kmm-panel-card-image"
        />
      ) : (
        <div className="kmm-panel-card-image kmm-panel-card-image--placeholder" />
      )}

      <div className="kmm-panel-card-body">
        {/* type pill — mirrors .hm-panel-card-category */}
        <span
          className="kmm-panel-card-category"
          style={{ background: color }}
        >
          {typeLabel}
        </span>

        {/* title */}
        <h3 className="kmm-panel-card-title">{name}</h3>

        {/* district + year */}
        <p className="kmm-panel-card-location">
          📍 {district}
          {site.established
            ? ` · ${strings.established} ${site.established}`
            : ''}
        </p>

        {/* description */}
        {desc && (
          <p className="kmm-panel-card-desc">{desc}</p>
        )}

        {/* directions */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="kmm-panel-directions-btn"
        >
          {strings.get_directions}
        </a>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function KwibukaMemorialMap() {
  const { t, language } = useLanguage();
  const sites  = memorialData.sites;
  const strings = KMM_STRINGS[language] || KMM_STRINGS.en;

  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    () => sites.find((s) => s.id === selectedId) || null,
    [sites, selectedId],
  );

  const handleSelect = (id) => setSelectedId(id);
  const handleClose  = () => setSelectedId(null);

  return (
    <section className="kmm-section" aria-labelledby="kmm-title">
      {/* ── header ── */}
      <div className="kmm-header">
        <div>
          <h2 id="kmm-title" className="kmm-title">
            {t('kwibuka.mapTitle')}
          </h2>
          <p className="kmm-sub">{t('kwibuka.mapSub')}</p>
        </div>
        <div className="kmm-count">
          {t('kwibuka.mapCount', { count: sites.length })}
        </div>
      </div>

      {/* ── map + panel layout ── */}
      <div className="kmm-layout">

        {/* left: leaflet map */}
        <div className="kmm-map-box">
          <MapContainer
            center={[memorialData.center.lat, memorialData.center.lng]}
            zoom={8}
            minZoom={7}
            maxZoom={16}
            maxBounds={RWANDA_BOUNDS}
            maxBoundsViscosity={0.85}
            scrollWheelZoom
            className="kmm-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitSites sites={sites} />
            {selected && <FlyToSite site={selected} />}

            {sites.map((site) => (
              <Marker
                key={site.id}
                position={[site.lat, site.lng]}
                icon={createFlameIcon(site.id === selectedId)}
                eventHandlers={{ click: () => handleSelect(site.id) }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  {localized(site.name, language)}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* right: scrollable list + panel card */}
        <aside className="kmm-sidebar">

          {/* scrollable site list */}
          <ul className="kmm-list">
            {sites.map((site) => {
              const active = site.id === selectedId;
              return (
                <li key={site.id}>
                  <button
                    type="button"
                    className={`kmm-list-item${active ? ' is-active' : ''}`}
                    onClick={() => handleSelect(site.id)}
                    style={{ '--kmm-type': TYPE_COLORS[site.type] || TYPE_COLORS.other }}
                  >
                    <span className="kmm-list-name">
                      {localized(site.name, language)}
                    </span>
                    <span className="kmm-list-meta">
                      {localized(site.district, language)}
                      {' · '}
                      {strings.type[site.type] || site.type}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* detail panel — hm-panel-card style */}
          <div className="kmm-panel-area">
            {selected ? (
              <SiteCard
                site={selected}
                language={language}
                strings={strings}
                onClose={handleClose}
              />
            ) : (
              <PanelPlaceholder strings={strings} />
            )}
          </div>

        </aside>
      </div>
    </section>
  );
}
