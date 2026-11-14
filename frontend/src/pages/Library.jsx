import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { StoryReadModal } from '../components/Gamification/StoryReadModal';
import { ALL_STORIES } from '../data/stories';
import { localizeStory } from '../utils/storyLocalization';
import { trackView } from '../utils/trackView';
import proverbsData from '../data/proverbs.json';
import bookImg from '../assets/book.png';
import './Library.css';

// Which library shelf each story's explorer category belongs to.
const SHELF_FOR_CATEGORY = {
  royal: 'royal',
  warrior: 'royal',
  folklore: 'folklore',
  nature: 'folklore',
  music: 'music',
};

const toText = (content, language) => {
  let text = content;
  if (text && typeof text === 'object' && !Array.isArray(text)) {
    text = text[language] || text.en || Object.values(text)[0];
  }
  if (Array.isArray(text)) text = text.join('\n\n');
  return String(text || '');
};

const minutesFor = (text) => Math.max(2, Math.round(text.split(/\s+/).length / 200));

export default function Library() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [topbarSearch, setTopbarSearch] = useState('');
  const [shelf, setShelf] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [readingStory, setReadingStory] = useState(null);

  const books = useMemo(() => {
    const storyBooks = ALL_STORIES.map((raw) => {
      const story = localizeStory(raw, language) || raw;
      const body = toText(story.content, language);
      return {
        id: raw.id,
        kind: 'story',
        title: story.title,
        subtitle: story.category || raw.category,
        location: story.location || raw.location,
        image: raw.image,
        shelf: SHELF_FOR_CATEGORY[raw.explorerCategory] || 'folklore',
        excerpt: body.split(/\n\s*\n/)[0] || story.desc,
        desc: story.desc,
        minutes: minutesFor(body),
        xp: raw.xpReward ?? 50,
        story: raw,
      };
    });

    const proverbs = Array.isArray(proverbsData?.proverbs) ? proverbsData.proverbs : [];
    const proverbBook = {
      id: 'proverbs-of-rwanda',
      kind: 'proverbs',
      title: t('library.proverbsTitle'),
      subtitle: t('library.proverbsSubtitle', { count: proverbs.length }),
      image: bookImg,
      shelf: 'folklore',
      excerpt: proverbs.slice(0, 4).map((p) => `${p.rw} — ${language === 'fr' && p.fr ? p.fr : p.en}`).join('\n'),
      desc: t('library.proverbsDesc'),
      minutes: Math.max(5, Math.round(proverbs.length / 6)),
      xp: null,
    };

    return [proverbBook, ...storyBooks];
  }, [language, t]);

  const shelves = [
    { id: 'all', label: t('library.allBooks') },
    { id: 'royal', label: t('library.royalChronicles') },
    { id: 'folklore', label: t('library.folkloreProverbs') },
    { id: 'music', label: t('library.musicArts') },
  ];

  const query = topbarSearch.trim().toLowerCase();
  const visibleBooks = books.filter((b) => (shelf === 'all' || b.shelf === shelf)
    && (!query || `${b.title} ${b.subtitle} ${b.desc}`.toLowerCase().includes(query)));

  const selected = books.find((b) => b.id === selectedId) || visibleBooks[0] || books[0];
  const featured = books.filter((b) => b.kind === 'story')[Math.floor(Date.now() / 86400000) % ALL_STORIES.length];

  const openBook = (book) => {
    if (book.kind === 'proverbs') {
      navigate('/listen');
      return;
    }
    setReadingStory(book.story);
    trackView({ type: 'Article', itemId: book.id, title: book.title, image: book.image || '', category: book.subtitle || 'Library' });
  };

  return (
    <Layout searchPlaceholder={t('ui.searchArchive')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="ds-page lib">
        <div className="ds-hero-row">
          <section className="ds-hero">
            <span className="ds-pill">{t('library.kicker')}</span>
            <h1>{t('library.title')}</h1>
            <p>{t('library.subtitle')}</p>
            <div className="ds-diamonds" aria-hidden="true" />
          </section>
          {featured && (
            <button type="button" className="ds-promo" onClick={() => setSelectedId(featured.id)}>
              <img className="ds-promo-bg" src={featured.image} alt="" />
              <span className="ds-pill">{t('library.featured')}</span>
              <small>{featured.subtitle}</small>
              <strong>{featured.title}</strong>
              <span className="ds-promo-link">{t('library.preview')} →</span>
            </button>
          )}
        </div>

        <div className="lib-body">
          <div className="lib-main">
            <div className="ds-section">
              <span className="ds-section-label">{t('library.categories')}</span>
              <div className="ds-chips">
                {shelves.map((s) => (
                  <button key={s.id} type="button" className={`ds-chip ${shelf === s.id ? 'active' : ''}`} onClick={() => setShelf(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleBooks.length === 0 ? (
              <p className="ds-card ds-empty">{t('library.empty')}</p>
            ) : (
              <div className="lib-grid">
                {visibleBooks.map((book) => (
                  <article
                    key={book.id}
                    className={`lib-book ${selected?.id === book.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(book.id)}
                  >
                    <div className="lib-book-cover">
                      <img src={book.image} alt="" />
                    </div>
                    <h3>{book.title}</h3>
                    <p>{book.subtitle}</p>
                    <div className="lib-book-actions">
                      <button type="button" onClick={(e) => { e.stopPropagation(); openBook(book); }}>{t('library.read')}</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedId(book.id); }}>{t('library.details')}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <aside className="lib-preview">
              <span className="ds-section-label">{t('library.previewLabel')}</span>
              <div className="lib-preview-card">
                <h2>{selected.title}</h2>
                <small>{t('library.knowMore')}</small>
                <div className="lib-excerpt">
                  {selected.excerpt.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
                </div>
                <div className="lib-meta">
                  <span><Clock size={13} /> {t('library.minRead', { minutes: selected.minutes })}</span>
                  {selected.xp ? <span><Award size={13} /> +{selected.xp} XP</span> : <span><BookOpen size={13} /> {t('library.collection')}</span>}
                </div>
                <button type="button" className="ds-btn ds-btn--soft lib-read" onClick={() => openBook(selected)}>
                  {t('library.read')} <ArrowRight size={12} />
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      {readingStory && (
        <StoryReadModal story={readingStory} onClose={() => setReadingStory(null)} onComplete={() => {}} />
      )}
    </Layout>
  );
}
