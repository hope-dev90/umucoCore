import React, { useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import memorialData from '../data/genocideMemorialSites.json';
import { useLanguage } from '../contexts/LanguageContext';
import './KwibukaMemorialMap.css';

const RWANDA_BOUNDS = [
  [-2.95, 28.75],
  [-1.0, 30.95],
];

const TYPE_COLORS = {
  national: '#8D493A',
  church: '#5C4033',
  resistance: '#3E2723',
  other: '#6F5B55',
};

function localized(field, lang) {
  if (!field || typeof field === 'string') return field || '';
  return field[lang] || field.en || '';
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
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    tooltipAnchor: [0, -size + 4],
  });
}

function FitSites({ sites }) {
  const map = useMap();
  React.useEffect(() => {
    if (!sites.length) return;
    const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds.pad(0.18), { animate: false });
  }, [map, sites]);
  return null;
}

function FlyToSite({ site, enabled }) {
  const map = useMap();
  const readyRef = React.useRef(false);
  React.useEffect(() => {
    if (!site || !enabled) return;
    if (!readyRef.current) {
      readyRef.current = true;
      return;
    }
    map.flyTo([site.lat, site.lng], 12, { duration: 0.8 });
  }, [map, site, enabled]);
  return null;
}

export default function KwibukaMemorialMap() {
  const { t, language } = useLanguage();
  const sites = memorialData.sites;
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    () => sites.find((s) => s.id === selectedId) || null,
    [sites, selectedId]
  );

  const typeLabel = (type) => t(`kwibuka.map.type.${type}`) || type;

  return (
    <section className="kmm-section" aria-labelledby="kmm-title">
      <div className="kmm-header">
        <div>
          <h2 id="kmm-title" className="kmm-title">{t('kwibuka.mapTitle')}</h2>
          <p className="kmm-sub">{t('kwibuka.mapSub')}</p>
        </div>
        <div className="kmm-count">
          {t('kwibuka.mapCount', { count: sites.length })}
        </div>
      </div>

      <div className="kmm-layout">
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
            <FlyToSite site={selected} />
            {sites.map((site) => (
              <Marker
                key={site.id}
                position={[site.lat, site.lng]}
                icon={createFlameIcon(site.id === selectedId)}
                eventHandlers={{ click: () => setSelectedId(site.id) }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  {localized(site.name, language)}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="kmm-sidebar">
          <ul className="kmm-list">
            {sites.map((site) => {
              const active = site.id === selectedId;
              return (
                <li key={site.id}>
                  <button
                    type="button"
                    className={`kmm-list-item${active ? ' is-active' : ''}`}
                    onClick={() => setSelectedId(site.id)}
                    style={{ '--kmm-type': TYPE_COLORS[site.type] || TYPE_COLORS.other }}
                  >
                    <span className="kmm-list-name">{localized(site.name, language)}</span>
                    <span className="kmm-list-meta">
                      {localized(site.district, language)} · {typeLabel(site.type)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected && (
            <div className="kmm-detail">
              <div className="kmm-detail-type">{typeLabel(selected.type)}</div>
              <h3 className="kmm-detail-title">{localized(selected.name, language)}</h3>
              <p className="kmm-detail-district">
                {localized(selected.district, language)}
                {selected.established ? ` · ${selected.established}` : ''}
              </p>
              <p className="kmm-detail-desc">{localized(selected.description, language)}</p>
              <a
                className="kmm-directions"
                href={`https://www.openstreetmap.org/directions?to=${selected.lat}%2C${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('kwibuka.mapDirections')}
              </a>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
