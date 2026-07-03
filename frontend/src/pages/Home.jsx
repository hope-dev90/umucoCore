import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';
import nyanzeImage from '../assets/home/nyanza.jpg';
import intoreImage from '../assets/home/intore.jpg';
import kigeliImage from '../assets/home/kigeli.jpg';
import inangaImage from '../assets/home/inanga.jpg';
import ubudeheImage from '../assets/home/ubudehe.jpg';
import {
  Headphones,
  Plus,
  Search,
  FileText,
  Music,
  Video
} from 'lucide-react';

const exploreItems = [
  {
    label: 'Intore Culture',
    meta: 'History • 12 mins left',
    image: intoreImage,
  },
  {
    label: 'Kigeli IV Rwabugiri',
    meta: 'Linkage • New Activity',
    image: kigeliImage,
  },
  {
    label: 'Traditional Music',
    meta: 'Audio • 4 Stories',
    image: inangaImage,
  },
  {
    label: 'Ubudehe',
    meta: 'Values • Updated',
    image: ubudeheImage,
  },
];

// 1. Map icons to recent item types
const recentItems = [
  { icon: <Music size={16} />,  type: 'audio', title: 'Oral History – Nyamasheke', date: 'Audio • 12 May 2025' },
  { icon: <Video size={16} />,  type: 'video', title: 'Traditional Dance – Intore', date: 'Video • 10 May 2025' },
  { icon: <FileText size={16} />, type: 'doc',   title: 'Document – 1962 Letter',    date: 'Document • 8 May 2025' },
];

const activityItems = [
  { label: 'Viewed: The Royal Palace – Nyanza', time: '16 May 2025' },
  { label: 'Saved: Intore Dance',               time: '15 May 2025' },
  { label: 'Listened: Byivugo by Intore',       time: '16 May 2025' },
];

const upcomingDays = [
  { day: '21', month: 'MAY', title: 'Cultural Diversity Day', sub: 'Dialogue and Development • 21 May 2025' },
  { day: '23', month: 'JUN', title: "International Widows' Day", sub: 'Community Support & History • 23 June 2025' },
  { day: '09', month: 'AUG', title: 'Day of Indigenous Peoples', sub: 'Global Heritage Preservation • 9 August 2025' },
];

// 2. Map icons to quick action items
const quickActions = [
  { icon: <Headphones size={16} />, label: 'Listen (Tega Amatsi)' },
  { icon: <Plus size={16} />,       label: 'Contribute' },
  { icon: <Search size={16} />,     label: 'Advanced Search' },
];

const topics = ['Ubwiru', 'Amateka y\'u Rwanda', 'Ingoma', 'Abami b\'u Rwanda', 'Indangagaciro', 'Uburego'];

export default function Home() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="home-header">
        <h1>Murakaza neza, {user?.name || 'Guest'}</h1>
        <p>Explore, learn and preserve Rwanda's heritage.</p>
      </div>

      <div className="home-grid">
        {/* LEFT: main column */}
        <div>
          {/* Today's Highlight */}
          <div className="highlight-card">
            <span className="highlight-badge"> Today's Highlight</span>
            <div className="highlight-image">
              <img
                src={nyanzeImage}
                alt="Royal Palace Nyanza"
                className="highlight-img"
              />
            </div>
            <div className="highlight-content">
              <div>
                <h2>The Royal Palace – Nyanza</h2>
                <p>The seat of Rwanda's monarchy and a symbol of our history. Experience the living history through interactive 3D archives.</p>
              </div>
              <div className="highlight-actions">
                <button className="btn-primary">Explore Now</button>
                <button className="btn-outline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Continue Exploring */}
          <div className="section-header">
            <span className="section-title">Continue Exploring</span>
            <span className="section-link">View all →</span>
          </div>

          <div className="explore-cards">
            {exploreItems.map((item, i) => (
              <div key={i} className="explore-thumb">
                <div className="explore-thumb-img">
                  <img
                    src={item.image}
                    alt={item.label}
                  />
                </div>
                <div className="explore-thumb-label">{item.label}</div>
                <div className="explore-thumb-meta">{item.meta}</div>
              </div>
            ))}
          </div>

          {/* Popular Topics */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Popular Topics
            </span>
          </div>
          <div className="topics-wrap">
            {topics.map(t => <span key={t} className="topic-chip">{t}</span>)}
          </div>

          {/* Bottom Row */}
          <div className="bottom-row">
            {/* Kwibuka */}
            <div className="kwibuka-card">
              <div>
                <h3>Kwibuka 31</h3>
                <p style={{ fontSize: 10, marginTop: 3 }}>7 April 2025 – 7 April 2025,<br/>Remember, Unite, Renew, Honor the history and resilience of a nation.</p>
              </div>
              <div>
                <div className="kwibuka-countdown">
                  <span className="days-num">31</span>
                  <span className="days-label">DAYS<br/>TO GO</span>
                </div>
                <button className="kwibuka-btn">Explore Kwibuka Content</button>
              </div>
            </div>

            {/* Recently Added */}
            <div className="recent-list">
              <div className="section-header" style={{ marginTop: 0 }}>
                <span className="section-title">Recently Added</span>
                <span className="section-link">View all</span>
              </div>
              {recentItems.map((item, i) => (
                <div key={i} className="recent-item">
                  {/* 3. Rendered the icon component dynamically here */}
                  <div className={`recent-icon ${item.type}`}>{item.icon}</div>
                  <div className="recent-info">
                    <h4>{item.title}</h4>
                    <p>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Your Activity */}
            <div className="activity-list">
              <div className="section-header" style={{ marginTop: 0 }}>
                <span className="section-title">Your Activity</span>
              </div>
              {activityItems.map((item, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-info">
                    <h4>{item.label}</h4>
                    <p>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: sidebar */}
        <div className="home-sidebar">
          {/* Date */}
          <div className="date-card">
            <div className="date-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="date-info">
              <span>Today's Date</span>
              <span>Sunday, 18 May 2025</span>
            </div>
          </div>

          {/* Quote */}
          <div className="quote-card">
            <div className="quote-label"> Quote of the Day</div>
            <div className="quote-text">"Umuco ni u Rwanda, Rwanda ni twe."</div>
            <div className="quote-sub">Culture is Rwanda, and Rwanda is us.</div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="quick-action-title">Quick Actions</div>
            {quickActions.map((qa, i) => (
              <div key={i} className="quick-action-item">
                <div className="quick-action-left">
                  {/* 4. Swapped qa.emoji for qa.icon */}
                  <div className="quick-action-icon">
                    {qa.icon}
                  </div>
                  <span className="quick-action-label">{qa.label}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Upcoming Days */}
          <div className="upcoming-card">
            <div className="section-header" style={{ marginTop: 0 }}>
              <span className="section-title">Upcoming Days</span>
              <span className="section-link">View all</span>
            </div>
            {upcomingDays.map((day, i) => (
              <div key={i} className="upcoming-item">
                <div className="upcoming-date">
                  <span className="day">{day.day}</span>
                  <span className="month">{day.month}</span>
                </div>
                <div className="upcoming-info">
                  <h4>{day.title}</h4>
                  <p>{day.sub}</p>
                </div>
              </div>
            ))}
            <button className="see-calendar-btn">See Full Calendar</button>
          </div>
        </div>
      </div>

    </Layout>
  );
}
