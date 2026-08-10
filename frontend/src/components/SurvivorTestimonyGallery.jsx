import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
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

function TestimonyCard({ testimony, onReadFull, t }) {
  const links = getLinks(testimony.item_url);

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
          {links.length > 0 ? (
            links.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="testimony-read-btn"
              >
                <LinkIcon />
                {links.length > 1 ? t('testimonies.readPart', { part: i + 1 }) : t('testimonies.readFull')}
              </a>
            ))
          ) : (
            <button 
              type="button"
              className="testimony-read-btn"
              onClick={() => onReadFull(testimony)}
            >
              {t('testimonies.readFull')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function TestimonyModal({ testimony, onClose, t }) {
  if (!testimony) return null;

  return (
    <div className="testimony-modal-overlay" onClick={onClose}>
      <div className="testimony-modal" onClick={(e) => e.stopPropagation()}>
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
            <h2>{testimony.title}</h2>
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
            <p>{testimony.summary}</p>
            {testimony.item_url && (
              <div className="testimony-modal-links">
                <h4>{t('testimonies.accessTitle')}</h4>
                {getLinks(testimony.item_url).map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="testimony-modal-link"
                  >
                    <LinkIcon />
                    {getLinks(testimony.item_url).length > 1 ? t('testimonies.part', { part: i + 1 }) : t('testimonies.viewFull')}
                  </a>
                ))}
              </div>
            )}
            {!testimony.item_url && (
              <p className="testimony-modal-note">
                {t('testimonies.notAvailableDesc', { 
                  link: `<a href="${testimony.listing_url}" target="_blank" rel="noopener noreferrer" className="testimony-modal-link">${t('testimonies.archiveLink')}</a>`,
                  id: testimony.id 
                })}
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
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return testimonies;
    return testimonies.filter((testimony) => {
      const subjects = Array.isArray(testimony.subjects) ? testimony.subjects : [];
      const haystack = [
        ...subjects,
        testimony.district || '',
        testimony.summary || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [testimonies, query]);

  const handleReadFull = (testimony) => {
    navigate(`/testimony/${testimony.id}`);
  };

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
              {filtered.length} {filtered.length === 1 ? t('testimonies.count', { count: 1 }) : t('testimonies.count_plural', { count: filtered.length })}
            </span>
          </div>
        </header>

        {filtered.length > 0 ? (
          <div className="testimony-grid">
            {filtered.map((testimony) => (
              <TestimonyCard 
                key={testimony.id} 
                testimony={testimony} 
                onReadFull={handleReadFull}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="testimony-empty">{t('testimonies.noResults')}</div>
        )}
      </section>

      {/* Modal removed - now using dedicated page at /testimony/:id */}
    </>
  );
}