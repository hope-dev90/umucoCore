import React from 'react';

export function UmucoGlyph({ type = 'spark', size = 24, className = '', style, title }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    style,
    role: title ? 'img' : 'presentation',
    'aria-hidden': title ? undefined : true,
  };

  const titleNode = title ? <title>{title}</title> : null;

  if (type === 'medal') {
    return (
      <svg {...common}>
        {titleNode}
        <path d="M22 6h20l-5 16H27L22 6Z" fill="#FCDFD3" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="39" r="17" fill="#FDFBF7" stroke="currentColor" strokeWidth="3" />
        <path d="M32 28l3.3 6.7 7.4 1.1-5.4 5.2 1.3 7.3L32 44.8l-6.6 3.5 1.3-7.3-5.4-5.2 7.4-1.1L32 28Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'quest') {
    return (
      <svg {...common}>
        {titleNode}
        <path d="M14 12h28l8 8v32H14V12Z" fill="#FDFBF7" stroke="currentColor" strokeWidth="3" />
        <path d="M42 12v10h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 30h20M22 39h15M22 48h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 12l-6 6v32l6 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".35" />
      </svg>
    );
  }

  if (type === 'trail') {
    return (
      <svg {...common}>
        {titleNode}
        <path d="M10 48c9-25 34-28 44-32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 7" />
        <circle cx="14" cy="48" r="7" fill="#FCDFD3" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="16" r="7" fill="#FCDFD3" stroke="currentColor" strokeWidth="3" />
        <path d="M26 25l7 7-10 10-7-7 10-10Z" fill="#FDFBF7" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'shield') {
    return (
      <svg {...common}>
        {titleNode}
        <path d="M32 7l19 7v15c0 14-8.5 23-19 28-10.5-5-19-14-19-28V14l19-7Z" fill="#FDFBF7" stroke="currentColor" strokeWidth="3" />
        <path d="M32 14v35M22 27h20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 18c3 5 6 8 10 9 4-1 7-4 10-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      {titleNode}
      <path d="M32 6l5.8 17.2L56 24l-14.3 10.9L46.8 52 32 41.8 17.2 52l5.1-17.1L8 24l18.2-.8L32 6Z" fill="#FDFBF7" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 18l2.3 7 7.4.3-5.8 4.4 2 7-5.9-4.1-5.9 4.1 2-7-5.8-4.4 7.4-.3L32 18Z" fill="currentColor" />
    </svg>
  );
}

export default UmucoGlyph;
