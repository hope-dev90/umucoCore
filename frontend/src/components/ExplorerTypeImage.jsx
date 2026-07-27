import React from 'react';
import commonsImagesCached from '../data/commonsImageCache.json';

export const EXPLORER_IMAGES = {
  warrior: commonsImagesCached['Intore – Umubyino w\'Ubutwari'] || commonsImagesCached['Intore Warriors – The Dance of Courage'],
  'nature-lover': commonsImagesCached['Nyungwe Ancient Rainforest'] || commonsImagesCached['Sacred Forests of Gishwati'],
  'royal-historian': commonsImagesCached['Ingoro y\'Ubwami ya Nyanza'] || commonsImagesCached['The Royal Palace of Nyanza'],
  'folktale-hunter': commonsImagesCached['Imigani – Inkuru zivugwa ku Muriro'] || commonsImagesCached['Imigani – Stories by the Fire'],
  'music-explorer': commonsImagesCached['Inanga – Umutima w\'Umuziki Nyarwanda'] || commonsImagesCached['Inanga – The Soul of Rwandan Music'],
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
