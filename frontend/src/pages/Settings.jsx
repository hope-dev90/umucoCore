import React, { useState } from 'react';
import { Bell, CheckCircle2, Download, Eye, Globe2, KeyRound, Lock, Mic2, Shield, SlidersHorizontal, Trash2, UserX, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';
import voicePhotoOne from '../assets/login/tra.png';
import voicePhotoTwo from '../assets/login/tra2.png';
import voicePhotoThree from '../assets/login/tra3.jpg';

const voices = [
  { id: 0, name: 'Umutoni', img: voicePhotoOne, key: 'settings.voice.femaleSoft' },
  { id: 1, name: 'Kamanzi', img: voicePhotoTwo, key: 'settings.voice.maleDeep' },
  { id: 2, name: 'Ineza', img: voicePhotoThree, key: 'settings.voice.clearYouth' },
];

function PanelTitle({ icon: Icon, label }) {
  return (
    <div className="panel-title">
      <span className="panel-title-svg"><Icon size={15} aria-hidden="true" /></span>
      {label}
    </div>
  );
}

function ToastCard({ message, type = 'success' }) {
  const isError = type === 'error';
  const Icon = isError ? XCircle : CheckCircle2;
  return (
    <div className={`settings-toast ${isError ? 'error' : 'success'}`}>
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { language: langCtx, setLanguage: setLangCtx, t } = useLanguage();
  const navigate = useNavigate();

  const [notifArchive, setNotifArchive] = useState(user?.notifications?.archiveUpdates ?? true);
  const [notifNews, setNotifNews] = useState(user?.notifications?.newsletter ?? false);
  const [notifEvents, setNotifEvents] = useState(user?.notifications?.eventReminders ?? true);
  const [selectedVoice, setSelectedVoice] = useState(user?.accessibility?.voice ?? 0);
  const [fontSize, setFontSize] = useState(user?.accessibility?.fontSize ?? 50);
  const [highContrast, setHighContrast] = useState(user?.accessibility?.highContrast ?? false);
  const [reducedMotion, setReducedMotion] = useState(user?.accessibility?.reduceMotion ?? false);
  const [dateFormat, setDateFormat] = useState(user?.accessibility?.dateFormat ?? 'DD / MM / YYYY');
  const [timezone, setTimezone] = useState(user?.accessibility?.timezone ?? 'CAT');
  const [cookieAnalytics, setCookieAnalytics] = useState(localStorage.getItem('cookie_analytics') !== 'false');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [savingKey, setSavingKey] = useState('');
  const [modal, setModal] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const authedFetch = (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const saveNotifications = async () => {
    setSavingKey('notifications');
    try {
      const notifications = { archiveUpdates: notifArchive, newsletter: notifNews, eventReminders: notifEvents };
      const response = await authedFetch('http://localhost:5000/api/users/notifications', {
        method: 'PUT',
        body: JSON.stringify(notifications),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      updateUser({ notifications });
      showMessage('Notification preferences saved');
    } catch (err) {
      showMessage(err.message || 'Failed to save preferences', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const saveAccessibility = async () => {
    setSavingKey('accessibility');
    try {
      const accessibility = { fontSize: Number(fontSize), highContrast, reduceMotion: reducedMotion, voice: selectedVoice, dateFormat, timezone };
      const response = await authedFetch('http://localhost:5000/api/users/accessibility', {
        method: 'PUT',
        body: JSON.stringify(accessibility),
      });
      if (!response.ok) throw new Error('Failed to save accessibility settings');
      updateUser({ accessibility });
      showMessage('Accessibility settings saved');
    } catch (err) {
      showMessage(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const saveDisplay = async () => {
    setSavingKey('display');
    try {
      const profileResponse = await authedFetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ language: langCtx }),
      });
      if (!profileResponse.ok) throw new Error('Failed to save display settings');

      const accessibility = { fontSize: Number(fontSize), highContrast, reduceMotion: reducedMotion, voice: selectedVoice, dateFormat, timezone };
      const accessibilityResponse = await authedFetch('http://localhost:5000/api/users/accessibility', {
        method: 'PUT',
        body: JSON.stringify(accessibility),
      });
      if (!accessibilityResponse.ok) throw new Error('Failed to save display settings');

      updateUser({ language: langCtx, accessibility });
      showMessage('Display settings saved');
    } catch (err) {
      showMessage(err.message || 'Failed to save display settings', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const resetModalState = () => {
    setModal(null);
    setPasswordForm({ currentPassword: '', newPassword: '' });
    setDeletePassword('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingKey('password');
    try {
      const response = await authedFetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to update password');
      resetModalState();
      showMessage('Password updated successfully');
    } catch (err) {
      showMessage(err.message || 'Failed to update password', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const handleActiveSessions = async () => {
    setSavingKey('sessions');
    try {
      const response = await authedFetch('http://localhost:5000/api/users/sessions');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');
      showMessage(`${data.sessions?.length || 0} active server sessions found`);
    } catch (err) {
      showMessage(err.message || 'Failed to fetch sessions', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const handleDataDownload = async () => {
    setSavingKey('export');
    try {
      const response = await authedFetch('http://localhost:5000/api/users/export-data');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Export failed');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'umuco-core-data.json';
      link.click();
      URL.revokeObjectURL(url);
      showMessage('Data export downloaded');
    } catch (err) {
      showMessage(err.message || 'Export failed', 'error');
    } finally {
      setSavingKey('');
    }
  };

  const handleCookiePrefs = () => {
    const next = !cookieAnalytics;
    setCookieAnalytics(next);
    localStorage.setItem('cookie_analytics', String(next));
    showMessage(next ? 'Analytics cookies enabled' : 'Analytics cookies disabled');
  };

  const submitDeactivate = async () => {
    setSavingKey('deactivate');
    try {
      const response = await authedFetch('http://localhost:5000/api/users/deactivate', { method: 'POST' });
      if (!response.ok) throw new Error('Deactivation failed');
      logout();
      navigate('/login');
    } catch (err) {
      showMessage(err.message || 'Deactivation failed', 'error');
      setSavingKey('');
    }
  };

  const submitDelete = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showMessage('Password is required to delete account', 'error');
      return;
    }
    setSavingKey('delete');
    try {
      const response = await authedFetch('http://localhost:5000/api/users/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Account deletion failed');
      logout();
      navigate('/signup');
    } catch (err) {
      showMessage(err.message || 'Account deletion failed', 'error');
      setSavingKey('');
    }
  };

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'rw', label: t('settings.kinyarwanda') },
    { value: 'fr', label: t('settings.french') },
  ];

  return (
    <Layout searchPlaceholder="search.placeholder">
      <div className="settings-page settings-page--polished">
        <div className="settings-header settings-header--card">
          <div>
            <span className="settings-kicker">{t('sidebar.settings')}</span>
            <h1>{t('settings.title')}</h1>
            <p>{t('settings.subtitle')}</p>
          </div>
          <SlidersHorizontal size={28} aria-hidden="true" />
        </div>

        <div className="settings-only-grid">
          <div className="settings-col">
            <div className="settings-panel">
              <PanelTitle icon={Bell} label={t('settings.notifications')} />
              {[
                { label: t('settings.archiveUpdates'), sub: t('settings.archiveUpdates.desc'), val: notifArchive, set: setNotifArchive },
                { label: t('settings.newsletter'), sub: t('settings.newsletter.desc'), val: notifNews, set: setNotifNews },
                { label: t('settings.dayReminders'), sub: t('settings.dayReminders.desc'), val: notifEvents, set: setNotifEvents },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="notif-item">
                  <div><h4>{label}</h4><p>{sub}</p></div>
                  <button type="button" aria-pressed={val} aria-label={label} className={`toggle-switch ${val ? 'on' : 'off'}`} onClick={() => set((v) => !v)} />
                </div>
              ))}
              <button className="btn-save-notifs" onClick={saveNotifications} disabled={savingKey === 'notifications'}>{savingKey === 'notifications' ? 'Saving...' : 'Save Preferences'}</button>
            </div>

            <div className="settings-panel">
              <PanelTitle icon={Globe2} label="Language & Display" />
              <div className="form-group">
                <label className="form-label">{t('settings.language')}</label>
                <select className="form-select" value={langCtx} onChange={(e) => setLangCtx(e.target.value)}>
                  {languageOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.dateFormat')}</label>
                <select className="form-select" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                  <option value="DD / MM / YYYY">DD / MM / YYYY</option>
                  <option value="MM / DD / YYYY">MM / DD / YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.timezone')}</label>
                <select className="form-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="CAT">{t('settings.timezone.cat')}</option>
                  <option value="UTC">{t('settings.timezone.utc')}</option>
                  <option value="Europe/London">{t('settings.timezone.london')}</option>
                </select>
              </div>
              <button className="btn-save-notifs" onClick={saveDisplay} disabled={savingKey === 'display'}>{savingKey === 'display' ? 'Saving...' : 'Save Display'}</button>
            </div>
          </div>

          <div className="settings-col">
            <div className="settings-panel">
              <PanelTitle icon={Eye} label={t('settings.accessibility')} />
              <div className="access-section-label">{t('settings.fontSize')}</div>
              <div className="font-size-slider">
                <span>A</span>
                <input type="range" min={0} max={100} value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                <span className="large-a">A</span>
              </div>
              <div className="font-preview" style={{ fontSize: `${11 + (fontSize / 100) * 6}px` }}>{t('settings.fontPreview')}</div>
              {[
                { label: t('settings.highContrast'), sub: t('settings.highContrast.desc'), val: highContrast, set: setHighContrast },
                { label: t('settings.reducedMotion'), sub: t('settings.reducedMotion.desc'), val: reducedMotion, set: setReducedMotion },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="access-toggle-row">
                  <div><div className="access-toggle-title">{label}</div><div className="access-toggle-sub">{sub}</div></div>
                  <button type="button" aria-pressed={val} aria-label={label} className={`toggle-switch ${val ? 'on' : 'off'}`} onClick={() => set((v) => !v)} />
                </div>
              ))}
              <button className="save-access-btn" onClick={saveAccessibility} disabled={savingKey === 'accessibility'}>{savingKey === 'accessibility' ? 'Saving...' : t('settings.saveAccessibility')}</button>
            </div>

            <div className="settings-panel">
              <PanelTitle icon={Mic2} label={t('settings.voiceSelection')} />
              <p className="panel-sub">{t('settings.voiceSelection.desc')}</p>
              {voices.map((voice) => (
                <button type="button" key={voice.name} className={`voice-option ${Number(selectedVoice) === voice.id ? 'selected' : ''}`} onClick={() => setSelectedVoice(voice.id)}>
                  <div className="voice-option-avatar"><img src={voice.img} alt={voice.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
                  <div className="voice-option-info"><h4>{voice.name}</h4><p>{t(voice.key)}</p></div>
                  {Number(selectedVoice) === voice.id ? <span className="voice-active-badge">Active</span> : null}
                </button>
              ))}
              <button className="save-access-btn" onClick={saveAccessibility} disabled={savingKey === 'accessibility'}>{savingKey === 'accessibility' ? 'Saving...' : 'Save Voice'}</button>
            </div>
          </div>

          <div className="settings-col">
            <div className="settings-panel">
              <PanelTitle icon={Lock} label={t('settings.accountSecurity')} />
              <button className="security-item-clickable" onClick={() => setModal('password')} disabled={savingKey === 'password'}>
                <div className="security-item-left"><h4>{t('settings.changePassword')}</h4><p>{t('settings.changePassword.desc')}</p></div>
                <KeyRound size={17} />
              </button>
              <button className="security-item-clickable" onClick={handleActiveSessions} disabled={savingKey === 'sessions'}>
                <div className="security-item-left"><h4>{t('settings.activeSessions')}</h4><p>{t('settings.activeSessions.desc')}</p></div>
                <span className="manage-link">{t('settings.view')}</span>
              </button>
            </div>

            <div className="settings-panel">
              <PanelTitle icon={Shield} label={t('settings.privacy')} />
              <button className="security-item-clickable" onClick={handleDataDownload} disabled={savingKey === 'export'}>
                <div className="security-item-left"><h4>{t('settings.dataDownload')}</h4><p>{t('settings.dataDownload.desc')}</p></div>
                <Download size={17} />
              </button>
              <button className="security-item-clickable" onClick={handleCookiePrefs}>
                <div className="security-item-left"><h4>{t('settings.cookiePrefs')}</h4><p>{cookieAnalytics ? 'Analytics cookies are enabled.' : 'Analytics cookies are disabled.'}</p></div>
                <span className="manage-link">{t('settings.manage')}</span>
              </button>
            </div>

            <div className="danger-panel">
              <div className="danger-header"><UserX size={15} /> {t('settings.dangerZone')}</div>
              <p className="danger-text">{t('settings.dangerZone.desc')}</p>
              <div className="danger-actions">
                <button className="btn-deactivate" onClick={() => setModal('deactivate')} disabled={savingKey === 'deactivate'}><UserX size={15} />{t('settings.deactivate')}</button>
                <button className="btn-delete" onClick={() => setModal('delete')} disabled={savingKey === 'delete'}><Trash2 size={15} />{t('settings.delete')}</button>
              </div>
            </div>
          </div>
        </div>
        {modal === 'password' ? (
          <div className="settings-modal-backdrop" role="presentation" onClick={resetModalState}>
            <form className="settings-modal" onSubmit={submitPasswordChange} onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-icon"><KeyRound size={20} /></div>
              <h2>{t('settings.changePassword')}</h2>
              <p>{t('settings.changePassword.desc')}</p>
              <label className="form-label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                className="form-input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                autoFocus
              />
              <label className="form-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="form-input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
              <div className="settings-modal-actions">
                <button type="button" className="btn-deactivate" onClick={resetModalState}>Cancel</button>
                <button type="submit" className="btn-save-notifs" disabled={savingKey === 'password'}>
                  {savingKey === 'password' ? 'Saving...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {modal === 'deactivate' ? (
          <div className="settings-modal-backdrop" role="presentation" onClick={resetModalState}>
            <div className="settings-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-icon danger"><UserX size={20} /></div>
              <h2>{t('settings.deactivate')}</h2>
              <p>Your account will be marked inactive and you will be signed out.</p>
              <div className="settings-modal-actions">
                <button type="button" className="btn-deactivate" onClick={resetModalState}>Cancel</button>
                <button type="button" className="btn-delete" onClick={submitDeactivate} disabled={savingKey === 'deactivate'}>
                  {savingKey === 'deactivate' ? 'Working...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {modal === 'delete' ? (
          <div className="settings-modal-backdrop" role="presentation" onClick={resetModalState}>
            <form className="settings-modal" onSubmit={submitDelete} onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal-icon danger"><Trash2 size={20} /></div>
              <h2>{t('settings.delete')}</h2>
              <p>This permanently removes your account. Enter your password to continue.</p>
              <label className="form-label" htmlFor="delete-password">Password</label>
              <input
                id="delete-password"
                className="form-input"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoFocus
              />
              <div className="settings-modal-actions">
                <button type="button" className="btn-deactivate" onClick={resetModalState}>Cancel</button>
                <button type="submit" className="btn-delete" disabled={savingKey === 'delete'}>
                  {savingKey === 'delete' ? 'Deleting...' : 'Delete account'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {message ? <ToastCard message={message} type={messageType} /> : null}
      </div>
    </Layout>
  );
}
