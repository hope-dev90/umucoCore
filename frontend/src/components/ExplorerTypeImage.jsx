import React from 'react';
import warriorImage from '../assets/tra.png';
import natureImage from '../assets/nyanza.jpg';
import royalImage from '../assets/buhanga.jpg';
import folktaleImage from '../assets/imigongo.jpg';
import musicImage from '../assets/intore.jpg';

export const EXPLORER_IMAGES = {
  warrior: warriorImage,
  'nature-lover': natureImage,
  'royal-historian': royalImage,
  'folktale-hunter': folktaleImage,
  'music-explorer': musicImage,
};

export function getExplorerImage(type) {
  return EXPLORER_IMAGES[type] || null;
}

export default function ExplorerTypeImage({
  type,
  label = 'Explorer',
  size = 40,
  selected = false,
  style,
  imgStyle,
  className = '',
}) {
  const src = getExplorerImage(type);
  const fallback = label.charAt(0).toUpperCase();

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        background: selected ? '#8D493A' : 'rgba(141,73,58,0.12)',
        border: selected ? '2px solid #8D493A' : '1px solid rgba(141,73,58,0.18)',
        boxShadow: selected ? '0 6px 18px rgba(141,73,58,0.22)' : '0 2px 8px rgba(44,26,20,0.10)',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            filter: selected ? 'saturate(1.08) contrast(1.05)' : 'saturate(0.95)',
            ...imgStyle,
          }}
        />
      ) : (
        <span style={{ color: selected ? '#fff' : '#8D493A', fontWeight: 800, fontSize: size * 0.38 }}>
          {fallback}
        </span>
      )}
    </span>
  );
}
