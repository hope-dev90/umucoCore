import React, { useCallback, useMemo, useRef, useState } from 'react';
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

const MIN_ZOOM = 7;
const MAX_ZOOM = 16;

const TYPE_COLORS = {
  national: '#8D493A',
  church: '#5C4033',
  resistance: '#3E2723',
  other: '#6F5B55',
};

// Multilingual UI strings — matches the MAP_STRINGS pattern in HeritageMap.jsx
const KMM_STRINGS = {
  en: {
    placeholder_title: 'Memorial Sites',
    placeholder_text: 'Tap a flame marker or select a site from the list to view details.',
    get_directions: 'Get Directions',
    type: {
      national: 'National Memorial',
      church: 'Church Memorial',
      resistance: 'Resistance Memorial',
      other: 'Memorial Site',
    },
    established: 'Est.',
  },
  fr: {
    placeholder_title: 'Sites mémoriaux',
    placeholder_text: 'Touchez un marqueur ou sélectionnez un site dans la liste pour voir les détails.',
    get_directions: 'Itinéraire',
    type: {
      national: 'Mémorial national',
      church: "Mémorial d'église",
      resistance: 'Mémorial de résistance',
      other: 'Site mémoriel',
    },
    established: 'Fondé en',
  },
  rw: {
    placeholder_title: "Inzu z'Urwibutso",
    placeholder_text: "Kanda ku kibondo cy'amaraso cyangwa hitamo ahantu ku rutonde kugirango ubone amakuru.",
    get_directions: 'Inzira',
    type: {
      national: "Urwibutso rw'Igihugu",
      church: "Urwibutso rw'Itorero",
      resistance: 'Urwibutso bw\'Ubutwari',
      other: "Ahantu h'Urwibutso",
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
  return siteImages.sites?.[siteId]?.alt?.[lang] || siteImages.sites?.[siteId]?.alt?.en || '';
}

function getMarkerColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.other;
}

// ── map sub-components ────────────────────────────────────────────────────────

function FitSites(props) {
  const sites = props.sites;
  const map = useMap();
  React.useEffect(function () {
    if (!sites.length) return;
    const bounds = L.latLngBounds(sites.map(function (s) { return [s.lat, s.lng]; }));
    map.fitBounds(bounds.pad(0.18), { animate: false });
  }, [map, sites]);
  return null;
}

function FlyToSite(props) {
  const site = props.site;
  const map = useMap();
  const prevIdRef = useRef(null);

  React.useEffect(function () {
    if (!site) return;
    if (site.id === prevIdRef.current) return;
    prevIdRef.current = site.id;
    map.flyTo([site.lat, site.lng], Math.max(map.getZoom(), 12), { duration: 0.9 });
  }, [map, site]);

  return null;
}

function createFlameIcon(site, isSelected) {
  const color = getMarkerColor(site.type);
  const pulseClass = isSelected ? ' kmm-marker-pulse' : '';
  const html =
    '<div class="kmm-marker' + pulseClass + '" style="--kmm-marker-color:' + color + '">' +
    '<svg viewBox="0 0 120 160" aria-hidden="true">' +
    '<path d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z" fill="currentColor"/>' +
    '<path d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z" fill="currentColor"/>' +
    '<path d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z" fill="currentColor"/>' +
    '</svg></div>';

  return L.divIcon({
    html: html,
    className: 'kmm-marker-wrap',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    tooltipAnchor: [0, -26],
  });
}

// ── panel components (mirror HeritageMap PanelPlaceholder / PanelItemCard) ───

function PanelPlaceholder(props) {
  const strings = props.strings;
  return (
    <div className="kmm-panel-placeholder">
      <div className="kmm-panel-placeholder-icon">🕯️</div>
      <p className="kmm-panel-placeholder-title">{strings.placeholder_title}</p>
      <p className="kmm-panel-placeholder-text">{strings.placeholder_text}</p>
    </div>
  );
}

function SiteCard(props) {
  const site = props.site;
  const language = props.language;
  const strings = props.strings;
  const onClose = props.onClose;

  const imageUrl = getSiteImage(site.id);
  const altText = getSiteAlt(site.id, language);
  const name = localized(site.name, language);
  const district = localized(site.district, language);
  const desc = localized(site.description, language);
  const typeLabel = strings.type[site.type] || site.type;
  const color = getMarkerColor(site.type);
  const directionsUrl = 'https://www.openstreetmap.org/directions?to=' + site.lat + ',' + site.lng;

  return (
    <div className="kmm-panel-card">
      <button className="kmm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>

      {imageUrl ? (
        <img src={imageUrl} alt={altText} className="kmm-panel-card-image" />
      ) : (
        <div className="kmm-panel-card-image kmm-panel-card-image--placeholder" />
      )}

      <div className="kmm-panel-card-body">
        <span className="kmm-panel-card-category" style={{ background: color }}>
          {typeLabel}
        </span>

        <h3 className="kmm-panel-card-title">{name}</h3>

        <p className="kmm-panel-card-location">
          {'\ud83d\udccd '}{district}
          {site.established ? ' \u00b7 ' + strings.established + ' ' + site.established : ''}
        </p>

        {desc ? <p className="kmm-panel-card-desc">{desc}</p> : null}

        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="kmm-panel-directions-btn">
          {strings.get_directions}
        </a>
      </div>
    </div>
  );
}

function CustomZoomControl() {
  const map = useMap();
  const zoomIn = useCallback(function () { map.zoomIn(); }, [map]);
  const zoomOut = useCallback(function () { map.zoomOut(); }, [map]);

  return (
    <div className="kmm-zoom-control">
      <button type="button" className="kmm-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
      <div className="kmm-zoom-divider" />
      <button type="button" className="kmm-zoom-btn" onClick={zoomOut} aria-label="Zoom out">{'\u2212'}</button>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function KwibukaMemorialMap() {
  const { t, language } = useLanguage();
  const sites = memorialData.sites;
  const strings = KMM_STRINGS[language] || KMM_STRINGS.en;

  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    function () { return sites.find(function (s) { return s.id === selectedId; }) || null; },
    [sites, selectedId]
  );

  const handleSelect = useCallback(function (id) { setSelectedId(id); }, []);
  const handleClose = useCallback(function () { setSelectedId(null); }, []);

  return (
    <section className="kmm-section" aria-labelledby="kmm-title">
      <div className="kmm-header">
        <div>
          <h2 id="kmm-title" className="kmm-title">{t('kwibuka.mapTitle')}</h2>
          <p className="kmm-sub">{t('kwibuka.mapSub')}</p>
        </div>
        <div className="kmm-count">{t('kwibuka.mapCount', { count: sites.length })}</div>
      </div>

      <div className="kmm-layout">
        <div className="kmm-map-box">
          <MapContainer
            center={[memorialData.center.lat, memorialData.center.lng]}
            style={{ height: '100%', width: '100%' }}
            zoom={8}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            maxBounds={RWANDA_BOUNDS}
            maxBoundsViscosity={0.85}
            zoomSnap={0.5}
            zoomDelta={0.5}
            doubleClickZoom={false}
            zoomControl={false}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitSites sites={sites} />
            {selected ? <FlyToSite site={selected} /> : null}

            {sites.map(function (site) {
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={createFlameIcon(site, site.id === selectedId)}
                  eventHandlers={{ click: function () { handleSelect(site.id); } }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95} className="kmm-marker-tooltip">
                    <span>{localized(site.name, language)}</span>
                  </Tooltip>
                </Marker>
              );
            })}

            <CustomZoomControl />
          </MapContainer>
        </div>

        <aside className="kmm-side-panel">
          <ul className="kmm-list">
            {sites.map(function (site) {
              const active = site.id === selectedId;
              return (
                <li key={site.id}>
                  <button
                    type="button"
                    className={'kmm-list-item' + (active ? ' is-active' : '')}
                    onClick={function () { handleSelect(site.id); }}
                    style={{ '--kmm-type': getMarkerColor(site.type) }}
                  >
                    <span className="kmm-list-name">{localized(site.name, language)}</span>
                    <span className="kmm-list-meta">
                      {localized(site.district, language)} {'\u00b7 '}
                      {strings.type[site.type] || site.type}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="kmm-panel-area">
            {selected ? (
              <SiteCard site={selected} language={language} strings={strings} onClose={handleClose} />
            ) : (
              <PanelPlaceholder strings={strings} />
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}