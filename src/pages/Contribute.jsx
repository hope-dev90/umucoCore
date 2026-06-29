import React from 'react';
import Layout from '../components/Layout';
import './Contribute.css';
import insightWeaving from '../assets/weaving_agaseke.jpg';
import insightInanga from '../assets/inanga.jpg';

const IMG = {
  insight1: insightWeaving,
  insight2: insightInanga,
};

const stats = [
  { icon:'', value:'42',   label:'Stories Recorded' },
  { icon:'', value:'156',  label:'Items Verified' },
  { icon:'', value:'1.2k', label:'Community Reach' },
  { icon:'', value:'Gold', label:'Champion Status' },
];

const actions = [
  { cls:'upload',  icon:'', title:'Upload Audio',        desc:'Share folk songs, proverbs, or poetry.' },
  { cls:'capture', icon:'', title:'Capture Photo',       desc:'Document artifacts, sites, or traditional attire.' },
  { cls:'submit',  icon:'', title:'Submit Oral History', desc:'Transcribe ancestral lineages and family lore.' },
];

const pipelineItems = [
  { title:'The Song of Nyiranseti (Audio)', sub:'Currently under Peer Review by Elder Sibani.', pct:85, cls:'fill-primary' },
  { title:'Nyanza Palace Digital Restoration (Photos)', sub:'Waiting for metadata tagging on 12 items.', pct:42, cls:'fill-warn' },
];

const insights = [
  { img: IMG.insight1, title:'The Logic of Zig-Zag', desc:'Special seminar on the research behind the geometric motif in...' },
  { img: IMG.insight2, title:'Preserving Inanga Melodies', desc:'A guide on recording the delicate strings of...' },
];

export default function Contribute() {
  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="contribute-page">
        <div className="contribute-hero">
          <h1>Muraho, Umuco Champion</h1>
          <p>Your contributions help preserve Rwanda's soul. Today, you are the bridge between ancestors and the next generation.</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="action-cards">
          {actions.map((a, i) => (
            <div key={i} className={`action-card ${a.cls}`}>
              <span className="action-card-icon">{a.icon}</span>
              <div className="action-card-title">{a.title}</div>
              <div className="action-card-desc">{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="contribute-bottom">
          <div className="pipeline-card">
            <div className="pipeline-header">
              <span className="pipeline-title">Verification Pipeline</span>
              <span className="pipeline-badge">3 Tasks Active</span>
            </div>
            {pipelineItems.map((p, i) => (
              <div key={i} className="pipeline-item">
                <div className="pipeline-item-title">{p.title}</div>
                <div className="pipeline-item-sub">{p.sub}</div>
                <div className="progress-bar-wrap">
                  <div className="pipeline-progress">
                    <div className={`pipeline-progress-fill ${p.cls}`} style={{ width:`${p.pct}%` }} />
                  </div>
                  <span className="pipeline-pct">{p.pct}% Complete</span>
                </div>
              </div>
            ))}
          </div>

          <div className="insights-card">
            <div className="insights-title">Cultural Insights</div>
            {insights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-thumb">
                  <img src={ins.img} alt={ins.title}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="insight-thumb-placeholder" style={{ display:'none' }}>🎵</div>
                </div>
                <div className="insight-info">
                  <h4>{ins.title}</h4>
                  <p>{ins.desc}</p>
                </div>
              </div>
            ))}
            <a className="view-hub-link">View Resource Hub →</a>
          </div>
        </div>

        <div className="contribute-footer">
          © 2024 Modern Heritage Archive — Empowering Umuco Champion across Rwanda.
        </div>
      </div>
    </Layout>
  );
}
