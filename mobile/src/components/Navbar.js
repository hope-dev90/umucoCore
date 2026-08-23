// Ported from web src/components/Navbar.jsx.
// Web used a fixed header with a hover dropdown + a slide-down mobile menu
// toggled by a hamburger; RN has no hover state and no viewport breakpoints,
// so the "desktop nav" (md:flex) branch is dropped and the mobile menu
// (which the phone always is) is what renders — same items, same actions,
// same language dropdown, just always in "mobile" layout.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ArrowRight, Globe, Menu, X } from 'lucide-react-native';
import UmucoLogo from './UmucoLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, fontFamily } from '../theme/colors';

function Navbar({ onNavigate, activeSection }) {
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const languages = [
    { code: 'en', short: 'EN', label: t('settings.english') },
    { code: 'rw', short: 'RW', label: t('settings.kinyarwanda') },
    { code: 'fr', short: 'FR', label: t('settings.french') },
  ];

  const navItems = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.about'), id: 'archive' },
    { label: t('nav.community'), id: 'community' },
  ];

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    setIsDropdownOpen(false);
  };

  const handleNavClick = (view) => {
    setIsMenuOpen(false);
    onNavigate(view);
  };

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.brand} onPress={() => handleNavClick('home')}>
          <UmucoLogo style={{ width: 36, height: 36 }} />
          <Text style={styles.brandText}>UmucoCore</Text>
        </TouchableOpacity>

        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.langButton} onPress={() => setIsDropdownOpen(true)}>
            <Globe size={18} color={colors.brown} />
            <Text style={styles.langCode}>
              {languages.find((item) => item.code === language)?.short || 'EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.menuButton}>
            <Menu size={24} color={colors.brown} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language dropdown */}
      <Modal visible={isDropdownOpen} transparent animationType="fade" onRequestClose={() => setIsDropdownOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.dropdown}>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={styles.dropdownItem}
                onPress={() => toggleLanguage(item.code)}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Mobile menu */}
      <Modal visible={isMenuOpen} animationType="slide" onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.menuScreen}>
          <View style={styles.menuHeader}>
            <View style={styles.brand}>
              <UmucoLogo style={{ width: 32, height: 32 }} />
              <Text style={styles.brandText}>UmucoCore</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
              <X size={26} color={colors.brown} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuNav}>
            {navItems.map((item) => {
              const isActive = activeSection === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuNavItem}
                  onPress={() => handleNavClick(item.id)}
                >
                  <Text style={[styles.menuNavText, isActive && styles.menuNavTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.menuLangRow}>
            <Text style={styles.menuLangLabel}>{t('landing.language')}</Text>
            <View style={styles.menuLangOptions}>
              {languages.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => toggleLanguage(item.code)}
                  style={[
                    styles.menuLangPill,
                    language === item.code && styles.menuLangPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.menuLangPillText,
                      language === item.code && styles.menuLangPillTextActive,
                    ]}
                  >
                    {item.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.menuActions}>
            <TouchableOpacity style={styles.loginButton} onPress={() => handleNavClick('login')}>
              <Text style={styles.loginButtonText}>{t('nav.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={() => handleNavClick('signup')}>
              <Text style={styles.signupButtonText}>{t('nav.signup')}</Text>
              <ArrowRight size={16} color={colors.ivory} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 18, fontFamily: fontFamily.sansBold, color: colors.brown },
  rightControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  langButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langCode: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase' },
  menuButton: { padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  dropdown: {
    marginTop: 60,
    marginRight: 16,
    width: 176,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 12,
    paddingVertical: 4,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 10 },
  dropdownItemText: { fontSize: 12, fontFamily: fontFamily.sansMedium, color: colors.taupe },
  menuScreen: { flex: 1, backgroundColor: colors.ivory, paddingHorizontal: 24, paddingTop: 60 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  menuNav: { gap: 4, marginBottom: 24 },
  menuNavItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(234,219,200,0.3)' },
  menuNavText: { fontSize: 16, fontFamily: fontFamily.sansSemiBold, color: colors.taupe },
  menuNavTextActive: { color: colors.brown },
  menuLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234,219,200,0.3)',
    marginBottom: 24,
  },
  menuLangLabel: { fontSize: 14, fontFamily: fontFamily.sansMedium, color: colors.taupe },
  menuLangOptions: { flexDirection: 'row', gap: 8 },
  menuLangPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cream,
  },
  menuLangPillActive: { backgroundColor: colors.brown, borderColor: colors.brown },
  menuLangPillText: { fontSize: 11, fontFamily: fontFamily.sansBold, color: colors.taupe },
  menuLangPillTextActive: { color: colors.white },
  menuActions: { gap: 12, paddingTop: 8 },
  loginButton: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brown,
    borderRadius: 12,
    paddingVertical: 14,
  },
  loginButtonText: { fontSize: 14, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  signupButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brown,
    borderRadius: 12,
    paddingVertical: 14,
  },
  signupButtonText: { fontSize: 14, fontFamily: fontFamily.sansSemiBold, color: colors.ivory },
});

export default Navbar;
