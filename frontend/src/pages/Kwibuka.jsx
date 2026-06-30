import React from 'react';
import Layout from '../components/Layout';
import './Kwibuka.css';
import ReflectionImg from '../assets/kwibuka/reflection.jpg';
import Memorial1Img from '../assets/kwibuka/memorial1.jpg';
import Memorial2Img from '../assets/kwibuka/memorial2.jpg';

const IMG = {
  reflection: ReflectionImg,
  memorial1: Memorial1Img,
  memorial2: Memorial2Img,
};

const voices = [
  { type: 'Audio Testimony', title: 'The Hill of Bisesero', excerpt: '"We stood together on those slopes for weeks. Our unity..."' },
  { type: 'Written Archive',  title: 'Letters from Nyamata', excerpt: 'A collection of recovered letters documenting the final...' },
  { type: 'Video Interview',  title: 'Finding Forgiveness',  excerpt: 'Jean-Claude reflects on 30 years of reconciliation and...' },
];

const events = [
  { dot: 'active', date: 'April 7',  title: 'Lighting of the Flame of Remembrance', desc: 'The national commemoration period begins with the lighting of the eternal flame at the Kigali Genocide Memorial.' },
  { dot: 'past',   date: 'April 13', title: 'National Dialogue on Reconstruction',   desc: "A youth-led forum discussing the progress of Rwanda's social fabric and economic transformation over three decades." },
  { dot: 'future', date: 'May 20',   title: 'The International Symposium of Memory', desc: 'Global scholars and survivors convene to share insights on genocide prevention and archival technologies.' },
];

export default function Kwibuka() {
  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="kwibuka-page">

        {/* Today's Reflection hero */}
        <div className="reflection-hero">
          <img src={IMG.reflection} alt="Reflection" className="reflection-hero-bg"
            onError={e => e.target.style.display='none'} />
          <div className="reflection-hero-overlay" />
          <div className="reflection-hero-content">
            <div className="reflection-label">✦ Today's Reflection</div>
            <div className="reflection-quote">
              "Memory is not just about the past; it is the seed of our future peace."
            </div>
            <div className="reflection-author">— Honorine U., Survivor Testimony, 2024</div>
            <div className="reflection-actions">
              <button className="btn-testimony">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Read Full Testimony
              </button>
              <button className="btn-share-reflect">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share Reflection
              </button>
            </div>
          </div>
        </div>

        {/* Mid grid: Memorial + Voices */}
        <div className="kwibuka-mid">
          <div className="memorial-card">
            <div className="memorial-card-header">
              <div>
                <div className="memorial-card-title">Virtual Memorial Visits</div>
                <div className="memorial-card-sub">Step into the halls of remembrance from anywhere.</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="memorial-photos">
              {[IMG.memorial1, IMG.memorial2].map((src, i) => (
                <div key={i} className="memorial-photo">
                  <img src={src} alt={`Memorial ${i+1}`}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="memorial-photo-placeholder"
                    style={{ background: i===0 ? 'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))' : 'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))', display:'none' }}>
                    {i===0 ? '' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="voices-card">
            <div className="voices-title">Voices of Hope</div>
            {voices.map((v, i) => (
              <div key={i} className="voice-item">
                <div className="voice-type">{v.type}</div>
                <div className="voice-title">{v.title}</div>
                <div className="voice-excerpt">{v.excerpt}</div>
              </div>
            ))}
            <button className="explore-repo-btn">Explore Repository</button>
          </div>
        </div>

        {/* Events timeline */}
        <div className="events-section">
          <div className="events-header">
            <div className="events-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Kwibuka 30: Commemorative Events
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          {events.map((ev, i) => (
            <div key={i} className="event-item">
              <div className={`event-dot ${ev.dot}`} />
              <div className="event-info">
                <div className="event-date">{ev.date}</div>
                <div className="event-title">{ev.title}</div>
                <div className="event-desc">{ev.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="access-fab"></button>
    </Layout>
  );
}
