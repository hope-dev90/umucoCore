import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Settings.css';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');

  return (
    <Layout searchPlaceholder="search.placeholder">
      <div className="settings-page">
        <div className="settings-header">
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="settings-grid">
          <div>
            <div className="profile-card">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  <div className="profile-avatar-placeholder">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                </div>
                <div className="profile-name">{user?.name || 'Guest'}</div>
                <div className="profile-role">{t('profile.role')}</div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('profile.fullName')}</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.email')}</label>
                <input
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <button
                className="btn-update"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? t('profile.save') : t('profile.edit')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
