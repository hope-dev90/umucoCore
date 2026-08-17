// src/screens/auth/LandingScreen.tsx
//
// Rebuild of the mobile landing screen from the screencast, adapted to fit
// this project's actual conventions:
//  - TypeScript + Expo
//  - useLanguage().t() for all copy (see translations-additions/landing-keys.ts
//    for the keys that must be added to en/rw/fr.json)
//  - existing MobileLogo / UmucoGlyph components for brand marks
//  - theme/colors.ts + theme/spacing.ts design tokens
//  - services/landingService.ts for backend-driven stats/steps/newsletter
//  - navigates via AuthStackParamList ('Landing' -> 'Login' | 'Signup')
//
// Image slots that don't yet have a real asset are rendered with
// <ImagePlaceholder>, labelled with what's needed — search "IMAGE:" to
// find every one. Drop finished assets into assets/landing/ and swap.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Adjust these two import paths if your actual file names differ ---
import type { AuthStackParamList } from '../../navigation/types';
import { useLanguage } from '../../context/LanguageContext';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

import MobileLogo from '../../components/MobileLogo';
import UmucoGlyph from '../../components/UmucoGlyph';

import {
  fetchLandingStats,
  fetchStorySteps,
  subscribeNewsletter,
  LandingStats,
  StoryStep,
} from '../../services/landingService';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const FALLBACK_STATS: LandingStats = { stories: 200, modules: 3, support: '24/7' };

const FALLBACK_STEPS: StoryStep[] = [
  { id: '01', title: 'landing.steps.step1.title' },
  { id: '02', title: 'landing.steps.step2.title' },
  { id: '03', title: 'landing.steps.step3.title' },
];

