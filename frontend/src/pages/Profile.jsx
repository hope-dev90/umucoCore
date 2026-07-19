import React, { useEffect, useRef, useState } from 'react';
import { Award, CalendarDays, CheckCircle2, Flame, Gem, Music, Shield, Sparkles, Star, Trophy, UserRound } from 'lucide-react';
import Layout from '../components/Layout';
import ExplorerTypeImage from '../components/ExplorerTypeImage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamification } from '../hooks/useGamification';
import { XPBar } from '../components/Gamification/XPBar';
import { BadgeCard } from '../components/Gamification/BadgeCard';
import { CollectibleCard } from '../components/Gamification/CollectibleCard';
import { getRewardFeed, subscribeRewardFeed } from '../utils/rewardFeed';
import './Settings.css';
import './Profile.css';

const EXPLORER_PROFILES = {
  warrior: { Icon: Shield, label: 'Warrior Explorer', accent: '#8D493A', accentDark: '#3E2723', accentTint: 'rgba(141, 73, 58, 0.10)' },
  'nature-lover': { Icon: Sparkles, label: 'Nature Lover', accent: '#4C7A50', accentDark: '#2F4E32', accentTint: 'rgba(76, 122, 80, 0.10)' },
  'royal-historian': { Icon: Trophy, label: 'Royal Historian', accent: '#A9821F', accentDark: '#6B5313', accentTint: 'rgba(169, 130, 31, 0.10)' },
  'folktale-hunter': { Icon: Star, label: 'Folktale Hunter', accent: '#6B4A8D', accentDark: '#412C56', accentTint: 'rgba(107, 74, 141, 0.10)' },
  'music-explorer': { Icon: Music, label: 'Music Explorer', accent: '#8D493A', accentDark: '#3E2723', accentTint: 'rgba(141, 73, 58, 0.10)' },
};

const DEFAULT_PROFILE = {
  Icon: UserRound,
  label: 'Explorer',
  accent: '#8D493A',
  accentDark: '#3E2723',
  accentTint: 'rgba(141, 73, 58, 0.10)',
};

const RECENT_MARKS_META = {
  xp: Sparkles,
  levelUp: Trophy,
  badge: Award,
  collectible: Gem,
  streak: Flame,
};

