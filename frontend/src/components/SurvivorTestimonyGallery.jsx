import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import survivorData from '../data/survivorTestimony.json';
import './SurvivorTestimonyGallery.css';

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function KwibukaFlameLogo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 160"
      role="img"
      aria-label="Kwibuka remembrance flame"
    >
      <path
        d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z"
        fill="currentColor"
      />
      <path
        d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z"
        fill="currentColor"
      />
      <path
        d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z"
        fill="currentColor"
      />
      <path
        className="kwibuka-flame-cutout"
        d="M58 97c-12-10-11-24 4-42-3 24 5 32 18 39-19 6-30 22-28 47-14-15-13-31 6-44Z"
      />
      <path
        d="M58 97c-12-10-11-24 4-42"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Normalizes item_url, which may be a string, an array, or null. */
function getLinks(itemUrl) {
  if (!itemUrl) return [];
  return Array.isArray(itemUrl) ? itemUrl : [itemUrl];
}

/** Extracts a YouTube video ID from watch, youtu.be, or embed-style URLs. */
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('/')[0] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('/')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function TestimonyCard({ testimony, onReadFull, t }) {
  const hasVideo = getLinks(testimony.item_url).some((url) => getYouTubeId(url));

  return (
    <article className="testimony-card">
      <div className="testimony-card-img">
        <div className="testimony-card-logo">
          <KwibukaFlameLogo />
        </div>
        <div className="testimony-card-badge">
          <span className="testimony-badge-text">{t('testimonies.badge')}</span>
        </div>
      </div>

      <div className="testimony-card-body">
        <h3 className="testimony-card-name">{testimony.subjects?.join(' & ') || 'Testimony'}</h3>

        <div className="testimony-card-meta">
          {testimony.district && (
            <span className="testimony-meta-item">
              <PinIcon />
              {testimony.district} District
            </span>
          )}
          {testimony.language && (
            <span className="testimony-meta-item">
              <LanguageIcon />
              {testimony.language}
              {testimony.translation ? ` · ${testimony.translation}` : ''}
            </span>
          )}
        </div>

        <p className="testimony-card-summary">{testimony.summary}</p>

        <div className="testimony-card-actions">
          <button
            type="button"
            className="testimony-read-btn"
            onClick={() => onReadFull(testimony)}
          >
            {hasVideo ? <PlayIcon /> : null}
            {t('testimonies.readFull')}
          </button>
        </div>
      </div>
    </article>
  );
}

function TestimonyModal({ testimony, onClose, t }) {
  const links = getLinks(testimony?.item_url);
  const youtubeLinks = links
    .map((url) => ({ url, id: getYouTubeId(url) }))
    .filter((entry) => entry.id);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [testimony?.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!testimony) return null;

  const activeVideo = youtubeLinks[activeIndex] || null;

  return (
    <div className="testimony-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="testimony-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimony-modal-title"
      >
        <button
          type="button"
          className="testimony-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="testimony-modal-content">
          <div className="testimony-modal-header">
            <h2 id="testimony-modal-title">{testimony.title}</h2>
            <div className="testimony-modal-meta">
              {testimony.district && (
                <span className="testimony-meta-item">
                  <PinIcon />
                  {testimony.district} District
                </span>
              )}
              {testimony.language && (
                <span className="testimony-meta-item">
                  <LanguageIcon />
                  {testimony.language}
                  {testimony.translation ? ` · ${testimony.translation}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="testimony-modal-body">
            {activeVideo ? (
              <div className="testimony-modal-video">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0`}
                  title={testimony.title || 'Testimony video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : null}

            {youtubeLinks.length > 1 ? (
              <div className="testimony-modal-parts">
                {youtubeLinks.map((entry, i) => (
                  <button
                    key={entry.url}
                    type="button"
                    className={`testimony-modal-part-btn${i === activeIndex ? ' is-active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                    aria-pressed={i === activeIndex}
                  >
                    <PlayIcon />
                    {t('testimonies.part', { part: i + 1 })}
                  </button>
                ))}
              </div>
            ) : null}

            <p>{testimony.summary}</p>

            {!activeVideo && (
              <p className="testimony-modal-note">
                {t('testimonies.notAvailable')}{' '}
                {testimony.listing_url ? (
                  <a
                    href={testimony.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="testimony-modal-archive-link"
                  >
                    {t('testimonies.archiveLink')}
                  </a>
                ) : null}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurvivorTestimonyGallery({
  testimonies = survivorData.testimonies || [],
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return testimonies;
    return testimonies.filter((testimony) => {
      const subjects = Array.isArray(testimony.subjects) ? testimony.subjects : [];
      const haystack = [
        ...subjects,
        testimony.title || '',
        testimony.district || '',
        testimony.summary || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [testimonies, query]);

  return (
    <>
      <section className="testimony-gallery">
        <header className="testimony-gallery-header">
          <div className="testimony-gallery-header-top">
            <KwibukaFlameLogo className="testimony-gallery-logo" />
            <div className="testimony-gallery-eyebrow">Kwibuka</div>
          </div>
          <h2 className="testimony-gallery-title">{t('testimonies.title')}</h2>
          <p className="testimony-gallery-subtitle">{t('testimonies.subtitle')}</p>

          <div className="testimony-gallery-controls">
            <div className="testimony-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('testimonies.searchPlaceholder')}
                aria-label={t('testimonies.searchPlaceholder')}
              />
            </div>
            <span className="testimony-count">
              {filtered.length} {filtered.length === 1 ? t('testimonies.count') : t('testimonies.count_plural')}
            </span>
          </div>
        </header>

        {filtered.length > 0 ? (
          <div className="testimony-grid">
            {filtered.map((testimony) => (
              <TestimonyCard
                key={testimony.id}
                testimony={testimony}
                onReadFull={setSelected}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="testimony-empty">{t('testimonies.noResults')}</div>
        )}
      </section>

      {selected ? (
        <TestimonyModal
          testimony={selected}
          onClose={() => setSelected(null)}
          t={t}
        />
      ) : null}
    </>
  );
}
