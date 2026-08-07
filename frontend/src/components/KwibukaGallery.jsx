import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

export default function KwibukaGallery({ videos, songs, onClose }) {
  const { t, language } = useLanguage();

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <div>
            <h2>{t('kwibuka.galleryTitle') || 'Kwibuka Gallery'}</h2>
            <p className="gallery-modal-subtitle">{t('kwibuka.gallerySubtitle') || 'Videos and songs of remembrance'}</p>
          </div>
          <button className="gallery-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="gallery-modal-content">
          {/* Videos Section */}
          <div className="gallery-section">
            <h3 className="gallery-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {t('kwibuka.videosTitle') || 'Videos'}
            </h3>
            <div className="video-grid">
              {videos.map((video, i) => (
                <div key={i} className="video-card">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              {t('kwibuka.songsTitle') || 'Songs of Remembrance'}
            </h3>
            <div className="songs-grid">
              {songs.map((song, i) => (
                <div key={i} className="song-card">
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