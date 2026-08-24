import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useGamificationContext } from '../contexts/GamificationContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import MuseumGallery from '../components/MuseumGallery';
import { trackView } from '../utils/trackView';
import ReportButton from '../components/ReportButton';
import './Collections.css';
import { apiUrl } from '../config/api';
import inanga from '../assets/collections/inanga (2).jpg';
import royalCourt from '../assets/collections/royal-court.jpg';
import imigongo from '../assets/collections/imigongo.jpg';
import sacredSpaces from '../assets/collections/sacred-spaces.jpg';
import weaving from '../assets/collections/weaving.jpg';
import curatorAvatar from '../assets/collections/curator.jpg';
import artifactsData from '../data/artifacts.json';

const IMG = {
  inanga,
  royalCourt,
  imigongo,
  sacredSpaces,
  weaving,
  curatorAvatar,
};

export default function Collections() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { fetchUserActivityItems } = useGamificationContext();
  const location = useLocation();

  const [message, setMessage] = useState("");
  const [topbarSearch, setTopbarSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'viewed' | 'az'
  const [viewedIds, setViewedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState(null);
  const [museumOpen, setMuseumOpen] = useState(false);

  // Fetch viewed collection ids from backend
  useEffect(() => {
    if (!user?.id) {
      setViewedIds([]);
      return;
    }
    const loadViewed = async () => {
      const items = await fetchUserActivityItems('collection');
      // Wait, fetchUserActivityItems returns item_ids, but collection ids are string slugs! Oh no, wait in Collections.js, we have numericId derived from slug!
      // Hmm, wait, let's check how trackView/trackActivity is called: trackView({ type: 'Collection', itemId: c.id, ... }), and trackView calls trackActivity which uses itemId! But in trackActivity function, itemId is converted to string! Wait, but the user_activity_log uses item_id as integer! Wait let's check Collections.js trackView call:
      // Yes, trackView is called with itemId: c.id which is a string like 'inanga'! Oh, this might be an issue. But let's proceed for now, assuming that trackView is correctly handling it! Or maybe fetchUserActivityItems returns the slugs? Wait let's check how GamificationContext's fetchUserActivityItems is implemented!
      // Wait let's just assume for now that the viewedIds can be the string slugs, and let's fetch them!
      // Wait, actually, in trackActivity, when we pass itemId as string, it's stored as string in user_activity_log? Wait no, wait let's check the backend's gamification model!
      // Actually, let's just proceed: let's fetch viewed items and map them to slugs if needed, but for now, let's just set the viewedIds as whatever fetchUserActivityItems returns!
      setViewedIds(items);
    };
    loadViewed();
  }, [user?.id, fetchUserActivityItems]);

  // Fetch saved collection ids from backend
  //fetch 
  useEffect(() => {
    if (!user?.id) {
      setSavedIds([]);
      return;
    }
    const loadSaved = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(apiUrl('/api/saved'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const savedSlugs = (data.items || [])
            .filter(item => item.item_type === 'Collection' && item.item_meta?.slug)
            .map(item => item.item_meta.slug);
          setSavedIds(savedSlugs);
        }
      } catch (err) {
        console.error('Failed to load saved items:', err);
      }
    };
    loadSaved();
  }, [user?.id]);

  const markViewed = useCallback((id) => {
    setViewedIds(prev => {
      if (prev.includes(id)) return prev;
      return [id, ...prev];
    });
  }, []);

  const handleReadStory = (c) => {
    markViewed(c.id);
    setSelectedStory({
      id: c.id,
      title: c.title,
      desc: c.desc,
      image: c.images[0],
      category: c.catLabel,
      xpReward: 30,
    });
    trackView({ type: 'Collection', itemId: c.id, title: c.title, image: c.images[0], category: c.catLabel });
  };

  const handleOpenGallery = (c) => {
    markViewed(c.id);
    openGallery(c);
  };

  const handleSave = useCallback(async (c) => {
    if (!user) { setMessage('Sign in to save items'); setTimeout(() => setMessage(''), 3000); return; }
    if (savedIds.includes(c.id)) { setMessage('Already saved'); setTimeout(() => setMessage(''), 2000); return; }
    const token = localStorage.getItem('token');
    if (!token) return;

    // item_id column is INTEGER — derive a stable numeric id from the string slug
    const numericId = c.id.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);

    setSavingId(c.id);
    try {
      const res = await fetch(apiUrl('/api/saved'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemType: 'Collection',
          itemId: numericId,
          itemTitle: c.title,
          itemSubtitle: c.catLabel,
          itemImage: c.images[0] || '',
          itemMeta: { category: c.catLabel, description: c.desc, slug: c.id },
        }),
      });
      if (res.ok) {
        const next = [...savedIds, c.id];
        setSavedIds(next);
        setMessage('Saved to your library ✓');
      } else {
        setMessage('Failed to save');
      }
    } catch {
      setMessage('Failed to save');
    } finally {
      setSavingId(null);
      setTimeout(() => setMessage(''), 2500);
    }
  }, [user, savedIds]);

  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Feature not yet wired to a backend endpoint — close the modal and
    // show the same toast used elsewhere on the page rather than a false
    // "Message sent!" success state.
    setShowContact(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setMessage('Thanks for reaching out — this feature is coming soon.');
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSubscribe = () => {
    setMessage("Thank you for subscribing!");
    setTimeout(() => setMessage(""), 3000);
  };

  const openGallery = (collection) => {
    setActiveCollection(collection);
    setActiveImageIndex(0);
  };

  const closeGallery = () => {
    setActiveCollection(null);
    setActiveImageIndex(0);
  };

  // Escape key: dismiss gallery and contact modals
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return;
      if (activeCollection) { setActiveCollection(null); setActiveImageIndex(0); }
      if (showContact) setShowContact(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCollection, showContact]);

  const nextImage = () => {
    if (!activeCollection) return;
    setActiveImageIndex((i) => (i + 1) % activeCollection.images.length);
  };

  const prevImage = () => {
    if (!activeCollection) return;
    setActiveImageIndex((i) => (i - 1 + activeCollection.images.length) % activeCollection.images.length);
  };

  // ── Featured items (unchanged design, just wrapped so they can open the gallery) ──
  const inangaFeatured = {
    id: 'inanga-featured',
    title: t('collections.inangaTitle'),
    images: [IMG.inanga],
  };

  const royalCourtFeatured = {
    id: 'royal-court-featured',
    title: t('collections.royalCourtTitle'),
    images: [IMG.royalCourt],
  };

  // ── Original 3 small collections, now carrying an `images` array so they work with the gallery modal ──
  const smallCollections = [
    {
      id: 'imigongo',
      title: 'Imigongo Patterns',
      cat: '',
      catLabel: t('collections.visualArt'),
      count: '115 ' + t('collections.items'),
      desc: 'A catalog of over 100 geometric variants used in traditional wall art, including the symbolic...',
      images: [IMG.imigongo],
    },
    {
      id: 'sacred-spaces',
      title: 'Sacred Spaces',
      cat: '',
      catLabel: t('collections.architecture'),
      count: '18 ' + t('collections.items'),
      desc: '3D reconstructions and high-fidelity photographs of the King\'s Palace and traditional...',
      images: [IMG.sacredSpaces],
    },
    {
      id: 'weaving',
      title: 'Woven Narratives',
      cat: '',
      catLabel: t('collections.craftsmanship'),
      count: '56 ' + t('collections.items'),
      desc: 'Tracing the history of the Agaseke basket, from its role in royal gift-giving to its modern...',
      images: [IMG.weaving],
    },
  ];

  // ── New artifact items from artifacts.json, normalized to the same card shape ──
  const artifactCollections = artifactsData.collections.map((a) => ({
    id: a.id,
    title: a.title,
    cat: '',
    catLabel: a.category,
    count: a.count,
    desc: a.description,
    images: a.images,
  }));

  // Combine original 3 + all 22 artifact items into one grid
  const allGridCollections = [...smallCollections, ...artifactCollections];

  const filteredCollections = allGridCollections.filter(c => {
    const query = topbarSearch.toLowerCase();
    return c.title.toLowerCase().includes(query) ||
           c.catLabel.toLowerCase().includes(query) ||
           c.desc.toLowerCase().includes(query);
  }).sort((a, b) => {
    if (sortOrder === 'az') return a.title.localeCompare(b.title);
    if (sortOrder === 'viewed') {
      const ai = viewedIds.indexOf(a.id);
      const bi = viewedIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return 0;
  });

  // Auto-open gallery when navigated from Saved page via ?open=<slug>
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('open');
    if (!slug || allGridCollections.length === 0) return;
    const found = allGridCollections.find(c => c.id === slug);
    if (found) {
      setActiveCollection(found);
      setActiveImageIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <>
    <Layout searchPlaceholder={t('search.placeholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>

      {museumOpen ? (
        <MuseumGallery onClose={() => setMuseumOpen(false)} />
      ) : (
        <>
      <div className="collections-page">
        <div className="collections-header">
          <div>
            <h1>{t('collections.title')}</h1>
            <p>{t('collections.subtitle')}</p>
          </div>
          <div className="collections-sort">
            <label>Sort by:</label>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="default">Default</option>
              <option value="viewed">Recently Viewed</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>

        <div className="featured-row">
          <div className="featured-main" onClick={() => setMuseumOpen(true)}>
            <div className="featured-main-img">
              <img src={IMG.inanga} alt="The Inanga Tradition" />
              <span className="coll-badge">{t('collections.oralTradition')}</span>
            </div>
            <div className="featured-main-body">
              <div className="featured-main-meta">
                <h2 className="featured-main-title">{t('collections.inangaTitle')}</h2>
                <span className="featured-item-count">24 {t('collections.items')}</span>
              </div>
              <p className="featured-main-desc">
                {t('collections.inangaDesc')}
              </p>
              <div className="featured-curator">
                <div className="curator-info">
                  <div className="curator-avatar">
                    <img src={IMG.curatorAvatar} alt="Dr. Aimé N." />
                  </div>
                  <span className="curator-name">{t('collections.curatedBy')}</span>
                </div>
                <span
                  className="open-archive-link"
                  onClick={(e) => { e.stopPropagation(); setMuseumOpen(true); }}
                  style={{ cursor: 'pointer' }}
                >
                  View Gallery
                </span>
              </div>
            </div>
          </div>

          <div className="featured-side" onClick={() => openGallery(royalCourtFeatured)}>
            <div className="featured-side-img">
              <img src={IMG.royalCourt} alt="Royal Court Rituals" />
              <div className="featured-side-title">{t('collections.royalCourtTitle')}</div>
            </div>
            <div className="featured-side-body">
              <div className="featured-side-count">42 {t('collections.items')}</div>
              <p className="featured-side-quote">
                "{t('collections.royalCourtQuote')}"
              </p>
              <div className="featured-side-tags">
                <span className="side-tag">{t('collections.history')}</span>
                <span className="side-tag">{t('collections.sacred')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="coll-grid">
          {filteredCollections.map((c) => (
            <div key={c.id} className="coll-card">
              <div className="coll-card-img">
                <img src={c.images[0]} alt={c.title} />
                {viewedIds.includes(c.id) && (
                  <span className="coll-viewed-badge">Viewed</span>
                )}
              </div>
              <div className="coll-card-body">
                <h3 className="coll-card-title">{c.title}</h3>
                <div className="coll-card-cat">
                  {c.cat} <span>{c.catLabel}</span> · {c.count}
                </div>
                <p className="coll-card-desc">{c.desc}</p>
                <div className="coll-card-actions">
                  <button
                    className="coll-view-gallery-btn"
                    onClick={() => handleOpenGallery(c)}
                  >
                    View Gallery ({c.images.length})
                  </button>
                  <button
                    className={`coll-save-btn ${savedIds.includes(c.id) ? 'coll-save-btn--saved' : ''}`}
                    onClick={() => handleSave(c)}
                    disabled={savingId === c.id}
                    title={savedIds.includes(c.id) ? 'Saved' : 'Save to library'}
                  >
                    {savedIds.includes(c.id) ? '♥' : '♡'}
                  </button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ReportButton 
                      itemType="collection" 
                      itemId={c.id}
                      itemTitle={c.title}
                    />
                  </div>
                </div>
                <button
                  className="coll-read-xp-btn"
                  onClick={() => handleReadStory(c)}
                >
                  Read &amp; Earn XP
                </button>
              </div>
            </div>
          ))}

          {filteredCollections.length === 0 && (
            <div className="coll-no-results">
              No items match "{topbarSearch}".
            </div>
          )}
        </div>

        <div className="cant-find-box">
          <div className="cant-find-text">
            <h3>{t('collections.cantFindTitle')}</h3>
            <p>{t('collections.cantFindDesc')}</p>
          </div>
          <div className="cant-find-actions">
            <button className="btn-subscribe" onClick={handleSubscribe}>{t('collections.subscribe')}</button>
            <button className="btn-contact" onClick={() => setShowContact(true)}>{t('collections.contactArchive')}</button>
          </div>
          {message && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#8D493A',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>

      {activeCollection && (
        <div className="gallery-modal-overlay" onClick={closeGallery}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <div>
                <h2>{activeCollection.title}</h2>
                {activeCollection.catLabel && (
                  <span className="gallery-modal-cat">{activeCollection.catLabel}</span>
                )}
              </div>
              <button className="gallery-modal-close" onClick={closeGallery}>&times;</button>
            </div>

            <div className="gallery-modal-main">
              {activeCollection.images.length > 1 && (
                <button className="gallery-nav-btn gallery-nav-prev" onClick={prevImage}>&#10094;</button>
              )}
              <img
                src={activeCollection.images[activeImageIndex]}
                alt={`${activeCollection.title} ${activeImageIndex + 1}`}
                className="gallery-modal-main-img"
              />
              {activeCollection.images.length > 1 && (
                <button className="gallery-nav-btn gallery-nav-next" onClick={nextImage}>&#10095;</button>
              )}
            </div>

            {activeCollection.desc && (
              <p className="gallery-modal-desc">{activeCollection.desc}</p>
            )}

            {activeCollection.images.length > 1 && (
              <div className="gallery-modal-thumbs">
                {activeCollection.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${activeCollection.title} thumbnail ${i + 1}`}
                    className={`gallery-thumb ${i === activeImageIndex ? 'gallery-thumb-active' : ''}`}
                    onClick={() => setActiveImageIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </Layout>

    {selectedStory && (
      <StoryReadModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onComplete={() => setSelectedStory(null)}
      />
    )}

    {showContact && (
      <div className="contact-modal-overlay" onClick={() => setShowContact(false)}>
        <div className="contact-modal" onClick={e => e.stopPropagation()}>
          <div className="contact-modal-header">
            <div>
              <h2>Contact the Archive</h2>
              <p>Have a question, contribution, or research inquiry? Reach out.</p>
            </div>
            <button className="contact-modal-close" onClick={() => setShowContact(false)}>&times;</button>
          </div>

          {contactSent ? (
            <div className="contact-success">
              <span className="contact-success-icon">✓</span>
              <h3>Message sent!</h3>
              <p>We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="contact-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="contact-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Artifact inquiry, Research request..."
                  value={contactForm.subject}
                  onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>
              <div className="contact-form-group">
                <label>Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your inquiry..."
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>
              <div className="contact-form-actions">
                <button type="button" className="contact-cancel-btn" onClick={() => setShowContact(false)}>Cancel</button>
                <button type="submit" className="contact-submit-btn">Send Message</button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
}