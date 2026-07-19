import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { XPBar } from './Gamification/XPBar';
import { DailyStreakWidget } from './Gamification/DailyStreakWidget';
import { LeaderboardWidget } from './Gamification/LeaderboardWidget';
import './Layout.css';
import UmucoLogo from './UmucoLogo';

const Icon = ({ d, size = 16, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const KwibukaNavIcon = () => (
  <svg className="kwibuka-nav-flame" viewBox="0 0 120 160" aria-hidden="true">
    <path
      d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z"
      fill="currentColor"
    />
    <path
      d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z"
      fill="currentColor"
    />
    <path
      d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z"
      fill="currentColor"
    />
    <path
      className="kwibuka-nav-flame-cutout"
      d="M58 97c-12-10-11-24 4-42-3 24 5 32 18 39-19 6-30 22-28 47-14-15-13-31 6-44Z"
    />
    <path
      d="M58 97c-12-10-11-24 4-42"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="5"
    />
  </svg>
);

const Icons = {
    home:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    explore:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z",
    listen:    "M9 18V5l12-2v13 M6 21a3 3 0 100-6 3 3 0 000 6z M18 19a3 3 0 100-6 3 3 0 000 6z",
    collections:"M3 7h7v7H3z M14 7h7v7h-7z M3 17h7v4H3z M14 17h7v4h-7z",
  intldays:  "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  contribute:"M12 5v14 M5 12h14",
  saved:     "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  history:   "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2",
  profile:   "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06.06a2 2 0 012.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  search:    "M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  moon:      "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  signout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  translate: "M5 8l6 6 M4 14s-2-2 0-4 M4 4l16 0 M4 4l4 8 M20 4l-4 8",
  menu:      "M3 12h18 M3 6h18 M3 18h18",
};

export default function Layout({ children, searchPlaceholder = 'search.placeholder', searchQuery = '', onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { xp, requiredXP, level, streak, bestStreak, leaderboard } = useGamificationContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Group 1: Discover (unlabeled)
  const discoverNav = [
    { label: t('sidebar.home'),          path: '/dashboard', icon: 'home' },
    { label: t('sidebar.explore'),       path: '/explore',   icon: 'explore' },
    { label: t('sidebar.listen'),        path: '/listen',    icon: 'listen' },
    { label: t('sidebar.collections'),   path: '/collections', icon: 'collections' },
    { label: t('sidebar.kwibuka'),       path: '/kwibuka', icon: 'kwibuka' },
    { label: t('sidebar.intldays'),      path: '/intl-days', icon: 'intldays' },
  ];

  // Group 3: Contribute
  const contributeNav = [
    { label: t('sidebar.contribute'), path: '/contribute', icon: 'contribute' },
  ];

  // Group 4: Personal
  const personalNav = [
    { label: t('sidebar.saved'),      path: '/saved',      icon: 'saved' },
    { label: t('sidebar.history'),    path: '/history',    icon: 'history' },
  ];

  // No longer treats '/' as special — just exact/startsWith matching
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const goTo = (path) => {
    navigate(path);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  };

  const NavLink = ({ item }) => (
    <div
      className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
      onClick={() => goTo(item.path)}
    >
      <span className="sidebar-link-icon">
        {item.icon === 'kwibuka' ? <KwibukaNavIcon /> : <Icon d={Icons[item.icon]} size={15} />}
      </span>
      {item.label}
    </div>
  );

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      {/* Mobile nav drawer backdrop */}
      {mobileNavOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`} aria-hidden={!mobileNavOpen}>
        <div className="sidebar-logo">
          <UmucoLogo style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div className="sidebar-logo-text">
            <span>{t('sidebar.appName')}</span>
            <span>{t('sidebar.tagline')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">EXPLORE</div>
          {discoverNav.map(item => <NavLink key={item.path} item={item} />)}

          {/* Group 3: Contribute */}
          <div className="sidebar-divider" />
          <div className="sidebar-section-label">CONTRIBUTE</div>
          {contributeNav.map(item => <NavLink key={item.path} item={item} />)}

          {/* Group 4: Personal */}
          <div className="sidebar-divider" />
          <div className="sidebar-section-label">PERSONAL</div>
          {personalNav.map(item => <NavLink key={item.path} item={item} />)}

        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-signout" onClick={handleSignOut}>
            <Icon d={Icons.signout} size={14} /> {t('sidebar.signout')}
          </div>
        </div>
      </aside>

      <header className="topbar">
        <button
          type="button"
          className="topbar-hamburger"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-label="Open navigation"
        >
          <Icon d={Icons.menu} size={18} />
        </button>
        <div className="topbar-search">
          <span className="topbar-search-icon"><Icon d={Icons.search} size={14} /></span>
          <input type="text" placeholder={t(searchPlaceholder)} value={searchQuery} onChange={e => onSearchChange && onSearchChange(e.target.value)} />
        </div>
        <div className="topbar-right">
          <div className="topbar-lang">
            <span
              className={`topbar-lang-pill ${language === 'rw' ? 'active' : ''}`}
              onClick={() => setLanguage('rw')}
            >
              RW
            </span>
            <span
              className={`topbar-lang-pill ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </span>
            <span
              className={`topbar-lang-pill ${language === 'fr' ? 'active' : ''}`}
              onClick={() => setLanguage('fr')}
            >
              FR
            </span>
          </div>
          <button type="button" className="topbar-icon-btn" aria-label="Notifications">
            <Icon d={Icons.bell} size={14} />
          </button>
          <div className="topbar-account">
            <button
              type="button"
              className="topbar-avatar"
              onClick={() => setAccountMenuOpen(open => !open)}
              aria-expanded={accountMenuOpen}
              aria-label="Open account menu"
            >
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </button>
            {accountMenuOpen && (
              <div className="topbar-account-menu">
                <button type="button" onClick={() => goTo('/profile')}>
                  <Icon d={Icons.profile} size={14} />
                  {t('sidebar.profile')}
                </button>
                <button type="button" onClick={() => goTo('/settings')}>
                  <Icon d={Icons.settings} size={14} />
                  {t('sidebar.settings')}
                </button>
              </div>
            )}
          </div>
        </div>  
      </header>

        <div className="layout-content-wrapper">
          <main className="main-content">{children}</main>
          {location.pathname === '/dashboard' && (
            <aside className="right-rail">
              <div className="right-rail-widget">
                <XPBar currentXP={xp} requiredXP={requiredXP} level={level} />
              </div>
              <div className="right-rail-widget">
                <DailyStreakWidget streak={streak} bestStreak={bestStreak} />
              </div>
              <div className="right-rail-widget">
                <LeaderboardWidget
                  entries={leaderboard}
                  currentUserId={user?.id}
                  limit={5}
                />
              </div>
            </aside>
          )}
        </div>
    </div>
  );
}
