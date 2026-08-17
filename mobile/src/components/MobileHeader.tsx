import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import MobileLogo from './MobileLogo';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const LANGUAGES = [
  { code: 'en' as const, short: 'EN' },
  { code: 'rw' as const, short: 'RW' },
  { code: 'fr' as const, short: 'FR' },
];

export default function MobileHeader() {
  const { language, setLanguage, t } = useLanguage();
  const navigation = useNavigation<any>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navItems = [
    { label: t('nav.home'), screen: 'Home' },
    { label: t('nav.about'), screen: 'Home' },
    { label: t('nav.community'), screen: 'Home' },
  ];

  const handleNav = (screen: string) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable style={styles.brand} onPress={() => navigation.navigate('Home')}>
          <MobileLogo size={36} />
          <Text style={styles.brandText}>UmucoCore</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.langBtn} onPress={() => setLangOpen(!langOpen)}>
            <Ionicons name="globe-outline" size={20} color={colors.primary} />
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </Pressable>

          <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {menuOpen && (
        <View style={styles.menuBackdrop}>
          <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
            {navItems.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
                onPress={() => handleNav(item.screen)}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}

            <View style={styles.menuDivider} />

            <View style={styles.menuLangRow}>
              <Text style={styles.menuLangLabel}>{t('landing.language')}</Text>
              <View style={styles.menuLangBtns}>
                {LANGUAGES.map((lang) => (
                  <Pressable
                    key={lang.code}
                    style={[
                      styles.menuLangBtn,
                      language === lang.code && styles.menuLangBtnActive,
                    ]}
                    onPress={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.menuLangBtnText,
                        language === lang.code && styles.menuLangBtnTextActive,
                      ]}
                    >
                      {lang.short}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              style={({ pressed }) => [styles.menuAuthBtn, pressed && { opacity: 0.85 }]}
              onPress={() => handleNav('Auth')}
            >
              <Text style={styles.menuAuthBtnText}>{t('nav.login')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuAuthBtnPrimary, pressed && { opacity: 0.85 }]}
              onPress={() => handleNav('Auth')}
            >
              <Text style={styles.menuAuthBtnPrimaryText}>{t('nav.signup')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {langOpen && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.langBackdrop} onPress={() => setLangOpen(false)}>
            <View style={styles.langDropdown}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={({ pressed }) => [styles.langOption, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                >
                  <Text style={styles.langOptionText}>{lang.short}</Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgMain,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuBackdrop: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  menuContent: {
    maxHeight: 400,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  menuLangRow: {
    gap: spacing.sm,
  },
  menuLangLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  menuLangBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuLangBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgMain,
  },
  menuLangBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  menuLangBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  menuLangBtnTextActive: {
    color: colors.white,
  },
  menuAuthBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  menuAuthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  menuAuthBtnPrimary: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
  menuAuthBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  langBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,26,20,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  langDropdown: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});