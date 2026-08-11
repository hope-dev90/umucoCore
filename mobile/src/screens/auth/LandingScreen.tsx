import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AuthStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const SECTION_DEFS = [
  { key: 'home-section', labelKey: 'nav.home' },
  { key: 'archive', labelKey: 'nav.about' },
  { key: 'discover', labelKey: 'discover.kicker' },
  { key: 'community', labelKey: 'nav.community' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t, language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('home-section');
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const fade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [selectedStory, setSelectedStory] = useState(0);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNavigate = (view: string, storyId?: string) => {
    if (view === 'login') navigation.navigate('Login');
    else if (view === 'signup') navigation.navigate('Signup', { continueStoryId: storyId });
    else if (view === 'home') navigation.navigate('Landing');
  };

  const registerOffset = (key: string) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setOffsets((prev) => ({ ...prev, [key]: y }));
  };

  const scrollToSection = (key: string) => {
    const y = offsets[key] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(y - 8, 0), animated: true });
    setActiveSection(key);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + 100;
    let current = SECTION_DEFS[0];
    for (const s of SECTION_DEFS) {
      if ((offsets[s.key] ?? 0) <= y) current = s;
    }
    if (current.key !== activeSection) setActiveSection(current.key);
  };

  const stats = [
    { value: '200+', label: t('hero.stats.oralStories') },
    { value: '3', label: t('hero.stats.languageModules') },
    { value: '24/7', label: t('hero.stats.aiAssistant') },
  ];

  const questSteps = [
    { step: '01', label: t('landing.quest.pick') },
    { step: '02', label: t('landing.quest.learn') },
    { step: '03', label: t('landing.quest.earn') },
  ];

  const collections = [
    {
      title: t('archive.collection1.title'),
      desc: t('archive.collection1.desc'),
      icon: 'time-outline' as const,
    },
    {
      title: t('archive.collection2.title'),
      desc: t('archive.collection2.desc'),
      icon: 'business-outline' as const,
    },
    {
      title: t('archive.collection3.title'),
      desc: t('archive.collection3.desc'),
      icon: 'musical-notes-outline' as const,
    },
  ];

  const featuredStories = [
    { id: 'gihanga', title: 'Gihanga', category: 'History' },
    { id: 'nyirarucyaba', title: 'Nyirarucyaba', category: 'Folklore' },
    { id: 'ruganzu', title: 'Ruganzu', category: 'Legend' },
    { id: 'kigeli', title: 'Kigeli IV', category: 'History' },
  ];

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>UmucoCore</Text>
        <View style={styles.langRow}>
          {(['en', 'rw', 'fr'] as const).map((code) => (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={[styles.langPill, language === code && styles.langPillActive]}
            >
              <Text style={[styles.langText, language === code && styles.langTextActive]}>
                {code.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navRow}
        style={styles.navScroll}
      >
        {SECTION_DEFS.map((s) => (
          <Pressable key={s.key} onPress={() => scrollToSection(s.key)} style={styles.navItem}>
            <Text
              style={[
                styles.navItemText,
                activeSection === s.key && styles.navItemTextActive,
              ]}
            >
              {t(s.labelKey)}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={() => handleNavigate('login')} style={styles.navItem}>
          <Text style={styles.navItemText}>{t('welcome.login')}</Text>
        </Pressable>
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View onLayout={registerOffset('home-section')} style={styles.section}>
          <View style={styles.heroContent}>
            <View style={styles.questPill}>
              <Ionicons name="trail-sign" size={16} color={colors.primary} />
              <Text style={styles.questPillText}>{t('hero.tagline')}</Text>
            </View>

            <Text style={styles.heroTitle}>
              {t('hero.title1')}{'\n'}
              <Text style={styles.heroTitleAccent}>{t('hero.title2')}</Text>
            </Text>

            <Text style={styles.heroSubtitle}>{t('hero.description')}</Text>

            <View style={styles.heroButtons}>
              <Button
                label={t('hero.getInvolved')}
                onPress={() => handleNavigate('signup')}
                style={styles.primaryButton}
              />
              <Button
                label={t('hero.exploreMore')}
                onPress={() => {
                  const y = offsets.archive ?? 0;
                  scrollRef.current?.scrollTo({ y: Math.max(y - 16, 0), animated: true });
                }}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>

            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.questProgress}>
              {questSteps.map((item) => (
                <View key={item.step} style={styles.questStep}>
                  <Text style={styles.questStepNumber}>{item.step}</Text>
                  <Text style={styles.questStepLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Digital Archive Section */}
        <View onLayout={registerOffset('archive')} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('archive.title')}</Text>
              <Text style={styles.sectionSubtitle}>{t('archive.description')}</Text>
            </View>
          </View>

          <View style={styles.collectionsGrid}>
            {collections.map((item, index) => (
              <View key={index} style={styles.collectionCard}>
                <View style={styles.collectionIcon}>
                  <Ionicons name={item.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.collectionTitle}>{item.title}</Text>
                <Text style={styles.collectionDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Discover Section */}
        <View onLayout={registerOffset('discover')} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.questPill}>
              <Ionicons name="book" size={16} color={colors.primary} />
              <Text style={styles.questPillText}>{t('discover.kicker')}</Text>
            </View>
            <Text style={styles.sectionTitle}>{t('discover.title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('discover.subtitle')}</Text>
          </View>

          <View style={styles.storyTabs}>
            {featuredStories.map((story, i) => (
              <Pressable
                key={story.id}
                onPress={() => setSelectedStory(i)}
                style={[
                  styles.storyTab,
                  selectedStory === i && styles.storyTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.storyTabText,
                    selectedStory === i && styles.storyTabTextActive,
                  ]}
                >
                  {story.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.storyCard}>
            <View style={styles.storyBanner}>
              <View style={styles.storyBannerOverlay}>
                <Text style={styles.storyBannerTitle}>
                  {featuredStories[selectedStory].title}
                </Text>
              </View>
            </View>

            <View style={styles.storyContent}>
              <Text style={styles.storyMeta}>
                {featuredStories[selectedStory].category} • 5 min read
              </Text>
              <Text style={styles.storyText}>
                {language === 'en'
                  ? 'In the beginning, there was only water and darkness. Then came the divine creator, who brought forth all of existence...'
                  : language === 'rw'
                  ? 'Mu ntangiriro, hari amazi n\'umwijima. Hanyuma haje umuremyi w\'Imana, wazanye ibintu byose...'
                  : 'Au commencement, il n\'y avait que l\'eau et les ténèbres. Puis vint le créateur divin...'}
              </Text>
              <Pressable
                onPress={() => handleNavigate('signup', featuredStories[selectedStory].id)}
                style={styles.continueButton}
              >
                <Ionicons name="lock-closed" size={16} color={colors.white} />
                <Text style={styles.continueButtonText}>{t('discover.continue')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Community Section */}
        <View onLayout={registerOffset('community')} style={styles.section}>
          <View style={styles.communityQuote}>
            <Ionicons name="chatbubbles" size={40} color={colors.primarySoft} />
            <Text style={styles.communityProverb}>"Ababiri baruta umwe."</Text>
            <Text style={styles.communityTranslation}>
              {t('community.proverbTranslation')}
            </Text>
            <Text style={styles.communityDesc}>{t('community.exploreWisdom')}</Text>
            <Button
              label={t('community.createAccount')}
              onPress={() => handleNavigate('signup')}
              style={styles.communityButton}
            />
          </View>

          <View style={styles.communityCard}>
            <View style={styles.communityCardContent}>
              <Text style={styles.communityCardTitle}>
                {t('community.becomeGuardian')}
              </Text>
              <Text style={styles.communityCardDesc}>
                {t('community.joinNetwork')}
              </Text>
              <View style={styles.communityButtons}>
                <Button
                  label={t('community.contribute')}
                  onPress={() => handleNavigate('signup')}
                  style={styles.communityActionButton}
                />
                <Button
                  label={t('community.dashboard')}
                  onPress={() => handleNavigate('login')}
                  variant="secondary"
                  style={styles.communityActionButton}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>UmucoCore</Text>
          <Text style={styles.footerSubtitle}>{t('footer.tagline')}</Text>
          <View style={styles.footerLinks}>
            <Pressable style={styles.footerLink}>
              <Ionicons name="share-social" size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable style={styles.footerLink}>
              <Ionicons name="chatbubble" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.footerCopyright}>{t('footer.copyright')}</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgMain,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  langRow: { flexDirection: 'row', gap: 6 },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  langText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  langTextActive: { color: colors.white },
  navScroll: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border },
  navRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 14, alignItems: 'center' },
  navItem: { paddingVertical: 4 },
  navItemText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  navItemTextActive: { color: colors.primary, fontWeight: '800' },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  questPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft + '66',
    marginBottom: 20,
  },
  questPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    marginTop: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  questProgress: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    marginTop: 24,
  },
  questStep: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white + 'CC',
    minHeight: 86,
  },
  questStepNumber: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
  },
  questStepLabel: {
    marginTop: 8,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 700,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    maxWidth: 700,
  },
  collectionCard: {
    flex: 1,
    minWidth: 200,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.primarySoft + '33',
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primarySoft + '66',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  collectionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  storyTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  storyTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  storyTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  storyTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  storyTabTextActive: {
    color: colors.white,
  },
  storyCard: {
    width: '100%',
    maxWidth: 700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  storyBanner: {
    height: 200,
    backgroundColor: colors.textPrimary,
    position: 'relative',
  },
  storyBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  storyBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  storyContent: {
    padding: 20,
  },
  storyMeta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  storyText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  communityQuote: {
    alignItems: 'center',
    paddingVertical: 40,
    maxWidth: 600,
  },
  communityProverb: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: 16,
  },
  communityTranslation: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  communityDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  communityButton: {
    minWidth: 200,
  },
  communityCard: {
    width: '100%',
    maxWidth: 700,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  communityCardContent: {
    padding: 32,
  },
  communityCardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  communityCardDesc: {
    fontSize: 14,
    color: colors.primarySoft,
    marginBottom: 24,
    lineHeight: 20,
  },
  communityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  communityActionButton: {
    flex: 1,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  footerLink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: colors.textMuted,
  },
});