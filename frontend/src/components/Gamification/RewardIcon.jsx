import React from 'react';
import { UmucoGlyph } from '../UmucoGlyphs';

const isImageUrl = (value) => (
  typeof value === 'string' && /^https?:\/\//i.test(value)
);

export function RewardIcon({ icon, className = '', size = 40, style }) {
  if (isImageUrl(icon)) {
    return (
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'inline-block',
          ...style,
        }}
      />
    );
  }

  return (
    <UmucoGlyph
      type={icon === 'quest' ? 'quest' : 'medal'}
      className={className}
      size={size}
      style={style}
    />
  );
}
