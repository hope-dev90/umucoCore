// Ported from web src/components/Hero.jsx.
// The image card/banner has been removed entirely at your request — this
// now only ports the left-column text content (tagline, heading, CTAs,
// stats, quest-progress row). Note this also means the web copy's
// hero.feature1/2/3 title+desc strings and the 3 hero images are no longer
// used anywhere in the mobile app.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { UmucoGlyph } from './UmucoGlyphs';
import { colors, fontFamily } from '../theme/colors';

function Hero({ onNavigate, onExploreMore }) {
  const { t } = useLanguage();

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

  return (
    <View style={styles.section}>
      <View style={styles.textBlock}>
        <View style={styles.pill}>
          <UmucoGlyph type="trail" size={18} />
          <Text style={styles.pillText}>{t('hero.tagline')}</Text>
        </View>

        <Text style={styles.title}>
          {t('hero.title1')}{'\n'}
          <Text style={styles.titleAccent}>{t('hero.title2')}</Text>
        </Text>

        <Text style={styles.description}>{t('hero.description')}</Text>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('signup')}>
            <Text style={styles.primaryButtonText}>{t('hero.getInvolved')}</Text>
            <ArrowRight size={16} color={colors.ivory} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onExploreMore}>
            <Text style={styles.secondaryButtonText}>{t('hero.exploreMore')}</Text>
          </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  section: { width: '100%', backgroundColor: colors.ivory, paddingBottom: 24 },
  textBlock: { paddingHorizontal: 20, paddingTop: 24 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252,223,211,0.3)',
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pillText: { fontSize: 12, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  title: { fontSize: 32, fontFamily: fontFamily.sansBold, color: colors.espresso, lineHeight: 38, marginBottom: 16 },
  titleAccent: { color: colors.brown },
  description: { fontSize: 14, fontFamily: fontFamily.sans, color: colors.taupe, lineHeight: 22, marginBottom: 24 },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234,219,200,0.6)',
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brown,
    borderRadius: 10,
    paddingVertical: 14,
  },
  primaryButtonText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.ivory },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(141,73,58,0.4)',
    borderRadius: 10,
    paddingVertical: 14,
  },
  secondaryButtonText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'flex-start' },
  statValue: { fontSize: 20, fontFamily: fontFamily.sansBold, color: colors.brown },
  statLabel: { fontSize: 11, fontFamily: fontFamily.sansMedium, color: colors.taupe, marginTop: 2 },
  questProgress: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  questStep: { flex: 1 },
  questStepNumber: { fontSize: 11, fontFamily: fontFamily.sansBold, color: colors.sand },
  questStepLabel: { fontSize: 12, fontFamily: fontFamily.sansSemiBold, color: colors.espresso, marginTop: 2 },
});

export default Hero;