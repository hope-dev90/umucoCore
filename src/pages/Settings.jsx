import React, { useState } from 'react';
import Layout from '../components/Layout';
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
  const [language,      setLanguage]      = useState('English (UK)');

  const voices = [
    { name: 'Umutoni', sub: '(Female, Soft)', img: IMG.voice1 },
    { name: 'Kamanzi', sub: '(Male, Deep)',   img: IMG.voice2 },
  ];

  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Control your experience — notifications, accessibility, audio, language, and account security.</p>
        </div>

        <div className="settings-only-grid">

          {/* ── COLUMN 1 ── */}
          <div className="settings-col">

            <div className="settings-panel">
              <PanelTitle iconKey="bell" label="Notifications" />
              {[
                { label: 'Archive Updates',       sub: 'New artifacts and stories matching your interests.', val: notifArchive, set: setNotifArchive },
                { label: 'Monthly Newsletter',    sub: 'Cultural highlights digest, delivered monthly.',     val: notifNews,    set: setNotifNews },
                { label: 'National Day Reminders',sub: 'Alerts before upcoming heritage calendar events.',   val: notifEvents,  set: setNotifEvents },
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
                <label className="form-label">Interface Language</label>
                <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option>English (UK)</option>
                  <option>Kinyarwanda</option>
                  <option>French</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select className="form-select">
                  <option>DD / MM / YYYY</option>
                  <option>MM / DD / YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Time Zone</label>
                <select className="form-select">
                  <option>Africa/Kigali (CAT, UTC+2)</option>
                  <option>UTC</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>

          </div>

          {/* ── COLUMN 2 ── */}
          <div className="settings-col">

            <div className="settings-panel">
              <PanelTitle iconKey="eye" label="Accessibility" />
              <div className="access-section-label">Content Font Size</div>
              <div className="font-size-slider">
                <span style={{ fontSize: 11 }}>A</span>
                <input type="range" min={0} max={100} value={fontSize}
                  onChange={e => setFontSize(e.target.value)} />
                <span style={{ fontSize: 16 }}>A</span>
              </div>
              <div className="font-preview" style={{ fontSize: `${11 + (fontSize / 100) * 6}px` }}>
                Preview: "Inzuzi cattle were revered across the hills of Rwanda."
              </div>
              {[
                { label: 'High Contrast Mode',  sub: 'Increases color contrast for readability.', val: highContrast,  set: setHighContrast },
                { label: 'Reduce Motion',        sub: 'Disables animations and transitions.',      val: reducedMotion, set: setReducedMotion },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="access-toggle-row">
                  <div>
                    <div className="access-toggle-title">{label}</div>
                    <div className="access-toggle-sub">{sub}</div>
                  </div>
                  <button className={`toggle-switch ${val ? 'on' : 'off'}`} onClick={() => set(v => !v)} />
                </div>
              ))}
              <button className="save-access-btn">Save Accessibility Profile</button>
            </div>

            <div className="settings-panel">
              <PanelTitle iconKey="mic" label="Tega Amatwi — Voice Selection" />
              <p className="panel-sub">Choose the text-to-speech voice for the archive reader.</p>
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
              <PanelTitle iconKey="lock" label="Account Security" />
              {[
                { label: 'Change Password',           sub: 'Last changed 4 months ago',     action: <button className="chevron-btn">›</button> },
                { label: 'Two-Factor Authentication', sub: 'Active — SMS verification',     action: <span className="manage-link">Manage</span> },
                { label: 'Active Sessions',           sub: '2 devices logged in',           action: <span className="manage-link">View</span> },
                { label: 'Login History',             sub: 'Last login: Today, 07:42 AM',   action: <button className="chevron-btn">›</button> },
              ].map(({ label, sub, action }) => (
                <div key={label} className="security-item">
                  <div className="security-item-left"><h4>{label}</h4><p>{sub}</p></div>
                  {action}
                </div>
              ))}
            </div>

            <div className="settings-panel">
              <PanelTitle iconKey="shield" label="Privacy" />
              {[
                { label: 'Data & Download',    sub: 'Export a copy of your archive data.',    action: <button className="chevron-btn">›</button> },
                { label: 'Cookie Preferences', sub: 'Manage what data we store locally.',     action: <span className="manage-link">Manage</span> },
              ].map(({ label, sub, action }) => (
                <div key={label} className="security-item">
                  <div className="security-item-left"><h4>{label}</h4><p>{sub}</p></div>
                  {action}
                </div>
              ))}
            </div>

            <div className="danger-panel">
              <div className="danger-header">
                <Icon d={Icons.warning} size={14} /> Account Management
              </div>
              <p className="danger-text">
                Deleting your account will permanently remove your saved collections, contributions, and history. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-deactivate">Deactivate</button>
                <button className="btn-delete">Delete Account</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
