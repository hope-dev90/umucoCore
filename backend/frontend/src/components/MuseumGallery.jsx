import { useState, useEffect, useCallback, useRef } from 'react';
import galleryData from '../data/museumGallery.json';
import { useGamificationContext } from '../contexts/GamificationContext';
import { trackView } from '../utils/trackView';
import './MuseumGallery.css';

/**
 * MuseumGallery
 * Renders inline (inside Layout) so the sidebar stays visible.
 * Awards XP when the user browses images.
 */
export default function MuseumGallery({ onClose, filterArtifact }) {
  const all = galleryData.gallery;
  const categories = ['All', ...Array.from(new Set(all.map(i => i.category)))];

  const { awardXP } = useGamificationContext();
  const awardedRef = useRef(new Set());

  const [activeCategory, setActiveCategory] = useState(filterArtifact
    ? (all.find(i => i.artifact === filterArtifact)?.category || 'All')
    : 'All'
  );
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeCategory === 'All'
    ? all
    : all.filter(i => i.category === activeCategory);

  // Open at filterArtifact on mount
  useEffect(() => {
    if (filterArtifact) {
      const idx = filtered.findIndex(i => i.artifact === filterArtifact);
      if (idx !== -1) setLightboxIndex(idx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Award XP per unique artifact viewed
  const awardForItem = useCallback((item) => {
    if (!item || awardedRef.current.has(item.artifact)) return;
    awardedRef.current.add(item.artifact);
    awardXP(10, `Viewed museum artifact: ${item.artifact}`).catch(() => {});
    trackView({ type: 'Collection', title: item.artifact, category: item.category });
  }, [awardXP]);

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    awardForItem(filtered[idx]);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex(i => {
      const next = (i - 1 + filtered.length) % filtered.length;
      awardForItem(filtered[next]);
      return next;
    });
  }, [filtered, awardForItem]);

  const next = useCallback(() => {
    setLightboxIndex(i => {
      const next = (i + 1) % filtered.length;
      awardForItem(filtered[next]);
      return next;
    });
  }, [filtered, awardForItem]);

  useEffect(() => {
    const handler = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, next, prev]);

  const activeLightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="museum-page">
      {/* Header */}
      <div className="museum-header">
        <div className="museum-header-left">
          <span className="museum-label">Museum Gallery</span>
          <h2 className="museum-title">Rwandan Heritage Collection</h2>
          <p className="museum-subtitle">Browse artifacts — earn <span className="museum-xp-hint">+10 XP</span> per artifact viewed</p>
        </div>
        <button className="museum-close" onClick={onClose}>← Back to Collections</button>
      </div>

      {/* Category filter bar */}
      <div className="museum-filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`museum-filter-btn ${activeCategory === cat ? 'museum-filter-btn--active' : ''}`}
            onClick={() => { setActiveCategory(cat); setLightboxIndex(null); }}
          >
            {cat}
          </button>
        ))}
        <span className="museum-count">{filtered.length} items</span>
      </div>

      {/* Masonry grid */}
      <div className="museum-grid">
        {filtered.map((item, idx) => (
          <div key={item.id} className="museum-cell" onClick={() => openLightbox(idx)}>
            <img src={item.url} alt={item.artifact} loading="lazy" />
            <div className="museum-cell-caption">
              <span className="museum-cell-artifact">{item.artifact}</span>
              <span className="museum-cell-cat">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {activeLightboxItem && (
        <div className="museum-lightbox-overlay" onClick={closeLightbox}>
          <div className="museum-lightbox" onClick={e => e.stopPropagation()}>
            <button className="museum-lb-close" onClick={closeLightbox}>✕</button>
            <button className="museum-lb-nav museum-lb-prev" onClick={prev}>&#10094;</button>

            <div className="museum-lb-img-wrap">
              <img src={activeLightboxItem.url} alt={activeLightboxItem.artifact} />
            </div>

            <button className="museum-lb-nav museum-lb-next" onClick={next}>&#10095;</button>

            <div className="museum-lb-info">
              <p className="museum-lb-artifact">{activeLightboxItem.artifact}</p>
              <span className="museum-lb-category">{activeLightboxItem.category}</span>
              <span className="museum-lb-xp">+10 XP</span>
              <p className="museum-lb-counter">{lightboxIndex + 1} / {filtered.length}</p>
            </div>

            <div className="museum-filmstrip">
              {filtered.map((item, idx) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.artifact}
                  className={`museum-filmstrip-thumb ${idx === lightboxIndex ? 'museum-filmstrip-thumb--active' : ''}`}
                  onClick={() => { setLightboxIndex(idx); awardForItem(item); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
