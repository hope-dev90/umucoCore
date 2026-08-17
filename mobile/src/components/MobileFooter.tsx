import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function MobileFooter() {
  const { t } = useLanguage();

  const footerLinks = [
    {
      title: t('footer.explore') || 'Explore',
      links: [
        { label: t('nav.about'), action: () => {} },
        { label: t('footer.heritage'), action: () => {} },
        { label: t('footer.stories'), action: () => {} },
        { label: t('footer.audio'), action: () => {} },
      ],
    },
    {
      title: t('footer.community') || 'Community',
      links: [
        { label: t('footer.contribute'), action: () => {} },
        { label: t('footer.events'), action: () => {} },
        { label: t('footer.news'), action: () => {} },
      ],
    },
    {
      title: t('footer.support') || 'Support',
      links: [
        { label: t('footer.help'), action: () => {} },
        { label: t('footer.contact'), action: () => {} },
        { label: t('footer.privacy'), action: () => {} },
      ],
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <Text style={styles.brandText}>UmucoCore</Text>
        <Text style={styles.brandDesc}>
          {t('footer.description') || 'Preserving and sharing Rwandan heritage through technology and community.'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linksRow}>
        {footerLinks.map((group) => (
          <View key={group.title} style={styles.linkGroup}>
            <Text style={styles.linkGroupTitle}>{group.title}</Text>
            {group.links.map((link) => (
              <Pressable key={link.label} onPress={link.action}>
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} UmucoCore. {t('footer.rights') || 'All rights reserved.'}
        </Text>
        <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn}>
            <Ionicons name="logo-twitter" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <Ionicons name="logo-instagram" size={20} color={colors.textMuted} />
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <Ionicons name="logo-facebook" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
    gap: spacing.xl,
  },
  brand: {
    gap: spacing.sm,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.2,
  },
  brandDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    maxWidth: 300,
  },
  linksRow: {
    gap: spacing['3xl'],
    paddingBottom: spacing.sm,
  },
  linkGroup: {
    gap: spacing.sm,
  },
  linkGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  linkText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    paddingVertical: 4,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});