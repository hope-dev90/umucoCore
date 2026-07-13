import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './Collections.css';
import inanga from '../assets/collections/inanga (2).jpg';
import royalCourt from '../assets/collections/royal-court.jpg';
import imigongo from '../assets/collections/imigongo.jpg';
import sacredSpaces from '../assets/collections/sacred-spaces.jpg';
import weaving from '../assets/collections/weaving.jpg';
import curatorAvatar from '../assets/collections/curator.jpg';

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
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleOpenArchive = () => {
    navigate("/explore"); // Navigate to explore for now
  };

  const handleSubscribe = () => {
    setMessage("Thank you for subscribing!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleContact = () => {
    setMessage("Opening contact form...");
    setTimeout(() => setMessage(""), 3000);
  };

  const smallCollections = [
    {
      title: 'Imigongo Patterns',
      cat: '',
      catLabel: t('collections.visualArt'),
      count: '115 ' + t('collections.items'),
      desc: 'A catalog of over 100 geometric variants used in traditional wall art, including the symbolic...',
      img: IMG.imigongo,
      bg: 'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))',
    },
    {
      title: 'Sacred Spaces',
      cat: '',
      catLabel: t('collections.architecture'),
      count: '18 ' + t('collections.items'),
      desc: '3D reconstructions and high-fidelity photographs of the King\'s Palace and traditional...',
      img: IMG.sacredSpaces,
      bg: 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
    },
    {
      title: 'Woven Narratives',
      cat: '',
      catLabel: t('collections.craftsmanship'),
      count: '56 ' + t('collections.items'),
      desc: 'Tracing the history of the Agaseke basket, from its role in royal gift-giving to its modern...',
      img: IMG.weaving,
      bg: 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
    },
  ];

  return (
    <Layout searchPlaceholder={t('search.placeholder')}>
      <div className="collections-page">
        <div className="collections-header">
          <h1>{t('collections.title')}</h1>
          <p>{t('collections.subtitle')}</p>
        </div>

        <div className="featured-row">
          <div className="featured-main">
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
                <span className="open-archive-link" onClick={handleOpenArchive} style={{ cursor: 'pointer' }}>{t('collections.openArchive')}</span>
              </div>
            </div>
          </div>

          <div className="featured-side">
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
          {smallCollections.map((c, i) => (
            <div key={i} className="coll-card">
              <div className="coll-card-img">
                <img src={c.img} alt={c.title} />
              </div>
              <div className="coll-card-body">
                <h3 className="coll-card-title">{c.title}</h3>
                <div className="coll-card-cat">
                  {c.cat} <span>{c.catLabel}</span> · {c.count}
                </div>
                <p className="coll-card-desc">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cant-find-box">
          <div className="cant-find-text">
            <h3>{t('collections.cantFindTitle')}</h3>
            <p>{t('collections.cantFindDesc')}</p>
          </div>
          <div className="cant-find-actions">
            <button className="btn-subscribe" onClick={handleSubscribe}>{t('collections.subscribe')}</button>
            <button className="btn-contact" onClick={handleContact}>{t('collections.contactArchive')}</button>
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
    </Layout>
  );
}
