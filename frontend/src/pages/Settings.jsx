import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import './Settings.css';
import voicePhotoOne from '../assets/tra.png';
import voicePhotoTwo from '../assets/tra2.png';

const IMG = {
  voice1: voicePhotoOne,
  voice2: voicePhotoTwo,
};

const Icon = ({ d, size = 15, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  globe:     "M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  mic:       "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8",
  lock:      "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  warning:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
};

const PanelTitle = ({ iconKey, label }) => (
  <div className="panel-title">
    <span className="panel-title-svg"><Icon d={Icons[iconKey]} size={14} /></span>
    {label}
  </div>
);

export default function Settings() {
  const [notifArchive,  setNotifArchive]  = useState(true);
  const [notifNews,     setNotifNews]     = useState(false);
  const [notifEvents,   setNotifEvents]   = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [fontSize,      setFontSize]      = useState(50);
  const [highContrast,  setHighContrast]  = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { language: langCtx, setLanguage: setLangCtx, t } = useLanguage();

  const voices = [
    { name: 'Umutoni', sub: t('settings.voice.femaleSoft'), img: IMG.voice1 },
    { name: 'Kamanzi', sub: t('settings.voice.maleDeep'),   img: IMG.voice2 },
  ];

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'rw', label: t('settings.kinyarwanda') },
    { value: 'fr', label: t('settings.french') },
  ];

  return (
    <Layout searchPlaceholder="search.placeholder">
      <div className="settings-page">
        <div className="settings-header">
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>

        <div className="settings-only-grid">

          {/* ── COLUMN 1 ── */}
          <div className="settings-col">

            <div className="settings-panel">
              <PanelTitle iconKey="bell" label={t('settings.notifications')} />
              {[
                { label: t('settings.archiveUpdates'),       sub: t('settings.archiveUpdates.desc'), val: notifArchive, set: setNotifArchive },
                { label: t('settings.newsletter'),    sub: t('settings.newsletter.desc'),     val: notifNews,    set: setNotifNews },
                { label: t('settings.dayReminders'),sub: t('settings.dayReminders.desc'),   val: notifEvents,  set: setNotifEvents },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="notif-item">
                  <div><h4>{label}</h4><p>{sub}</p></div>
                  <button className={`toggle-switch ${val ? 'on' : 'off'}`} onClick={() => set(v => !v)} />
                </div>
              ))}
            </div>

            <div className="settings-panel">
              <PanelTitle iconKey="globe" label="Language & Display" />
              <div className="form-group">
                <label className="form-label">{t('settings.language')}</label>
                <select
                  className="form-select"
                  value={langCtx}
                  onChange={e => setLangCtx(e.target.value)}
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.dateFormat')}</label>
                <select className="form-select">
                  <option>DD / MM / YYYY</option>
                  <option>MM / DD / YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.timezone')}</label>
                <select className="form-select">
                  <option>{t('settings.timezone.cat')}</option>
                  <option>{t('settings.timezone.utc')}</option>
                  <option>{t('settings.timezone.london')}</option>
                </select>
              </div>
            </div>

          </div>

          {/* ── COLUMN 2 ── */}
          <div className="settings-col">

            <div className="settings-panel">
              <PanelTitle iconKey="eye" label={t('settings.accessibility')} />
              <div className="access-section-label">{t('settings.fontSize')}</div>
              <div className="font-size-slider">
                <span style={{ fontSize: 11 }}>A</span>
                <input type="range" min={0} max={100} value={fontSize}
                  onChange={e => setFontSize(e.target.value)} />
                <span style={{ fontSize: 16 }}>A</span>
              </div>
              <div className="font-preview" style={{ fontSize: `${11 + (fontSize / 100) * 6}px` }}>
                {t('settings.fontPreview')}
              </div>
              {[
                { label: t('settings.highContrast'),  sub: t('settings.highContrast.desc'), val: highContrast,  set: setHighContrast },
                { label: t('settings.reducedMotion'),        sub: t('settings.reducedMotion.desc'),      val: reducedMotion, set: setReducedMotion },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="access-toggle-row">
                  <div>
                    <div className="access-toggle-title">{label}</div>
                    <div className="access-toggle-sub">{sub}</div>
                  </div>
                  <button className={`toggle-switch ${val ? 'on' : 'off'}`} onClick={() => set(v => !v)} />
                </div>
              ))}
              <button className="save-access-btn">{t('settings.saveAccessibility')}</button>
            </div>

            <div className="settings-panel">
              <PanelTitle iconKey="mic" label={t('settings.voiceSelection')} />
              <p className="panel-sub">{t('settings.voiceSelection.desc')}</p>
              {voices.map((v, i) => (
                <div key={i} className={`voice-option ${selectedVoice === i ? 'selected' : ''}`}
                  onClick={() => setSelectedVoice(i)}>
                  <div className="voice-option-avatar">
                    <img src={v.img} alt={v.name} onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="voice-option-info">
                    <h4>{v.name}</h4><p>{v.sub}</p>
                  </div>
                  {selectedVoice === i && <span className="voice-active-badge">Active</span>}
                </div>
              ))}
            </div>

          </div>

          {/* ── COLUMN 3 ── */}
          <div className="settings-col">

            <div className="settings-panel">
              <PanelTitle iconKey="lock" label={t('settings.accountSecurity')} />
              {[
                { label: t('settings.changePassword'),           sub: t('settings.changePassword.desc'),     action: <button className="chevron-btn">›</button> },
                { label: t('settings.twoFactor'), sub: t('settings.twoFactor.active'),     action: <span className="manage-link">{t('settings.manage')}</span> },
                { label: t('settings.activeSessions'),           sub: t('settings.activeSessions.desc'),           action: <span className="manage-link">{t('settings.view')}</span> },
                { label: t('settings.loginHistory'),             sub: t('settings.loginHistory.desc'),   action: <button className="chevron-btn">›</button> },
              ].map(({ label, sub, action }) => (
                <div key={label} className="security-item">
                  <div className="security-item-left"><h4>{label}</h4><p>{sub}</p></div>
                  {action}
                </div>
              ))}
            </div>

            <div className="settings-panel">
              <PanelTitle iconKey="shield" label={t('settings.privacy')} />
              {[
                { label: t('settings.dataDownload'),    sub: t('settings.dataDownload.desc'),    action: <button className="chevron-btn">›</button> },
                { label: t('settings.cookiePrefs'), sub: t('settings.cookiePrefs.desc'),     action: <span className="manage-link">{t('settings.manage')}</span> },
              ].map(({ label, sub, action }) => (
                <div key={label} className="security-item">
                  <div className="security-item-left"><h4>{label}</h4><p>{sub}</p></div>
                  {action}
                </div>
              ))}
            </div>

            <div className="danger-panel">
              <div className="danger-header">
                <Icon d={Icons.warning} size={14} /> {t('settings.dangerZone')}
              </div>
              <p className="danger-text">
                {t('settings.dangerZone.desc')}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-deactivate">{t('settings.deactivate')}</button>
                <button className="btn-delete">{t('settings.delete')}</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
