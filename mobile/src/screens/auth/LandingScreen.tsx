import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { Button } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AuthStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const SECTIONS = [
  { key: 'home-section', label: 'Home' },
  { key: 'archive', label: 'About' },
  { key: 'discover', label: 'Discover' },
  { key: 'community', label: 'Community' },
];

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('Home');
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const fade = useRef(new Animated.Value(0)).current;

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
    setOffsets((prev: Record<string, number>) => ({ ...prev, [key]: e.nativeEvent.layout.y }));
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + 100;
    let current = SECTIONS[0];
    for (const s of SECTIONS) {
      if ((offsets[s.key] ?? 0) <= y) current = s;
    }
    if (current.label !== activeSection) setActiveSection(current.label);
  };

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={registerOffset('home-section')} style={styles.section}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t('landing.hero.title')}</Text>
            <Text style={styles.heroSubtitle}>{t('landing.hero.subtitle')}</Text>
            <View style={styles.heroButtons}>
              <Button
                label={t('auth.signup.button')}
                onPress={() => handleNavigate('signup')}
                style={styles.primaryButton}
              />
              <Button
                label={t('auth.signIn')}
                onPress={() => handleNavigate('login')}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </View>

        <View onLayout={registerOffset('archive')} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('landing.archive.title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('landing.archive.desc')}</Text>
          <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
        </View>

        <View onLayout={registerOffset('discover')} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('explore.title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('discover.subtitle')}</Text>
        </View>

        <View onLayout={registerOffset('community')} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('landing.community.title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('landing.community.desc')}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('app.name')}</Text>
          <Text style={styles.footerSubtext}>{t('landing.footer.rights')}</Text>
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
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
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
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  exploreButton: {
    minWidth: 200,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 12,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textMuted,
  },
});