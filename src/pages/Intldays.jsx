import React, { useState } from 'react';
import Layout from '../components/Layout';
import './IntlDays.css';
import themeImg from '../assets/international/imigongo.jpg';
import spotlightImg from '../assets/international/nyanza.jpg';
import harvestImg from '../assets/international/umuganura.jpg';

const IMG = {
  theme: themeImg,
  spotlight: spotlightImg,
  harvest: harvestImg,
};

const calendarWeeks = [
  [
    { n:27,other:true }, { n:28,other:true }, { n:29,other:true }, { n:30,other:true },
    { n:1, events:[{label:'Rwandan H.',cls:'pill-heritage'}] },
    { n:2, events:[{label:'Harvest Crit',cls:'pill-national'}] },
    { n:3 }
  ],
  [
    { n:4 }, { n:5 },
    { n:6, today:true, events:[{label:'National Museum',cls:'pill-national'}] },
    { n:7 }, { n:8, events:[{label:'Lit. Day',cls:'pill-intl'}] }, { n:9 }, { n:10 }
  ],
  [
    { n:11 }, { n:12 }, { n:13 }, { n:14 }, { n:15 }, { n:16 }, { n:17 }
  ],
];

const relatedStories = [
  { label:'The Huye Archive Vaults', sub:'5 hrs video' },
  { label:"Echoes of the King's Court", sub:'32 Audio' },
  { label:'Imigongo: Geometry of Life', sub:'12 Images' },
];

export default function IntlDays() {
  const [activeFilter, setActiveFilter] = useState('National');

  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="intl-page">

        {/* Header + Theme card */}
        <div className="intl-top">
          <div className="intl-header">
            <h1>National Cultural Calendar</h1>
            <p>Explore the rich tapestry of Rwandan national days, heritage milestones, and cultural celebrations preserved and presented for every generation.</p>
            <div className="intl-filter-chips">
              {['International','National','Artistic'].map(f => (
                <button key={f} className={`intl-chip ${f.toLowerCase()} ${activeFilter===f?'active':''}`}
                  onClick={() => setActiveFilter(f)}
                  style={activeFilter===f?{outline:'2px solid currentColor',outlineOffset:'2px'}:{}}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-card">
            <img src={IMG.theme} alt="Theme of the Month" onError={e => { e.target.style.display='none'; }} />
            <div className="theme-card-overlay">
              <span className="theme-card-label">Theme of the Month</span>
              <span className="theme-card-title">Seeds of Continuity</span>
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
                <span className="calendar-month">September 2024</span>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="calendar-nav-btns">
                    <button className="calendar-nav-btn">‹</button>
                    <button className="calendar-nav-btn">›</button>
                  </div>
                  <button className="today-btn">Today</button>
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-days-header">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} className="calendar-day-label">{d}</div>
                  ))}
                </div>
                {calendarWeeks.map((week, wi) => (
                  <div key={wi} className="calendar-week">
                    {week.map((cell, ci) => (
                      <div key={ci} className={`calendar-cell ${cell.today?'today':''} ${cell.other?'other-month':''}`}>
                        <span className="cell-num">{cell.n}</span>
                        {cell.events && (
                          <div className="cell-events">
                            {cell.events.map((ev, ei) => (
                              <span key={ei} className={`cell-event-pill ${ev.cls}`}>{ev.label}</span>
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
                <span className="featured-nat-badge">Featured National Day</span>
                <div className="featured-nat-title">Umuganura: The National Harvest Festival</div>
                <div className="featured-nat-desc">Celebrating the first fruits and the spirit of shared prosperity across the land.</div>
                <div className="featured-nat-footer">
                  <span className="featured-nat-date">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Oct 18, 2024
                  </span>
                  <button className="btn-explore-trad">Explore Traditions</button>
                </div>
              </div>
            </div>

          </div>{/* end left-col */}

          {/* RIGHT COLUMN — spotlight + legend */}
          <div className="right-col">
            <div className="day-spotlight">
              <div className="spotlight-label">Day Spotlight</div>
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
              <div className="spotlight-date-title">September 5: National Museum Day</div>
              <p className="spotlight-desc">
                A key dedicated to the preservation of our collective memory. This year's focus is on digital repatriation and the "Voices of the Elders" oral archive.
              </p>
              <div className="related-stories-label">Related Stories</div>
              {relatedStories.map((s, i) => (
                <div key={i} className="related-story-item">
                  <div className="story-thumb" />
                  <div className="story-info">
                    <p>{s.label}</p>
                    <span>{s.sub}</span>
                  </div>
                </div>
              ))}
              <button className="view-records-btn">View Detailed Records</button>
            </div>

            <div className="legend-card">
              <div className="legend-label">⊞ Legend</div>
              {[
                { color:'var(--primary)', label:'National Heritage Events' },
                { color:'var(--primary)', label:'Public / National Days' },
                { color:'var(--primary)', label:'Artistic & Cultural Fests' },
              ].map((l, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: l.color }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>{/* end right-col */}

        </div>{/* end calendar-layout */}

      </div>
    </Layout>
  );
}