function getRecentMarkCopy(item) {
  switch (item.type) {
    case 'xp':
      return { title: `+${item.payload?.amount || 0} XP`, subtitle: 'New marks added to your progress.' };
    case 'levelUp':
      return { title: `Level ${item.payload?.level || 1} reached`, subtitle: 'You moved up to a new rank.' };
    case 'badge':
      return { title: item.payload?.badge?.name || 'New badge unlocked', subtitle: 'This mark now shows on your profile.' };
    case 'collectible':
      return { title: item.payload?.collectible?.name || 'New collectible found', subtitle: 'A new reward was added to your collection.' };
    case 'streak':
      return { title: `${item.payload?.streak || 0}-day streak`, subtitle: 'You kept your streak alive.' };
    default:
      return { title: 'New achievement', subtitle: 'A fresh mark was added to your profile.' };
  }
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { badges, userBadges, collectibles, userCollectibles, loading, getNextLevelData } = useGamification();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [explorerType, setExplorerType] = useState(user?.explorerType || user?.explorer_type || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recentMarks, setRecentMarks] = useState(() => getRewardFeed().slice(0, 3));
  const fileInputRef = useRef(null);

  useEffect(() => subscribeRewardFeed((items) => setRecentMarks(items.slice(0, 3))), []);

  useEffect(() => {
    setName(user?.name || '');
    setExplorerType(user?.explorerType || user?.explorer_type || '');
    setProfileImage(user?.profileImage || user?.avatar || null);
  }, [user]);

  const explorerLabel = (key) => t(`profile.explorer.${key}`) || EXPLORER_PROFILES[key]?.label || DEFAULT_PROFILE.label;
  const currentExplorerType = user?.explorerType || user?.explorer_type || explorerType;
  const explorer = EXPLORER_PROFILES[currentExplorerType] || DEFAULT_PROFILE;
  const ExplorerIcon = explorer.Icon || DEFAULT_PROFILE.Icon;
  const nextLevel = getNextLevelData();
  const currentXP = user?.xp || 0;
  const requiredXP = nextLevel?.requiredXP || 0;
  const unlockedBadgeCount = userBadges.filter((b) => b.unlockedAt).length;
  const obtainedCollectibleCount = userCollectibles.filter((c) => c.obtainedAt).length;
  const accentVars = {
    '--accent': explorer.accent,
    '--accent-dark': explorer.accentDark,
    '--accent-tint': explorer.accentTint,
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload avatar');
      const data = await response.json();
      const fullAvatarUrl = data.avatar && !data.avatar.startsWith('http') ? `http://localhost:5000${data.avatar}` : data.avatar;
      setProfileImage(fullAvatarUrl);
      updateUser({ profileImage: fullAvatarUrl, avatar: fullAvatarUrl });
    } catch (err) {
      setSaveError(err.message || 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error('Name is required');
      if (!explorerType) throw new Error('Please choose an explorer type');

      const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ fullName: trimmedName }),
        signal: controller.signal,
      });
      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save profile');
      }

      const explorerResponse = await fetch('http://localhost:5000/api/users/explorer-type', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ explorerType }),
        signal: controller.signal,
      });
      if (!explorerResponse.ok) {
        const data = await explorerResponse.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save explorer type');
      }

      updateUser({ name: trimmedName, explorerType, explorer_type: explorerType });
      setEditMode(false);
    } catch (err) {
      setSaveError(err.name === 'AbortError' ? 'Saving took too long. Please check the backend and try again.' : err.message || 'Failed to save changes');
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  return (
    <Layout searchPlaceholder="search.placeholder">
      <div className="settings-page profile-page">
        <div className="settings-header">
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="pf-grid">
          <div>
            <div className="pf-id-card" style={accentVars}>
              <div className="pf-id-card__band" />
              <div className="pf-id-card__body">
                <button type="button" className="pf-avatar" onClick={() => fileInputRef.current?.click()} aria-label={t('profile.tapToChangePhoto')}>
                  {profileImage ? <img src={profileImage} alt="Profile" /> : <div className="pf-avatar-placeholder">{user?.name ? user.name.charAt(0).toUpperCase() : <UserRound size={34} />}</div>}
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                <div className="pf-avatar-hint">{t('profile.tapToChangePhoto')}</div>
                <div className="pf-name">{user?.name || 'Guest'}</div>
                <div className="pf-role">
                  <ExplorerIcon size={15} aria-hidden="true" />
                  {currentExplorerType ? explorerLabel(currentExplorerType) : t('gamification.explorer')}
                </div>
                <div className="pf-xp-wrap">
                  <XPBar currentXP={currentXP} requiredXP={requiredXP} level={user?.level || 1} />
                </div>
                <div className="pf-stats">
                  <div className="pf-stat"><div className="pf-stat__icon"><Flame size={18} /></div><div className="pf-stat__value">{user?.currentStreak || 0}</div><div className="pf-stat__label">{t('profile.streak')}</div></div>
                  <div className="pf-stat"><div className="pf-stat__icon"><Star size={18} /></div><div className="pf-stat__value">{user?.bestStreak || 0}</div><div className="pf-stat__label">{t('profile.best')}</div></div>
                  <div className="pf-stat"><div className="pf-stat__icon"><CalendarDays size={18} /></div><div className="pf-stat__value">{user?.totalDays || 0}</div><div className="pf-stat__label">{t('profile.days')}</div></div>
                </div>
              </div>
            </div>

            <div className="pf-details-card">
              <div className="pf-details-title">{t('profile.accountDetails')}</div>
              <div className="form-group">
                <label className="form-label">{t('profile.fullName')}</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.explorerType')}</label>
                {editMode ? (
                  <div className="pf-explorer-picker" role="radiogroup" aria-label={t('profile.explorerType')}>
                    {Object.entries(EXPLORER_PROFILES).map(([key, profile]) => {
                      const OptionIcon = profile.Icon;
                      const selected = explorerType === key;
                      return (
                        <button key={key} type="button" className={`pf-explorer-option ${selected ? 'selected' : ''}`} onClick={() => setExplorerType(key)} role="radio" aria-checked={selected}>
                          <ExplorerTypeImage type={key} label={explorerLabel(key)} selected={selected} size={42} />
                          <span className="pf-explorer-option__text"><span>{explorerLabel(key)}</span><small>{profile.label}</small></span>
                          {selected ? <CheckCircle2 size={18} aria-hidden="true" /> : <OptionIcon size={18} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input className="form-input" value={currentExplorerType ? explorerLabel(currentExplorerType) : t('gamification.explorer')} disabled />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.email')}</label>
                <input className="form-input" value={user?.email || ''} disabled />
              </div>
              {saveError ? <div className="pf-error">{saveError}</div> : null}
              <div className="pf-button-row">
                {editMode ? <button className="btn-update btn-muted" type="button" disabled={saving} onClick={() => { setEditMode(false); setName(user?.name || ''); setExplorerType(currentExplorerType || ''); }}>Cancel</button> : null}
                <button className="btn-update" type="button" disabled={saving} onClick={editMode ? handleSave : () => setEditMode(true)}>
                  {saving ? 'Saving...' : editMode ? t('profile.save') : t('profile.edit')}
                </button>
              </div>
            </div>
          </div>

          <div className="pf-right-col">
            <div className="pf-section">
              <div className="pf-section__header"><span className="pf-section__title">Recent Marks</span><span className="pf-section__count">{recentMarks.length}</span></div>
              {recentMarks.length === 0 ? <div className="pf-empty">Your latest rewards will show here.</div> : (
                <div className="pf-marks-list">
                  {recentMarks.map((item) => {
                    const copy = getRecentMarkCopy(item);
                    const MarkIcon = RECENT_MARKS_META[item.type] || Star;
                    return (
                      <div key={item.id} className="pf-mark-item">
                        <div className="pf-mark-item__icon"><MarkIcon size={18} aria-hidden="true" /></div>
                        <div className="pf-mark-item__body"><div className="pf-mark-item__title">{copy.title}</div><div className="pf-mark-item__subtitle">{copy.subtitle}</div></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pf-section">
              <div className="pf-section__header"><span className="pf-section__title">{t('profile.badges')}</span><span className="pf-section__count">{unlockedBadgeCount}/{badges.length}</span></div>
              {loading ? <div className="pf-empty">{t('profile.loadingBadges')}</div> : badges.length === 0 ? <div className="pf-empty">{t('profile.noBadges')}</div> : (
                <div className="pf-section__grid">
                  {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} unlocked={!!userBadges.find((ub) => ub.id === badge.id && ub.unlockedAt)} unlockedAt={userBadges.find((ub) => ub.id === badge.id)?.unlockedAt} />)}
                </div>
              )}
            </div>

            <div className="pf-section">
              <div className="pf-section__header"><span className="pf-section__title">{t('profile.collectibles')}</span><span className="pf-section__count">{obtainedCollectibleCount}/{collectibles.length}</span></div>
              {loading ? <div className="pf-empty">{t('profile.loadingCollectibles')}</div> : collectibles.length === 0 ? <div className="pf-empty">{t('profile.noCollectibles')}</div> : (
                <div className="pf-section__grid">
                  {collectibles.map((collectible) => <CollectibleCard key={collectible.id} collectible={collectible} collected={!!userCollectibles.find((uc) => uc.id === collectible.id && uc.obtainedAt)} obtainedAt={userCollectibles.find((uc) => uc.id === collectible.id)?.obtainedAt} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
