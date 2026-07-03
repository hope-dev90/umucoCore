import React from 'react';
import Layout from '../components/Layout';
import './Contribute.css';
import insightWeaving from '../assets/weaving_agaseke.jpg';
import insightInanga from '../assets/inanga.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/i18n';

const IMG = {
  insight1: insightWeaving,
  insight2: insightInanga,
};

const stats = [
  { icon:'', value:'42', labelKey: 'contribute.statsStoriesRecorded' },
  { icon:'', value:'156', labelKey: 'contribute.statsItemsVerified' },
  { icon:'', value:'1.2k', labelKey: 'contribute.statsCommunityReach' },
  { icon:'', value:'Gold', labelKey: 'contribute.statsChampionStatus' },
];

const actions = [
  { cls:'upload', icon:'', titleKey: 'contribute.uploadAudioTitle', descKey: 'contribute.uploadAudioDesc' },
  { cls:'capture', icon:'', titleKey: 'contribute.capturePhotoTitle', descKey: 'contribute.capturePhotoDesc' },
  { cls:'submit', icon:'', titleKey: 'contribute.submitOralHistoryTitle', descKey: 'contribute.submitOralHistoryDesc' },
];

const pipelineItems = [
  { 
    title:{ en: 'The Song of Nyiranseti (Audio)', rw: 'Indirimbo ya Nyiranseti (Umva)' }, 
    sub:{ en: 'Currently under Peer Review by Elder Sibani.', rw: 'Icyo kijya kugenzura na Nyakuru Sibani.' }, 
    pct:85, 
    cls:'fill-primary' 
  },
  { 
    title:{ en: 'Nyanza Palace Digital Restoration (Photos)', rw: 'Ubwiyunge wa Ingoro y\'Nyanza (Ishusho)' }, 
    sub:{ en: 'Waiting for metadata tagging on 12 items.', rw: 'Kugena ibintu byo kumenya ibintu 12.' }, 
    pct:42, 
    cls:'fill-warn' 
  },
];

const insights = [
  { 
    img: IMG.insight1, 
    title:{ en: 'The Logic of Zig-Zag', rw: 'Ubwenge bw\'Umwuga' }, 
    desc:{ en: 'Special seminar on the research behind the geometric motif in...', rw: 'Ishusho y\'imyaka ya research nyuma y\'ubushobozi bw\'...' } 
  },
  { 
    img: IMG.insight2, 
    title:{ en: 'Preserving Inanga Melodies', rw: 'Kubika Indirimbo z\'Inanga' }, 
    desc:{ en: 'A guide on recording the delicate strings of...', rw: 'Urufunguzo rwo kumenya amajwi angana y\'...' } 
  },
];

export default function Contribute() {
  const { t, language } = useLanguage();

  return (
    <Layout searchPlaceholder={t('contribute.searchPlaceholder')}>
      <div className="contribute-page">
        <div className="contribute-hero">
          <h1>{t('contribute.heroTitle')}</h1>
          <p>{t('contribute.heroSub')}</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{t(s.labelKey)}</span>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="action-cards">
          {actions.map((a, i) => (
            <div key={i} className={`action-card ${a.cls}`}>
              <span className="action-card-icon">{a.icon}</span>
              <div className="action-card-title">{t(a.titleKey)}</div>
              <div className="action-card-desc">{t(a.descKey)}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="contribute-bottom">
          <div className="pipeline-card">
            <div className="pipeline-header">
              <span className="pipeline-title">{t('contribute.pipelineTitle')}</span>
              <span className="pipeline-badge">3 {language === 'rw' ? 'Ibyo' : 'Tasks'} {language === 'rw' ? 'Biri' : 'Active'}</span>
            </div>
            {pipelineItems.map((p, i) => (
              <div key={i} className="pipeline-item">
                <div className="pipeline-item-title">{getLocalizedText(p.title, language)}</div>
                <div className="pipeline-item-sub">{getLocalizedText(p.sub, language)}</div>
                <div className="progress-bar-wrap">
                  <div className="pipeline-progress">
                    <div className={`pipeline-progress-fill ${p.cls}`} style={{ width:`${p.pct}%` }} />
                  </div>
                  <span className="pipeline-pct">{p.pct}% {language === 'rw' ? 'Byasohotse' : 'Complete'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="insights-card">
            <div className="insights-title">{t('contribute.insightsTitle')}</div>
            {insights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-thumb">
                  <img src={ins.img} alt={getLocalizedText(ins.title, language)}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="insight-thumb-placeholder" style={{ display:'none' }}>🎵</div>
                </div>
                <div className="insight-info">
                  <h4>{getLocalizedText(ins.title, language)}</h4>
                  <p>{getLocalizedText(ins.desc, language)}</p>
                </div>
              </div>
            ))}
            <a className="view-hub-link">{t('contribute.viewResourceHubLink')}</a>
          </div>
        </div>

        <div className="contribute-footer">
          {t('contribute.footer')}
        </div>
      </div>
    </Layout>
  );
}
