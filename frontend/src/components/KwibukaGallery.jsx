import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';
import './KwibukaGallery.css';

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

/** Small dark badge shown over each thumbnail indicating content type. */
function CardTypeBadge({ type }) {
  const icons = {
    video: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    audio: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  };

  return <div className="card-type-badge">{icons[type]}</div>;
}

export default function KwibukaGallery({ videos, songs, onClose }) {
  const { t, language } = useLanguage();

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <div className="gallery-header-content">
            <div className="gallery-header-top">
              <KwibukaFlameLogo className="gallery-flame-logo" />
              <span>{t('kwibuka.eyebrow') || 'Kwibuka'}</span>
            </div>
            <h2>{t('kwibuka.galleryTitle') || 'Kwibuka Gallery'}</h2>
            <p className="gallery-modal-subtitle">
              {t('kwibuka.gallerySubtitle') || 'Videos and songs of remembrance'}
            </p>
          </div>
          <button
            className="gallery-modal-close"
            onClick={onClose}
            aria-label={t('common.close') || 'Close'}
          >
            &times;
          </button>
        </div>

        <div className="gallery-modal-content">
          {/* Videos Section */}
          <div className="gallery-section">
            <h3 className="gallery-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {t('kwibuka.videosTitle') || 'Videos'}
            </h3>
            <div className="video-grid">
              {videos.map((video, i) => (
                <div key={i} className="video-card">
                  <CardTypeBadge type="video" />
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={getLocalizedText(video.title, language)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="video-card-title">{getLocalizedText(video.title, language)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Songs Section */}
          <div className="gallery-section">
            <h3 className="gallery-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              {t('kwibuka.songsTitle') || 'Songs of Remembrance'}
            </h3>
            <div className="songs-grid">
              {songs.map((song, i) => (
                <div key={i} className="song-card">
                  <CardTypeBadge type="audio" />
                  <iframe
                    src={`https://www.youtube.com/embed/${song.id}`}
                    title={getLocalizedText(song.title, language)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="song-card-title">{getLocalizedText(song.title, language)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}