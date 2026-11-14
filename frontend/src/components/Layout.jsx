import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Layout.css';
import '../styles/doomshield.css';
import UmucoLogo from './UmucoLogo';

const Icon = ({ d, size = 16, strokeWidth = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const KwibukaNavIcon = () => (
  <svg className="kwibuka-nav-flame" viewBox="0 0 120 160" aria-hidden="true">
    <path d="M67 7C47 35 42 61 53 84c5 11 4 21-3 31 25-16 38-39 33-67-2-13-8-27-16-41Z" fill="currentColor" />
    <path d="M39 55C22 78 20 103 34 124c7 10 16 17 28 22-13-20-8-38 9-55-10 8-20 7-26-2-6-9-6-21-6-34Z" fill="currentColor" />
    <path d="M73 88c20 22 20 44-2 66 31-15 44-39 36-65-3-11-10-21-20-30 3 13-1 22-14 29Z" fill="currentColor" />
  </svg>
);

const Icons = {
  home:        "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  explore:     "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  listen:      "M9 18V5l12-2v13 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  collections: "M7 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M7 13.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 13.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  intldays:    "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  library:     "M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z M8 8h6 M8 12h6 M18 8h2v14H8",
  contribute:  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v8 M8 12h8",
  recents:     "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  saved:       "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  logout:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  profile:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  admin:       "M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6l7-4z M9 12l2 2 4-5",
  search:      "M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M21 21l-4.35-4.35",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  menu:        "M3 12h18 M3 6h18 M3 18h18",
  panel:       "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 3v18 M15 9l-3 3 3 3",
  chevron:     "M6 9l6 6 6-6",
};

// Decorative QR-style mark for the "download our mobile app" card.
// Replace with a real QR code image once the app store link exists.
const QR_CELLS = [
  '1111111010101111111', '1000001001101000001', '1011101011001011101', '1011101000101011101',
  '1011101010101011101', '1000001011001000001', '1111111010101111111', '0000000011100000000',
  '1101011101011010110', '0110100110110101001', '1011011001101110110', '0100110110010011001',
  '1111001011101100111', '0000000010011010100', '1111111011010110110', '1000001010111001011',
  '1011101001010111100', '1000001011101001011', '1111111010011110101',
];
const QrMark = () => (
  <svg className="sidebar-download-qr" viewBox="0 0 19 19" shapeRendering="crispEdges" aria-hidden="true">
    {QR_CELLS.flatMap((row, y) => [...row].map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
  </svg>
);

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'Français' },
];

export default function Layout({
  children,
  searchPlaceholder = 'ui.searchArchive',
  searchQuery = '',
  onSearchChange,
  adminNavGroups: providedAdminNavGroups = [],
  adminTopbarTitle: providedAdminTopbarTitle = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('umuco.sidebarCollapsed') === '1'; } catch { return false; }
  });
  const langRef = useRef(null);
  const accountRef = useRef(null);
  const isAdmin = user?.role === 'admin';
  const isKwibuka = location.pathname.startsWith('/kwibuka') || location.pathname.startsWith('/testimon');

  useEffect(() => {
    try { localStorage.setItem('umuco.sidebarCollapsed', collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);

  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangMenuOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const exploreNav = [
    { label: t('sidebar.home'),        path: '/dashboard',   icon: 'home' },
    { label: t('sidebar.explore'),     path: '/explore',     icon: 'explore' },
    { label: t('sidebar.listen'),      path: '/listen',      icon: 'listen' },
    { label: t('sidebar.collections'), path: '/collections', icon: 'collections' },
    { label: t('sidebar.kwibuka'),     path: '/kwibuka',     icon: 'kwibuka' },
    { label: t('sidebar.intldays'),    path: '/intl-days',   icon: 'intldays' },
    { label: t('ui.library'),          path: '/library',     icon: 'library' },
  ];
  const contributeNav = [
    { label: t('sidebar.contribute'), path: '/contribute', icon: 'contribute' },
  ];
  const personalNav = [
    { label: t('ui.recents'),     path: '/history', icon: 'recents' },
    { label: t('sidebar.saved'),  path: '/saved',   icon: 'saved' },
  ];

  const adminNavGroups = isAdmin ? providedAdminNavGroups : [];
  const adminTopbarTitle = providedAdminTopbarTitle || 'Admin';

  const isActive = (path) => {
    const [basePath, hash] = path.split('#');
    if (hash) {
      if (hash === 'metrics' && location.pathname === basePath && !location.hash) return true;
      return location.pathname === basePath && location.hash === `#${hash}`;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const goTo = (path) => {
    navigate(path);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ item, onClick }) => (
    <button
      type="button"
      className={`sidebar-link ${item.path && isActive(item.path) ? 'active' : ''}`}
      onClick={onClick || (() => goTo(item.path))}
      title={collapsed ? item.label : undefined}
    >
      <span className="sidebar-link-icon">
        {item.icon === 'kwibuka' ? <KwibukaNavIcon /> : <Icon d={Icons[item.icon]} size={17} />}
      </span>
      <span className="sidebar-link-label">{item.label}</span>
      {item.badge ? <span className="sidebar-link-badge">{item.badge}</span> : null}
    </button>
  );

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const displayName = user?.name || t('ui.guest');

  return (
    <div className={`layout ${isAdmin ? 'admin-layout' : ''} ${isKwibuka ? 'layout--mono' : ''} ${collapsed ? 'layout--collapsed' : ''}`}>
      {mobileNavOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <UmucoLogo style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
          <div className="sidebar-logo-text">
            <span>Umuco-core</span>
            <span>{t('ui.heritageArchive')}</span>
          </div>
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t('ui.expandSidebar') : t('ui.collapseSidebar')}
          >
            <Icon d={Icons.panel} size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {!isAdmin && (
            <>
              <div className="sidebar-section-label">{t('ui.navExplore')}</div>
              {exploreNav.map((item) => <NavLink key={item.path} item={item} />)}

              <div className="sidebar-section-label">{t('ui.navContribute')}</div>
              {contributeNav.map((item) => <NavLink key={item.path} item={item} />)}

              <div className="sidebar-section-label">{t('ui.navPersonal')}</div>
              {personalNav.map((item) => <NavLink key={item.path} item={item} />)}
              <NavLink item={{ label: t('ui.logout'), icon: 'logout' }} onClick={handleSignOut} />
            </>
          )}

          {adminNavGroups.map((group) => (
            <React.Fragment key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map((item) => <NavLink key={item.path} item={item} />)}
            </React.Fragment>
          ))}
          {isAdmin && (
            <NavLink item={{ label: t('ui.logout'), icon: 'logout' }} onClick={handleSignOut} />
          )}
        </nav>

        {!isAdmin && (
          <div className="sidebar-download">
            <p>{t('ui.downloadOur')}<span>{t('ui.mobileApp')}</span></p>
            <QrMark />
            <button type="button" className="sidebar-download-btn">{t('ui.downloadApp')}</button>
          </div>
        )}
      </aside>

      <div className="layout-main">
        <header className="topbar">
          <button
            type="button"
            className="topbar-hamburger"
            onClick={() => setMobileNavOpen(true)}
            aria-expanded={mobileNavOpen}
            aria-label={t('ui.openNavigation')}
          >
            <Icon d={Icons.menu} size={18} />
          </button>
          {isAdmin && <div className="admin-topbar-title">{adminTopbarTitle}</div>}
          <label className="topbar-search">
            <span className="topbar-search-icon"><Icon d={Icons.search} size={15} /></span>
            <input
              type="text"
              placeholder={t(searchPlaceholder)}
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </label>

          <div className="topbar-right">
            <div className="topbar-lang" ref={langRef}>
              <button
                type="button"
                className="topbar-lang-btn"
                onClick={() => setLangMenuOpen((o) => !o)}
                aria-expanded={langMenuOpen}
              >
                {currentLang.label}
                <Icon d={Icons.chevron} size={13} />
              </button>
              {langMenuOpen && (
                <div className="topbar-menu topbar-lang-menu">
                  {LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      className={l.code === language ? 'active' : ''}
                      onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="topbar-icon-btn" aria-label={t('topbar.notifications')}>
              <Icon d={Icons.bell} size={16} />
            </button>

            <div className="topbar-account" ref={accountRef}>
              <button
                type="button"
                className="topbar-user"
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-expanded={accountMenuOpen}
                aria-label={t('ui.openAccountMenu')}
              >
                <span className="topbar-avatar">
                  {user?.profileImage
                    ? <img src={user.profileImage} alt="" />
                    : displayName.charAt(0).toUpperCase()}
                </span>
                <span className="topbar-user-info">
                  <span>{displayName}</span>
                  {user?.email && <span>{user.email}</span>}
                </span>
              </button>
              {accountMenuOpen && (
                <div className="topbar-menu topbar-account-menu">
                  <button type="button" onClick={() => goTo('/profile')}>
                    <Icon d={Icons.profile} size={14} /> {t('sidebar.profile')}
                  </button>
                  <button type="button" onClick={() => goTo('/settings')}>
                    <Icon d={Icons.settings} size={14} /> {t('sidebar.settings')}
                  </button>
                  {isAdmin && (
                    <button type="button" onClick={() => goTo('/admin')}>
                      <Icon d={Icons.admin} size={14} /> {t('sidebar.admin')}
                    </button>
                  )}
                  <button type="button" onClick={handleSignOut}>
                    <Icon d={Icons.logout} size={14} /> {t('ui.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
