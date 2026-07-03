import React, { useState } from 'react';
import Layout from '../components/Layout';
import './IntlDays.css';
import themeImg from '../assets/international/imigongo.jpg';
import spotlightImg from '../assets/international/nyanza.jpg';
import harvestImg from '../assets/international/umuganura.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

const IMG = {
  theme: themeImg,
  spotlight: spotlightImg,
  harvest: harvestImg,
};

const calendarWeeks = [
  [
    { n:27, other:true }, 
    { n:28, other:true }, 
    { n:29, other:true }, 
    { n:30, other:true },
    { n:1, events:[{ label:{ en: 'Rwandan Heritage', rw: 'Umuganura w\'I Rwanda' }, cls:'pill-heritage' }] },
    { n:2, events:[{ label:{ en: 'Harvest Crit', rw: 'Umusaruro' }, cls:'pill-national' }] },
    { n:3 }
  ],
  [
    { n:4 }, 
    { n:5 },
    { n:6, today:true, events:[{ label:{ en: 'National Museum', rw: 'Ishusho ry\'Umukusanya' }, cls:'pill-national' }] },
    { n:7 }, 
    { n:8, events:[{ label:{ en: 'Lit Day', rw: 'Umusi w\'Imyandiko' }, cls:'pill-intl' }] }, 
    { n:9 }, 
    { n:10 }
  ],
  [
    { n:11 }, 
    { n:12 }, 
    { n:13 }, 
    { n:14 }, 
    { n:15 }, 
    { n:16 }, 
    { n:17 }
  ],
];

const relatedStories = [
  { label:{ en: 'The Huye Archive Vaults', rw: 'Ibitondozo by\'Huye' }, sub:{ en: '5 hrs video', rw: 'Amasaha 5 by\'ishusho' } },
  { label:{ en: 'Echoes of the King\'s Court', rw: 'Amajwi y\'Ingoro y\'Umwami' }, sub:{ en: '32 Audio', rw: 'Amajwi 32' } },
  { label:{ en: 'Imigongo: Geometry of Life', rw: 'Imigongo: Ubushobozi bw\'Ubwenge' }, sub:{ en: '12 Images', rw: 'Ishusho 12' } },
];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_RW = ['CYU', 'GTW', 'GTN', 'GTA', 'GTC', 'GTL', 'GTR'];

export default function Intldays() {
  const [activeFilter, setActiveFilter] = useState('National');
  const { t, language } = useLanguage();

  return (
    <Layout searchPlaceholder={t('intl.searchPlaceholder')}>
      <div className="intl-page">

        {/* Header + Theme card */}
        <div className="intl-top">
          <div className="intl-header">
            <h1>{t('intl.title')}</h1>
            <p>{t('intl.subtitle')}</p>
            <div className="intl-filter-chips">
              {['International', 'National', 'Artistic'].map((f) => {
                const labelKey = `intl.filter${f}`;
                return (
                  <button key={f} className={`intl-chip ${f.toLowerCase()} ${activeFilter===f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                    style={activeFilter===f ? {outline:'2px solid currentColor', outlineOffset:'2px'} : {}}>
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="theme-card">
            <img src={IMG.theme} alt="Theme of the Month" onError={e => { e.target.style.display='none'; }} />
            <div className="theme-card-overlay">
              <span className="theme-card-label">{t('intl.themeLabel')}</span>
              <span className="theme-card-title">{t('intl.themeTitle')}</span>
            </div>
          </div>
        </div>

        {/* ── Main layout: left col (calendar + national day), right col (spotlight + legend) ── */}
        <div className="calendar-layout">

          {/* LEFT COLUMN */}
          <div className="left-col">

            {/* Calendar */}
            <div className="calendar-card">
              <div className="calendar-nav">
                <span className="calendar-month">{t('intl.calendarMonth')}</span>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="calendar-nav-btns">
                    <button className="calendar-nav-btn">‹</button>
                    <button className="calendar-nav-btn">›</button>
                  </div>
                  <button className="today-btn">{t('intl.calendarTodayBtn')}</button>
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-days-header">
                  {(language === 'rw' ? DAYS_RW : DAYS).map((d) => (
                    <div key={d} className="calendar-day-label">{d}</div>
                  ))}
                </div>
                {calendarWeeks.map((week, wi) => (
                  <div key={wi} className="calendar-week">
                    {week.map((cell, ci) => (
                      <div key={ci} className={`calendar-cell ${cell.today ? 'today' : ''} ${cell.other ? 'other-month' : ''}`}>
                        <span className="cell-num">{cell.n}</span>
                        {cell.events && (
                          <div className="cell-events">
                            {cell.events.map((ev, ei) => (
                              <span key={ei} className={`cell-event-pill ${ev.cls}`}>
                                {getLocalizedText(ev.label, language)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Featured National Day — directly below calendar, fills remaining height */}
            <div className="featured-national">
              <img src={IMG.harvest} alt="Umuganura Festival"
                onError={e => { e.target.style.opacity='0'; }} />
              <div className="featured-nat-overlay" />
              <div className="featured-nat-content">
                <span className="featured-nat-badge">{t('intl.featuredBadge')}</span>
                <div className="featured-nat-title">{t('intl.featuredTitle')}</div>
                <div className="featured-nat-desc">{t('intl.featuredDesc')}</div>
                <div className="featured-nat-footer">
                  <span className="featured-nat-date">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {t('intl.featuredDate')}
                  </span>
                  <button className="btn-explore-trad">{t('intl.exploreTradBtn')}</button>
                </div>
              </div>
            </div>

          </div> {/* end left-col */}

          {/* RIGHT COLUMN — spotlight + legend */}
          <div className="right-col">
            <div className="day-spotlight">
              <div className="spotlight-label">{t('intl.spotlightLabel')}</div>
              <div className="spotlight-img">
                <img src={IMG.spotlight} alt="Spotlight"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div className="spotlight-img-placeholder" style={{ display:'none' }}></div>
                <div className="play-overlay">
                  <div className="play-circle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
              </div>
              <div className="spotlight-date-title">{t('intl.spotlightTitle')}</div>
              <p className="spotlight-desc">{t('intl.spotlightDesc')}</p>
              <div className="related-stories-label">{t('intl.relatedStoriesLabel')}</div>
              {relatedStories.map((s, i) => (
                <div key={i} className="related-story-item">
                  <div className="story-thumb" />
                  <div className="story-info">
                    <p>{getLocalizedText(s.label, language)}</p>
                    <span>{getLocalizedText(s.sub, language)}</span>
                  </div>
                </div>
              ))}
              <button className="view-records-btn">{t('intl.viewRecordsBtn')}</button>
            </div>

            <div className="legend-card">
              <div className="legend-label">{t('intl.legendLabel')}</div>
              {[
                { color: 'var(--primary)', labelKey: 'intl.legendHeritage' },
                { color: 'var(--primary)', labelKey: 'intl.legendPublic' },
                { color: 'var(--primary)', labelKey: 'intl.legendArtistic' },
              ].map((l, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: l.color }} />
                  <span>{t(l.labelKey)}</span>
                </div>
              ))}
            </div>
          </div> {/* end right-col */}

        </div> {/* end calendar-layout */}

      </div>
    </Layout>
  );
}
