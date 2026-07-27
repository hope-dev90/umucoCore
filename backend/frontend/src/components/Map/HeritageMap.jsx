import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import './HeritageMap.css';
import commonsImageCache from '../../data/commonsImageCache.json';

// Resolve the best available image for a heritage item
function resolveImage(item) {
  if (!item) return '';
  return commonsImageCache[item.title] || (typeof item.image === 'string' ? item.image : '') || '';
}

const RWANDA_CENTER = [-1.940, 30.062];
const RWANDA_BOUNDS = [
  [-2.95, 28.75],
  [-1.00, 30.95],
];
const MIN_ZOOM = 8;
const MAX_ZOOM = 17;

const MARKER_COLORS = {
  architecture: '#8D493A',
  history: '#D09A33',
  performance: '#2F6B3D',
  crafts: '#8D493A',
  art: '#6F4E37',
  artifacts: '#6F42C1',
  wildlife: '#2F6B3D',
  lakes: '#2B6CB0',
  culture: '#6F42C1',
};

function getMarkerBorderColor(catKey) {
  return MARKER_COLORS[catKey] || '#8D493A';
}

function getStoryId(item) {
  return String((item && item.id) || (item && item.title) || (item && item.location) || '');
}

function toCoordinate(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function hasValidCoordinates(item) {
  return toCoordinate(item && item.lat) !== null && toCoordinate(item && item.lng) !== null;
}

function createMarkerIcon(item, isSelected) {
  const color = getMarkerBorderColor(item && item.catKey ? item.catKey : '');
  const pulseClass = isSelected ? ' hm-marker-pulse' : '';
  const imageSrc = resolveImage(item);
  const html = '<div class="hm-marker' + pulseClass + '" style="--hm-marker-color:' + color + '; background-color:' + color + '; background-image:url(\'' + imageSrc + '\')"></div>';

  return L.divIcon({
    html: html,
    className: 'hm-marker-wrapper',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    tooltipAnchor: [0, -38],
  });
}

function FlyToSelected(props) {
  const map = useMap();
  const prevIdRef = useRef(null);

  useEffect(function () {
    const item = props.selectedMarker;
    if (item && hasValidCoordinates(item)) {
      const id = getStoryId(item);
      if (id !== prevIdRef.current) {
        prevIdRef.current = id;
        map.flyTo([item.lat, item.lng], Math.max(map.getZoom(), 12), { duration: 0.9 });
      }
    }
  }, [props.selectedMarker, map]);

  return null;
}

function MapClickHandler(props) {
  const onPick = props.onPick;
  useMapEvents({
    click: function (e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function PanelPlaceholder() {
  return (
    <div className="hm-panel-placeholder">
      <div className="hm-panel-placeholder-icon">🗺️</div>
      <p className="hm-panel-placeholder-title">Explore Rwanda</p>
      <p className="hm-panel-placeholder-text">
        Tap a photo marker to see details, or click anywhere on the map to discover what&apos;s nearby.
      </p>
    </div>
  );
}

function PanelItemCard(props) {
  const item = props.item;
  const onClose = props.onClose;
  const directionsUrl = 'https://www.openstreetmap.org/directions?to=' + item.lat + ',' + item.lng;
  const imageUrl = resolveImage(item);

  return (
    <div className="hm-panel-card">
      <button className="hm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>
      {imageUrl ? (
        <img src={imageUrl} alt={item.title} className="hm-panel-card-image" />
      ) : (
        <div className="hm-panel-card-image hm-panel-card-image--placeholder" />
      )}
      <div className="hm-panel-card-body">
        {item.category ? (
          <span className={'hm-panel-card-category cat-' + (item.catKey || '')}>{item.category}</span>
        ) : null}
        <h3 className="hm-panel-card-title">{item.title}</h3>
        {item.location ? <p className="hm-panel-card-location">{'\ud83d\udccd '}{item.location}</p> : null}
        {item.desc ? <p className="hm-panel-card-desc">{item.desc}</p> : null}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="hm-panel-directions-btn">
          Get Directions
        </a>
      </div>
    </div>
  );
}

function PanelClickResult(props) {
  const popup = props.popup;
  const onClose = props.onClose;

  if (popup.status === 'loading') {
    return (
      <div className="hm-panel-card hm-panel-card--status">
        <button className="hm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>
        <div className="hm-panel-spinner" />
        <p className="hm-panel-status-text">Looking around this spot...</p>
      </div>
    );
  }

  if (popup.status === 'notfound') {
    return (
      <div className="hm-panel-card hm-panel-card--status">
        <button className="hm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>
        <div className="hm-panel-status-icon">🤔</div>
        <p className="hm-panel-status-title">Nothing here yet</p>
        <p className="hm-panel-status-text">
          No heritage site is registered at this exact spot. Try tapping one of the photo markers instead.
        </p>
      </div>
    );
  }

  if (popup.status === 'error') {
    return (
      <div className="hm-panel-card hm-panel-card--status">
        <button className="hm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>
        <div className="hm-panel-status-icon">⚠️</div>
        <p className="hm-panel-status-title">Something went wrong</p>
        <p className="hm-panel-status-text">Please try clicking that spot again.</p>
      </div>
    );
  }

  const loc = popup.location;
  const destLat = parseFloat(loc.lat);
  const destLng = parseFloat(loc.lng);
  const directionsUrl = 'https://www.openstreetmap.org/directions?to=' + destLat + ',' + destLng;

  return (
    <div className="hm-panel-card">
      <button className="hm-panel-close" onClick={onClose} aria-label="Close">{'\u2715'}</button>
      <div className="hm-panel-card-body hm-panel-card-body--no-image">
        <h3 className="hm-panel-card-title">{loc.title}</h3>
        {loc.location ? <p className="hm-panel-card-location">{'\ud83d\udccd '}{loc.location}</p> : null}
        {loc.description ? <p className="hm-panel-card-desc">{loc.description}</p> : null}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="hm-panel-directions-btn">
          Get Directions
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
    <div className="hm-zoom-control">
      <button type="button" className="hm-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
      <div className="hm-zoom-divider" />
      <button type="button" className="hm-zoom-btn" onClick={zoomOut} aria-label="Zoom out">{'\u2212'}</button>
    </div>
  );
}

export default function HeritageMap(props) {
  const items = props.items || [];
  const selectedMarker = props.selectedMarker || null;
  const onMarkerClick = props.onMarkerClick;
  const clickPopup = props.clickPopup || null;
  const onMapPick = props.onMapPick;
  const onClosePanel = props.onClosePanel;
  const mapRef = props.mapRef;
  const showPanel = props.showPanel !== false;

  const [hoveredId, setHoveredId] = useState(null);
  const mappableItems = items.filter(hasValidCoordinates);

  const handlePick = useCallback(function (lat, lng) {
    if (onMapPick) onMapPick(lat, lng);
  }, [onMapPick]);

  const handleClosePanel = useCallback(function () {
    if (onClosePanel) onClosePanel();
  }, [onClosePanel]);

  const markerEls = mappableItems.map(function (item, i) {
    const isSelected = Boolean(selectedMarker && getStoryId(item) === getStoryId(selectedMarker));
    const key = getStoryId(item) || String(i);
    const icon = createMarkerIcon(item, isSelected);

    return (
      <Marker
        key={key}
        position={[item.lat, item.lng]}
        icon={icon}
        eventHandlers={{
          click: function () { if (onMarkerClick) onMarkerClick(item); },
          mouseover: function () { setHoveredId(key); },
          mouseout: function () { setHoveredId(null); },
        }}
      >
        <Tooltip direction="top" offset={[0, -6]} opacity={hoveredId === key ? 1 : 0.95} className="hm-marker-tooltip">
          <span>{item.title}</span>
        </Tooltip>
      </Marker>
    );
  });

  let panelContent = <PanelPlaceholder />;
  if (selectedMarker) {
    panelContent = <PanelItemCard item={selectedMarker} onClose={handleClosePanel} />;
  } else if (clickPopup) {
    panelContent = <PanelClickResult popup={clickPopup} onClose={handleClosePanel} />;
  }

  return (
    <div className={`hm-layout ${showPanel ? '' : 'hm-layout--map-only'}`}>
      <div className="hm-map-box">
        <MapContainer
          center={RWANDA_CENTER}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          maxBounds={RWANDA_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          zoomSnap={0.5}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={90}
          doubleClickZoom={false}
          zoomControl={false}
          ref={function (map) {
            if (map) {
              window.leafletMap = map;
              if (mapRef) mapRef(map);
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            bounds={RWANDA_BOUNDS}
          />
          {markerEls}
          <MapClickHandler onPick={handlePick} />
          <FlyToSelected selectedMarker={selectedMarker} />
          <CustomZoomControl />
        </MapContainer>
      </div>

      {showPanel ? (
        <aside className="hm-side-panel">
          {panelContent}
        </aside>
      ) : null}
    </div>
  );
}
