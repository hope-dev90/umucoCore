import React from 'react';

const TWEMOJI_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72';

function getCodepoint(emoji) {
  if (!emoji || typeof emoji !== 'string') return null;
  const cp = Array.from(emoji)
    .map(ch => ch.codePointAt(0).toString(16).padStart(2, '0'))
    .join('-');
  return cp;
}

export function Emoji({ emoji, size = 20, alt, style = {}, ...rest }) {
  const codepoint = getCodepoint(emoji);
  if (!codepoint) return null;
  const src = `${TWEMOJI_BASE}/${codepoint}.png`;

  return (
    <img
      src={src}
      alt={alt || emoji}
      width={size}
      height={size}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...style,
      }}
      {...rest}
    />
  );
}

export function emojiSrc(emoji) {
  const codepoint = getCodepoint(emoji);
  if (!codepoint) return null;
  return `${TWEMOJI_BASE}/${codepoint}.png`;
}
