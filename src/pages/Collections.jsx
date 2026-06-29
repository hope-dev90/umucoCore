import React from 'react';
import Layout from '../components/Layout';
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

const smallCollections = [
  {
    title: 'Imigongo Patterns',
    cat:   '',  catLabel: 'Visual Art', count: '115 Items',
    desc:  'A catalog of over 100 geometric variants used in traditional wall art, including the symbolic...',
    img:   IMG.imigongo,
    bg:    'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))',
  },
  {
    title: 'Sacred Spaces',
    cat:   '',  catLabel: 'Architecture', count: '18 Items',
    desc:  '3D reconstructions and high-fidelity photographs of the King\'s Palace and traditional...',
    img:   IMG.sacredSpaces,
    bg:    'linear-gradient(135deg,var(--primary),var(--primary-dark))',
  },
  {
    title: 'Woven Narratives',
    cat:   '',  catLabel: 'Craftsmanship', count: '56 Items',
    desc:  'Tracing the history of the Agaseke basket, from its role in royal gift-giving to its modern...',
    img:   IMG.weaving,
    bg:    'linear-gradient(135deg,var(--primary),var(--primary-dark))',
  },
];

export default function Collections() {
  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="collections-page">
        <div className="collections-header">
          <h1>Curated Collections</h1>
          <p>Explore meticulously preserved thematic archives that bridge the gap between ancient traditions and modern digital preservation.</p>
        </div>

        {/* Featured Row */}
        <div className="featured-row">
          {/* Big card */}
          <div className="featured-main">
            <div className="featured-main-img">
              <img src={IMG.inanga} alt="The Inanga Tradition"
                onError={(e) => {
  e.currentTarget.src = '/images/fallback.jpg';
}} />
              <div className="featured-img-placeholder" style={{ display:'none' }}></div>
              <span className="coll-badge">Oral Tradition</span>
            </div>
            <div className="featured-main-body">
              <div className="featured-main-meta">
                <h2 className="featured-main-title">The Inanga Tradition</h2>
                <span className="featured-item-count">24 Items</span>
              </div>
              <p className="featured-main-desc">
                A deep dive into the evolution of Rwanda's premier string instrument, featuring recordings from the early 1920s to contemporary masters.
              </p>
              <div className="featured-curator">
                <div className="curator-info">
                  <div className="curator-avatar">
                    <img src={IMG.curatorAvatar} alt="Dr. Aimé N."
                      onError={e => { e.currentTarget.style.display='none'; }} />
                  </div>
                  <span className="curator-name">Curated by Dr. Aimé N.</span>
                </div>
                <span className="open-archive-link">Open Archive →</span>
              </div>
            </div>
          </div>

          {/* Side card */}
          <div className="featured-side">
            <div className="featured-side-img">
              <img src={IMG.royalCourt} alt="Royal Court Rituals"
                onError={(e) => {
  e.currentTarget.src = '/images/fallback.jpg';
}} />
              <div className="featured-side-img-placeholder" style={{ display:'none' }}></div>
              <div className="featured-side-title">Royal Court Rituals</div>
            </div>
            <div className="featured-side-body">
              <div className="featured-side-count">42 Items</div>
              <p className="featured-side-quote">
                "Preserving the rhythmic essence of the Umuganura festival and its sacred ceremonial protocols."
              </p>
              <div className="featured-side-tags">
                <span className="side-tag">History</span>
                <span className="side-tag">Sacred</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small collection grid */}
        <div className="coll-grid">
          {smallCollections.map((c, i) => (
            <div key={i} className="coll-card">
              <div className="coll-card-img">
                <img src={c.img} alt={c.title}
                  onError={(e) => {
                e.currentTarget.src = '/images/fallback.jpg';
                  }} />
                <div className="coll-card-img-placeholder" style={{ background: c.bg, display:'none' }}>
                  {c.cat}
                </div>
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

        {/* Can't find box */}
        <div className="cant-find-box">
          <div className="cant-find-text">
            <h3>Can't find what you're looking for?</h3>
            <p>Our curators are constantly digitizing new artifacts. Join our mailing list to be notified when new collections are released.</p>
          </div>
          <div className="cant-find-actions">
            <button className="btn-subscribe">Subscribe</button>
            <button className="btn-contact">Contact Archive</button>
          </div>
        </div>
      </div>

    </Layout>
  );
}
