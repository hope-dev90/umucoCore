import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Layout.css';
import UmucoLogo from './UmucoLogo';

const Icon = ({ d, size = 16, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
    home:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    explore:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
    listen:    "M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6z M18 19a3 3 0 100-6 3 3 0 000 6z",
    videos:    "M23 7c0-1.1045695-.8954305-2-2-2H3c-1.1045695 0-2 .8954305-2 2v10c0 1.1045695.8954305 2 2 2h18c1.1045695 0 2-.8954305 2-2V7z M10 9l8 3-8 3V9z",
    collections:"M3 7h7v7H3z M14 7h7v7h-7z M3 17h7v4H3z M14 17h7v4h-7z",
    kwibuka:   "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  intldays:  "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  contribute:"M12 5v14 M5 12h14",
  saved:     "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  history:   "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2",
  profile:   "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  search:    "M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  moon:      "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  signout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  translate: "M5 8l6 6 M4 14s-2-2 0-4 M4 4l16 0 M4 4l4 8 M20 4l-4 8",
};

export default function Layout({ children, searchPlaceholder = 'search.placeholder' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const mainNav = [
    { label: t('sidebar.home'),          path: '/dashboard', icon: 'home' },
    { label: t('sidebar.explore'),       path: '/explore',   icon: 'explore' },
    { label: t('sidebar.listen'),        path: '/listen',    icon: 'listen' },
    { label: t('sidebar.videos'),        path: '/videos',    icon: 'videos' },
    { label: t('sidebar.collections'),   path: '/collections', icon: 'collections' },
    { label: t('sidebar.kwibuka'),       path: '/kwibuka', icon: 'kwibuka' },
    { label: t('sidebar.intldays'),      path: '/intl-days', icon: 'intldays' },
  ];

  const personalNav = [
    { label: t('sidebar.contribute'), path: '/contribute', icon: 'contribute' },
    { label: t('sidebar.saved'),      path: '/saved',      icon: 'saved' },
    { label: t('sidebar.history'),    path: '/history',    icon: 'history' },
  ];

  const accountNav = [
    { label: t('sidebar.profile'),  path: '/profile',  icon: 'profile' },
    { label: t('sidebar.settings'), path: '/settings', icon: 'settings' },
  ];

  // No longer treats '/' as special — just exact/startsWith matching
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ item }) => (
    <div
      className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
      onClick={() => navigate(item.path)}
    >
      <span className="sidebar-link-icon"><Icon d={Icons[item.icon]} size={15} /></span>
      {item.label}
    </div>
  );

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <UmucoLogo style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div className="sidebar-logo-text">
            <span>{t('sidebar.appName')}</span>
            <span>{t('sidebar.tagline')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {mainNav.map(item => <NavLink key={item.path} item={item} />)}
          <div className="sidebar-section-label">{t('sidebar.personal')}</div>
          {personalNav.map(item => <NavLink key={item.path} item={item} />)}
          <div className="sidebar-section-label">{t('sidebar.account')}</div>
          {accountNav.map(item => <NavLink key={item.path} item={item} />)}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-signout" onClick={handleSignOut}>
            <Icon d={Icons.signout} size={14} /> {t('sidebar.signout')}
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-search">
          <span className="topbar-search-icon"><Icon d={Icons.search} size={14} /></span>
          <input type="text" placeholder={t(searchPlaceholder)} />
        </div>
        <div className="topbar-right">
          <div className="topbar-lang">
            <span
              className={language === 'rw' ? 'active' : ''}
              onClick={() => setLanguage('rw')}
              style={{ cursor: 'pointer' }}
            >
              Kinyarwanda
            </span>
            <span
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
              style={{ cursor: 'pointer' }}
            >
              English
            </span>
          </div>
          <div className="topbar-icon-btn"><Icon d={Icons.bell} size={14} /></div>
          <div className="topbar-icon-btn"><Icon d={Icons.translate} size={14} /></div>
          <div className="topbar-avatar">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'MJ'
            )}
          </div>
        </div>  
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
}