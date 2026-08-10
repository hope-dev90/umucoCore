import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import survivorData from '../data/survivorTestimony.json';
import './SurvivorTestimonyView.css';

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/** Normalizes item_url, which may be a string, an array, or null. */
function getLinks(itemUrl) {
  if (!itemUrl) return [];
  return Array.isArray(itemUrl) ? itemUrl : [itemUrl];
}

export default function SurvivorTestimonyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const testimonies = survivorData.testimonies || [];
  const testimony = testimonies.find(t => t.id === id);
  const links = getLinks(testimony?.item_url) || [];

  if (!testimony) {
    return (
      <Layout>
        <div className="testimony-view-page">
          <div className="testimony-view-not-found">
            <h2>{t('testimonies.notFound')}</h2>
            <p>{t('testimonies.notFoundDesc')}</p>
            <button type="button" onClick={() => navigate('/kwibuka')} className="testimony-view-back-btn">
              <ArrowLeftIcon />
              {t('testimonies.backToKwibuka')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="testimony-view-page">
        <div className="testimony-view-container">
          <button 
            type="button"
            onClick={() => navigate('/kwibuka')} 
            className="testimony-view-back-btn"
          >
            <ArrowLeftIcon />
            {t('testimonies.backToTestimonies')}
          </button>

          <div className="testimony-view-header">
            <div className="testimony-view-badge">{t('testimonies.badge')}</div>
            <h1 className="testimony-view-title">{testimony.title || 'Testimony'}</h1>
            
            <div className="testimony-view-meta">
              {testimony.district && (
                <span className="testimony-view-meta-item">
                  <PinIcon />
                  {testimony.district} District
                </span>
              )}
              {testimony.language && (
                <span className="testimony-view-meta-item">
                  <LanguageIcon />
                  {testimony.language}
                  {testimony.translation ? ` · ${testimony.translation}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="testimony-view-content">
            <div className="testimony-view-summary">
              <h2>{t('testimonies.summaryTitle')}</h2>
              <p>{testimony.summary || 'No summary available.'}</p>
            </div>

            {links.length > 0 && (
              <div className="testimony-view-links">
                <h2>{t('testimonies.accessTitle')}</h2>
                <p className="testimony-view-links-intro">
                  {t('testimonies.accessIntro')}
                </p>
                <div className="testimony-view-links-list">
                  {links.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="testimony-view-link"
                    >
                      <LinkIcon />
                      {links.length > 1 ? t('testimonies.part', { part: i + 1 }) : t('testimonies.viewFull')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <path d="M15 3h6v6M10 14 21 3" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!testimony.item_url && (
              <div className="testimony-view-note">
                <h2>{t('testimonies.notAvailable')}</h2>
                <p>
                  {t('testimonies.notAvailableDesc', { 
                    link: `<a href="${testimony.listing_url}" target="_blank" rel="noopener noreferrer" className="testimony-view-archive-link">${t('testimonies.archiveLink')}</a>`,
                    id: testimony.id 
                  })}
                </p>
              </div>
            )}

            <div className="testimony-view-archive">
              <h2>{t('testimonies.aboutArchive')}</h2>
              <p>
                {t('testimonies.aboutArchiveDesc', { 
                  link: `<a href="${testimony.listing_url}" target="_blank" rel="noopener noreferrer" className="testimony-view-archive-link">${t('testimonies.searchLink')}</a>`
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}