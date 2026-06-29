import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Settings.css';
import profilePhoto from '../assets/iraba.jpg';
import voicePhotoOne from '../assets/tra.png';
import voicePhotoTwo from '../assets/tra2.png';

const IMG = {
  profilePhoto,
  voice1: voicePhotoOne,
  voice2: voicePhotoTwo,
};

const interests = ['Oral Tradition', 'Artifacts', 'History', 'Poetry'];

export default function Settings() {
  const [notifArchive, setNotifArchive] = useState(true);
  const [notifNews, setNotifNews]       = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [fontSize, setFontSize]         = useState(50);
  const [highContrast, setHighContrast] = useState(false);

  const voices = [
    { name: 'Umutoni', sub:'(Female, Soft)',  img: IMG.voice1 },
    { name: 'Kamanzi', sub:'(Male, Deep)',    img: IMG.voice2 },
  ];

  return (
    <Layout searchPlaceholder="Search archive...">
      <div className="settings-page">
        <div className="settings-header">
          <h1>Profile &amp; Settings</h1>
          <p>Manage your digital heritage experience. Customize your interface, secure your account, and set your accessibility preferences.</p>
        </div>

        <div className="settings-grid">
          {/* LEFT */}
          <div>
            <div className="profile-card">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  <img src={IMG.profilePhoto} alt="Kelia Umutoni"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="profile-avatar-placeholder" style={{ display:'none' }}>👤</div>
                  <button className="avatar-edit-btn"></button>
                </div>
                <div className="profile-name">Kelia Umutoni</div>
                <div className="profile-role">Archivist Member since 2023</div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue="Kelia Umutoni" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" defaultValue="kelia.u@modernheritage.rw" />
              </div>
              <div className="form-group">
                <label className="form-label">Display Language</label>
                <select className="form-select">
                  <option>English (UK)</option>
                  <option>Kinyarwanda</option>
                  <option>French</option>
                </select>
              </div>
              <button className="btn-update">Update Personal Details</button>
            </div>

            <div className="interests-card">
              <div className="interests-title">Interests</div>
              <div className="interests-chips">
                {interests.map((tag, i) => (
                  <span key={i} className="interest-chip active">{tag}</span>
                ))}
                <button className="add-interest-btn">+ Add More</button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="settings-panels">
            {/* Account Security */}
            <div className="settings-panel">
              <div className="panel-title">
                <span className="panel-title-icon"></span> Account Security
              </div>
              <div className="security-item">
                <div className="security-item-left">
                  <h4>Change Password</h4>
                  <p>Last changed 4 months ago</p>
                </div>
                <button className="chevron-btn">›</button>
              </div>
              <div className="security-item">
                <div className="security-item-left">
                  <h4>Two-Factor Authentication</h4>
                  <p>Active (SMS)</p>
                </div>
                <span className="manage-link">Manage</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-panel">
              <div className="panel-title">
                <span className="panel-title-icon"></span> Notifications
              </div>
              <div className="notif-item">
                <div>
                  <h4>Archive Updates</h4>
                  <p>New artifacts and stories matching your interests.</p>
                </div>
                <button className={`toggle-switch ${notifArchive?'on':'off'}`}
                  onClick={() => setNotifArchive(v => !v)} />
              </div>
              <div className="notif-item">
                <div>
                  <h4>Newsletter</h4>
                  <p>Monthly digest of Rwanda's cultural highlights.</p>
                </div>
                <button className={`toggle-switch ${notifNews?'on':'off'}`}
                  onClick={() => setNotifNews(v => !v)} />
              </div>
            </div>

            {/* Accessibility Options */}
            <div className="settings-panel">
              <div className="panel-title">
                <span className="panel-title-icon"></span> Accessibility Options
              </div>
              <div className="accessibility-grid">
                <div>
                  <div className="access-section-label">Tega Amatwi (TTS) Voice Selection</div>
                  {voices.map((v, i) => (
                    <div key={i} className={`voice-option ${selectedVoice===i?'selected':''}`}
                      onClick={() => setSelectedVoice(i)}>
                      <div className="voice-option-avatar">
                        <img src={v.img} alt={v.name}
                          onError={e => { e.target.style.display='none'; }} />
                      </div>
                      <div className="voice-option-info">
                        <h4>{v.name}</h4>
                        <p>{v.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="access-section-label">Content Font Sizing</div>
                  <div className="font-size-slider">
                    <span style={{ fontSize:11 }}>A</span>
                    <input type="range" min={0} max={100} value={fontSize}
                      onChange={e => setFontSize(e.target.value)} />
                    <span style={{ fontSize:15 }}>A</span>
                  </div>
                  <div className="font-preview">Preview: "Inzuzi cattle were revered"</div>
                  <div className="high-contrast-wrap">
                    <input type="checkbox" className="hc-checkbox" id="hc"
                      checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
                    <label className="hc-label" htmlFor="hc">High Contrast Optimized</label>
                  </div>
                  <button className="save-access-btn">Save Accessibility Profile</button>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="danger-panel">
              <div className="danger-header">Account Management</div>
              <p className="danger-text">
                Deleting your account will permanently remove your saved collections and history. This action cannot be undone.
              </p>
              <button className="btn-delete">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
