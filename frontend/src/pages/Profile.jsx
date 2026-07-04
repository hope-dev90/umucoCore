import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Settings.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = reader.result;
        setProfileImage(img);
        updateUser({ profileImage: img });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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
                <div 
                  className="profile-avatar" 
                  onClick={handleAvatarClick}
                  style={{ cursor: 'pointer' }}
                >
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
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
