import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Saved.css';
import hillsImg from '../assets/nyanza.jpg';
import weavingImg from '../assets/weaving_agaseke.jpg';
import campfireImg from '../assets/listen/moon-story.jpg';

const IMG = {
  hills: hillsImg,
  weaving: weavingImg,
  campfire: campfireImg,
};

const savedCollections = [
  { icon:'', color:'var(--primary-soft)', name:'Oral Traditions', meta:'45 Stories • 420 MB', toggle:'on',  status:'offline' },
  { icon:'', color:'var(--primary-soft)', name:'Inanga Melodies', meta:'12 Audios • 158 MB',  toggle:'off', status:'online' },
  { icon:'',  color:'var(--primary-soft)', name:'Pre-Colonial Maps', meta:'8 Artifacts • 89 MB', toggle:'on', status:'offline' },
];

const recentSaves = [
  { img: IMG.hills,   badge:'offline', cat:'History • 12 hrs read', title:"The Kings of Nyanza: A Legacy of Unity",  action:'Listen' },
  { img: IMG.weaving, badge:'online',  cat:'Artisan · Video Tutorial', title:'Agaseke: Secrets of the Peace Basket', action:'Make Offline' },
];

export default function Saved() {
  const [toggles, setToggles] = useState({ 0: true, 1: false, 2: true });

  return (
    <Layout searchPlaceholder="Search saved stories...">
      <div className="saved-page">
        <div className="saved-header">
          <div className="saved-header-left">
            <h1>Saved Stories</h1>
            <p>Your personal archive of Rwandan heritage, available anywhere.</p>
          </div>
          <div className="storage-info">
            <div className="storage-label">Storage Manager 1.2 GB / 5.0 GB</div>
            <div className="storage-bar"><div className="storage-fill" /></div>
            <div className="storage-actions">
              <button className="storage-btn sync">⟳ Cloud Synced</button>
              <button className="storage-btn download">⬇ Download All</button>
            </div>
          </div>
        </div>

        <div className="saved-grid">
          {/* Collections sidebar */}
          <div className="saved-collections">
            <h3>Collections</h3>
            {savedCollections.map((c, i) => (
              <div key={i} className="saved-coll-item">
                <div className="coll-item-top">
                  <div className="coll-item-icon-wrap">
                    <div className="coll-item-icon" style={{ background: c.color }}>{c.icon}</div>
                    <span className="coll-item-name">{c.name}</span>
                  </div>
                  <button
                    className={`coll-toggle ${toggles[i] ? 'on' : 'off'}`}
                    onClick={() => setToggles(t => ({ ...t, [i]: !t[i] }))}
                  />
                </div>
                <div className="coll-item-meta">{c.meta}</div>
                <div className={`coll-item-status ${c.status === 'offline' ? 'status-offline' : 'status-online'}`}>
                  {c.status === 'offline' ? '✓ Available Offline' : '☁ Online Only'}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Saves */}
          <div className="recent-saves">
            <h3>
              Recent Saves
              <div className="saves-toggle-btns">
                <button className="saves-view-btn active">⊞</button>
                <button className="saves-view-btn">≡</button>
              </div>
            </h3>
            <div className="saves-grid">
              {recentSaves.map((s, i) => (
                <div key={i} className="save-card">
                  <div className="save-card-img">
                    <img src={s.img} alt={s.title}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="save-card-img-placeholder"
                      style={{ background: i===0?'linear-gradient(135deg,var(--primary),var(--primary-dark))':'linear-gradient(135deg,var(--primary),var(--primary-dark))', display:'none' }}>
                      {i===0?'':''}
                    </div>
                    <span className={`save-status-badge ${s.badge==='offline'?'badge-offline':'badge-online'}`}>
                      {s.badge==='offline'?'OFFLINE':'ONLINE'}
                    </span>
                  </div>
                  <div className="save-card-body">
                    <div className="save-card-cat">{s.cat}</div>
                    <div className="save-card-title">{s.title}</div>
                    <div className="save-card-actions">
                      <button className="save-card-action-btn">
                        {s.action === 'Listen' ? '' : ''} {s.action}
                      </button>
                      <button className="save-card-delete">🗑</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Campfire image card */}
              <div className="save-card">
                <div className="save-card-img">
                  <img src={IMG.campfire} alt="Campfire story"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="save-card-img-placeholder"
                    style={{ background:'linear-gradient(135deg,var(--primary-dark),var(--primary-dark))', display:'none' }}></div>
                </div>
                <div className="save-card-body">
                  <div className="save-card-cat">Music · Audio Track</div>
                  <div className="save-card-title">Umushayayo: Rhythms of Grace</div>
                  <div className="save-card-actions">
                    <span className="playing-badge">▶ Playing</span>
                    <button className="save-card-delete">🗑</button>
                  </div>
                </div>
              </div>

              {/* Save New Story */}
              <div className="save-new-card">
                <div className="save-new-plus">＋</div>
                <div className="save-new-label">Save New Story<br/>Find More to Explore</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
