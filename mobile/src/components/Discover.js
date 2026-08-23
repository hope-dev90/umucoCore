// Ported from web src/components/Discover.jsx.
// Same 4 featured stories in the same chronological order, same tab
// switcher, same "read most of the story, blur only the ending" treatment.
// CSS blur-filter on the last paragraph is swapped for RN's opacity (RN has
// no text blur filter) plus the same bottom fade-to-background overlay.
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ArrowRight, Lock, Clock } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { gihangaStory } from '../data/stories/gihanga';
import { nyirarucyabaStory } from '../data/stories/nyirarucyaba';
import { ruganzuStory } from '../data/stories/ruganzu';
import { kigeliStory } from '../data/stories/kigeli';
import { localizeStory } from '../utils/storyLocalization';
import { colors, fontFamily } from '../theme/colors';

// Kept in the same chronological order as web: Gihanga founds the kingdom
// (~11th c.), Nyirarucyaba's cattle story follows in the same founding era,
// Ruganzu II Ndoli's return happens centuries later (~17th c.), and Kigeli
// IV Rwabugiri's reign (1853-1895) is most recent.
const FEATURED_STORIES = [gihangaStory, nyirarucyabaStory, ruganzuStory, kigeliStory];

// Story images are a mix of required local assets (numbers) and one remote
// URL string (nyirarucyaba) — RN's Image needs {uri} for the latter.
const resolveImage = (img) => (typeof img === 'string' ? { uri: img } : img);

function Discover({ onNavigate }) {
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const story = localizeStory(FEATURED_STORIES[activeIndex], language);

  const paragraphs = story.content.split('\n\n');
  const visibleParagraphs = paragraphs.slice(0, -1);
  const finalParagraph = paragraphs[paragraphs.length - 1];
  const readMinutes = Math.max(2, Math.round(story.content.split(/\s+/).length / 200));

  return (
    <View style={styles.section}>
      <View style={styles.headerCenter}>
        <View style={styles.pill}>
          <BookOpen size={14} color={colors.brown} />
          <Text style={styles.pillText}>{t('discover.kicker')}</Text>
        </View>
        <Text style={styles.title}>{t('discover.title')}</Text>
        <Text style={styles.subtitle}>{t('discover.subtitle')}</Text>
      </View>

      <View style={styles.tabRow}>
        {FEATURED_STORIES.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setActiveIndex(i)}
            style={[styles.tab, i === activeIndex && styles.tabActive]}
          >
            <Text style={[styles.tabText, i === activeIndex && styles.tabTextActive]}>
              {localizeStory(s, language).title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.storyCard}>
        <View style={styles.banner}>
          <Image source={resolveImage(story.image)} style={styles.bannerImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.bannerGradient}
          />
          <View style={styles.bannerText}>
            <View style={styles.bannerKickerRow}>
              <BookOpen size={14} color={colors.peach} />
              <Text style={styles.bannerKicker}>{t('discover.featuredStory')}</Text>
            </View>
            <Text style={styles.bannerTitle}>{story.title}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>{story.category}</Text>
          </View>
          <View style={styles.metaReadRow}>
            <Clock size={12} color={colors.taupe} />
            <Text style={styles.metaReadText}>{readMinutes} min read</Text>
          </View>
        </View>

        <View style={styles.bodyWrap}>
          {visibleParagraphs.map((para, i) => (
            <Text key={i} style={styles.paragraph}>{para}</Text>
          ))}
          <Text style={[styles.paragraph, styles.blurredParagraph]}>{finalParagraph}</Text>
          <LinearGradient
            colors={['transparent', colors.white, colors.white]}
            style={styles.fadeOverlay}
            pointerEvents="none"
          />
        </View>

        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.continueButton} onPress={() => onNavigate('signup', story.id)}>
            <Lock size={14} color={colors.ivory} />
            <Text style={styles.continueButtonText}>{t('discover.continue')}</Text>
            <ArrowRight size={14} color={colors.ivory} />
          </TouchableOpacity>
          <Text style={styles.joinNote}>{t('discover.joinToEarn')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    backgroundColor: colors.ivory,
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(234,219,200,0.4)',
  },
  headerCenter: { alignItems: 'center', marginBottom: 20 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252,223,211,0.3)',
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pillText: { fontSize: 11, fontFamily: fontFamily.sansSemiBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 24, fontFamily: fontFamily.sansBold, color: colors.brown, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 13, fontFamily: fontFamily.sans, color: colors.taupe, lineHeight: 20, textAlign: 'center' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.cream,
    backgroundColor: 'transparent',
  },
  tabActive: { backgroundColor: colors.brown, borderColor: colors.brown },
  tabText: { fontSize: 11, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  tabTextActive: { color: colors.ivory },
  storyCard: {
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.5)',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  banner: { height: 220, width: '100%', position: 'relative' },
  bannerImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  bannerGradient: { ...StyleSheet.absoluteFillObject },
  bannerText: { position: 'absolute', left: 20, right: 20, bottom: 16 },
  bannerKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  bannerKicker: { fontSize: 11, fontFamily: fontFamily.sansSemiBold, color: colors.peach, textTransform: 'uppercase', letterSpacing: 1 },
  bannerTitle: { fontSize: 22, fontFamily: fontFamily.sansBold, color: colors.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 20 },
  metaBadge: { backgroundColor: 'rgba(252,223,211,0.4)', borderWidth: 1, borderColor: colors.cream, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  metaBadgeText: { fontSize: 11, fontFamily: fontFamily.sansSemiBold, color: colors.brown, textTransform: 'uppercase' },
  metaReadRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaReadText: { fontSize: 12, fontFamily: fontFamily.sansMedium, color: colors.taupe },
  bodyWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, position: 'relative' },
  paragraph: { fontSize: 15, fontFamily: fontFamily.sans, color: colors.espresso, lineHeight: 26, marginBottom: 16 },
  blurredParagraph: { opacity: 0.35 },
  fadeOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
  ctaWrap: { alignItems: 'center', paddingBottom: 28, paddingTop: 4 },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brown,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  continueButtonText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.ivory },
  joinNote: { fontSize: 11, fontFamily: fontFamily.sans, color: colors.taupe, marginTop: 10 },
});

export default Discover;
