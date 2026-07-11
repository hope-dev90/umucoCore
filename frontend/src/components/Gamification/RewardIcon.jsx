import React from 'react';

const isImageUrl = (value) => (
  typeof value === 'string' && /^https?:\/\//i.test(value)
);

export function RewardIcon({ icon, fallback = '🏅', className = '', size = 40, style }) {
  const value = icon || fallback;

  if (isImageUrl(value)) {
    return (
      <img
        src={value}
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
    <span className={className} style={style} aria-hidden="true">
      {value}
    </span>
  );
}