// -------- lightweight placeholder for images not yet designed/sourced --------
function ImagePlaceholder({
  label,
  size = 32,
  round = false,
}: {
  label: string;
  size?: number;
  round?: boolean;
}) {
  return (
    <View
      style={[
        styles.imagePlaceholder,
        { width: size, height: size, borderRadius: round ? size / 2 : 8 },
      ]}
    >
      <Text style={styles.imagePlaceholderText} numberOfLines={3}>
        {label}
      </Text>
    </View>
  );
}

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const [stats, setStats] = useState<LandingStats>(FALLBACK_STATS);
  const [steps, setSteps] = useState<StoryStep[]>(FALLBACK_STEPS);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchLandingStats()
      .then((data) => mounted && setStats(data))
      .catch(() => {
        /* keep fallback — Render free tier may be cold-starting */
      });

    fetchStorySteps()
      .then((data) => mounted && data.length > 0 && setSteps(data))
      .catch(() => {
        /* keep fallback steps */
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert(
        t('landing.newsletterAlerts.invalidTitle'),
        t('landing.newsletterAlerts.invalidBody')
      );
      return;
    }
    setSubscribing(true);
    try {
      await subscribeNewsletter(email.trim());
      Alert.alert(
        t('landing.newsletterAlerts.successTitle'),
        t('landing.newsletterAlerts.successBody')
      );
      setEmail('');
    } catch {
      Alert.alert(
        t('landing.newsletterAlerts.errorTitle'),
        t('landing.newsletterAlerts.errorBody')
      );
    } finally {
      setSubscribing(false);
    }
  }, [email, t]);

  return (
    <View style={styles.screen}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MobileLogo size={32} />
          <Text style={styles.brand}>UmucoCore</Text>
        </View>
        {/* No hamburger menu here — Landing is pre-auth, so route straight
            to Login instead of a drawer/menu. */}
        {/* @ts-ignore */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.headerLoginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- HERO ---------- */}
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🔗</Text>
          <Text style={styles.badgeText}>{t('landing.badge')}</Text>
        </View>

        <Text style={styles.heroTitle}>
          {t('landing.heroTitlePrefix')}{' '}
          <Text style={{ color: colors.primary }}>
            {t('landing.heroTitleHighlight')}
          </Text>
          <Text style={styles.heroDot}> .</Text>
        </Text>

        <Text style={styles.heroSubtitle}>{t('landing.heroSubtitle')}</Text>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            // @ts-ignore
            onPress={() => navigation.navigate('Signup', {})}
          >
            <Text style={styles.primaryButtonText}>{t('landing.ctaPrimary')}</Text>
            <Text style={styles.primaryButtonArrow}> →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textLinkButton}>
            <Text style={styles.textLinkText}>{t('landing.ctaSecondary')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ---------- STATS ---------- */}
        <View style={styles.statsList}>
          <View style={styles.statRow}>
            <Text style={styles.statValue}>{stats.stories}+</Text>
            <Text style={styles.statLabel}>{t('landing.stats.storiesLabel')}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statValue}>{stats.modules}</Text>
            <Text style={styles.statLabel}>{t('landing.stats.modulesLabel')}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statValue}>{stats.support}</Text>
            <Text style={styles.statLabel}>{t('landing.stats.supportLabel')}</Text>
          </View>
        </View>

        {/* ---------- STORY STEPS ---------- */}
        <View style={styles.stepsWrap}>
          {steps.map((step, index) => (
            <View
              key={step.id}
              style={[styles.stepCard, index === 0 && styles.stepCardActive]}
            >
              <View style={styles.stepCardHeader}>
                <Text
                  style={[styles.stepNumber, index === 0 && styles.stepNumberActive]}
                >
                  {step.id}
                </Text>
                {/* IMAGE: per-step icon (headphones/book/people depending on
                    topic), single-color linework, 24x24 */}
                <ImagePlaceholder label={`step ${step.id} icon`} size={24} />
              </View>
              <Text style={styles.stepTitle}>
                {step.title.startsWith('landing.') ? t(step.title) : step.title}
              </Text>
              {!!step.description && (
                <Text style={styles.stepDescription}>{step.description}</Text>
              )}
            </View>
          ))}
        </View>

        {/* ---------- QUOTE ---------- */}
        <View style={styles.quoteBlock}>
          <UmucoGlyph size={48} />
          <Text style={styles.quoteText}>{t('landing.quote.text')}</Text>
          <Text style={styles.quoteSupport}>{t('landing.quote.support')}</Text>
          <Text style={styles.quoteCaption}>{t('landing.quote.caption')}</Text>
          <TouchableOpacity
            style={styles.outlinePrimaryButton}
            activeOpacity={0.85}
            // @ts-ignore
            onPress={() => navigation.navigate('Signup', {})}
          >
            <Text style={styles.outlinePrimaryButtonText}>
              {t('landing.quote.cta')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------- CONTRIBUTE CTA CARD ---------- */}
        <View style={styles.ctaCard}>
          {/* IMAGE: faint full-bleed imigongo pattern overlay behind this
              card, low opacity, matches primaryDark background */}
          <Text style={styles.ctaTitle}>{t('landing.contribute.title')}</Text>
          <Text style={styles.ctaBody}>{t('landing.contribute.body')}</Text>
          <TouchableOpacity style={styles.ctaPrimaryButton} activeOpacity={0.85}>
            <Text style={styles.ctaIcon}>📄</Text>
            <Text style={styles.ctaPrimaryButtonText}>
              {t('landing.contribute.primaryCta')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaGhostButton} activeOpacity={0.7}>
            <Text style={styles.ctaIcon}>🛡</Text>
            <Text style={styles.ctaGhostButtonText}>
              {t('landing.contribute.secondaryCta')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <Text style={styles.footerBrand}>{t('landing.footer.brand')}</Text>
            <Text style={styles.footerTagline}>{t('landing.footer.tagline')}</Text>
          </View>

          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>
              {t('landing.footer.exploreColumnTitle')}
            </Text>
            {(t('landing.footer.exploreLinks', { returnObjects: true }) as unknown as string[]).map(
              (link) => (
                <TouchableOpacity key={link}>
                  <Text style={styles.footerLink}>{link}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>
              {t('landing.footer.communityColumnTitle')}
            </Text>
            {(
              t('landing.footer.communityLinks', { returnObjects: true }) as unknown as string[]
            ).map((link) => (
              <TouchableOpacity key={link}>
                <Text style={styles.footerLink}>{link}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>{t('landing.footer.newsletterTitle')}</Text>
            <Text style={styles.footerNewsletterText}>
              {t('landing.footer.newsletterBody')}
            </Text>
            <View style={styles.newsletterRow}>
              <TextInput
                style={styles.newsletterInput}
                placeholder={t('landing.footer.newsletterPlaceholder')}
                placeholderTextColor={colors.textOnDarkMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={styles.newsletterButton}
                onPress={handleSubscribe}
                disabled={subscribing}
              >
                {subscribing ? (
                  <ActivityIndicator size="small" color={colors.textOnDark} />
                ) : (
                  <Text style={styles.newsletterButtonText}>
                    {t('landing.footer.newsletterSubmit')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerCopyright}>{t('landing.footer.copyright')}</Text>

          <View style={styles.footerPolicyRow}>
            {(t('landing.footer.policyLinks', { returnObjects: true }) as unknown as string[]).map(
              (link) => (
                <Text key={link} style={styles.footerPolicyLink}>
                  {link}
                </Text>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgMain },
  scrollContent: { paddingBottom: spacing['4xl'] ?? 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md ?? 16,
    paddingVertical: spacing.sm ?? 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm ?? 8,
    flexShrink: 1,
  },
  brand: { fontSize: 18, fontWeight: '700', color: colors.primary, flexShrink: 1 },
  headerLoginText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  imagePlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  imagePlaceholderText: { fontSize: 7, color: colors.primary, textAlign: 'center' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: spacing.md ?? 16,
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.lg ?? 24,
    gap: 6,
  },
  badgeIcon: { fontSize: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.4 },

  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 38,
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.md ?? 16,
  },
  heroDot: { color: colors.primary },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.sm ?? 8,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.lg ?? 24,
    gap: spacing.lg ?? 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg ?? 24,
    borderRadius: 8,
  },
  primaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  primaryButtonArrow: { color: colors.white, fontWeight: '700' },
  textLinkButton: { paddingVertical: 14 },
  textLinkText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.xl ?? 32,
  },

  statsList: {
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.xl ?? 32,
    gap: spacing.lg ?? 24,
  },
  statRow: { gap: 2 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  stepsWrap: {
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.xl ?? 32,
    gap: spacing.md ?? 16,
  },
  stepCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md ?? 16,
  },
  stepCardActive: { borderColor: colors.primary },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNumber: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  stepNumberActive: { color: colors.primary },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  stepDescription: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  quoteBlock: {
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing.xxl ?? 48,
    alignItems: 'center',
  },
  quoteGlyph: { marginBottom: spacing.sm ?? 8 },
  quoteText: { fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  quoteSupport: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm ?? 8,
    lineHeight: 20,
  },
  quoteCaption: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm ?? 8,
  },
  outlinePrimaryButton: {
    marginTop: spacing.lg ?? 24,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl ?? 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  outlinePrimaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  ctaCard: {
    marginHorizontal: spacing.md ?? 16,
    marginTop: spacing['4xl'] ?? 32,
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: spacing.lg ?? 24,
  },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  ctaBody: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: spacing.sm ?? 8 },
  ctaPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: spacing.lg ?? 24,
    gap: 8,
  },
  ctaPrimaryButtonText: { color: colors.primaryDark, fontWeight: '700', fontSize: 14 },
  ctaGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: spacing.sm ?? 8,
    gap: 8,
  },
  ctaGhostButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  ctaIcon: { fontSize: 14 },

  footer: {
    marginTop: spacing['4xl'] ?? 32,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md ?? 16,
    paddingTop: spacing.xl ?? 32,
    paddingBottom: spacing.xl ?? 32,
  },
  footerBrandRow: { marginBottom: spacing.xl ?? 32 },
  footerBrand: { fontSize: 20, fontWeight: '800', color: colors.white },
  footerTagline: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: spacing.sm ?? 8 },
  footerCol: { marginBottom: spacing.xl ?? 32 },
  footerColTitle: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: spacing.sm ?? 8 },
  footerLink: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm ?? 8 },
  footerNewsletterText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md ?? 16,
  },
  newsletterRow: { flexDirection: 'row', gap: spacing.sm ?? 8 },
  newsletterInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: spacing.md ?? 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 13,
  },
  newsletterButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md ?? 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsletterButtonText: { color: colors.bgMain, fontWeight: '700', fontSize: 13 },
  footerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: spacing.md ?? 16 },
  footerCopyright: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm ?? 8 },
  footerPolicyRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md ?? 16 },
  footerPolicyLink: { fontSize: 12, color: colors.textSecondary },
});