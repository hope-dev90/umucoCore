import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button, Card, Chip, Muted, SectionHeader, Title } from '../../components/ui';
import { HeritageCard } from '../../components/HeritageCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { getHeritage } from '../../services/heritageService';
import { getFeaturedAudio } from '../../services/audioService';
import { getHistory, trackView } from '../../services/historyService';
import { updateExplorerType } from '../../services/userService';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { AudioItem, ExplorerType, HeritageItem, HistoryItem } from '../../types';

const EXPLORER_TYPES: ExplorerType[] = [
  'warrior',
  'nature-lover',
  'royal-historian',
  'folktale-hunter',
  'music-explorer',
];

const EXPLORER_CATEGORY: Record<string, string> = {
  warrior: 'warrior',
  'nature-lover': 'nature',
  'royal-historian': 'royal',
  'folktale-hunter': 'folklore',
  'music-explorer': 'music',
};

const EXPLORER_GREETINGS: Record<string, string> = {
  warrior: 'Muraho Warrior',
  'nature-lover': 'Muraho Nature Lover',
  'royal-historian': 'Muraho Royal Historian',
  'folktale-hunter': 'Muraho Folktale Hunter',
  'music-explorer': 'Muraho Music Explorer',
};

const EXPLORE_ITEMS = [
  { title: 'Intore Culture', category: 'Royal', xp: 25, meta: 'History • 12 mins left', explorerTypes: ['warrior', 'royal-historian'] },
  { title: 'Kigeli IV Rwabugiri', category: 'Legends', xp: 30, meta: 'Lineage • New Activity', explorerTypes: ['warrior', 'royal-historian'] },
  { title: 'Traditional Music', category: 'Audio', xp: 20, meta: 'Audio • 4 Stories', explorerTypes: ['music-explorer'] },
  { title: 'Ubudehe', category: 'Values', xp: 15, meta: 'Values • Updated', explorerTypes: ['nature-lover', 'folktale-hunter'] },
];

const TOPICS = ['Ubwiru', 'History', 'Drums', 'Kings', 'Values', 'Uburego'];

const ACTIVITY_ITEMS = [
  { label: 'Viewed the Royal Palace', time: 'Today' },
  { label: 'Saved Intore Culture', time: 'Yesterday' },
  { label: 'Listened to Inanga Tale', time: '2 days ago' },
];

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const { xp, level, streak, awardXP } = useGamification();
  const navigation = useNavigation<any>();

  const explorerType = (user?.explorerType || user?.explorer_type || '') as ExplorerType;
  const [showPicker, setShowPicker] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [savingType, setSavingType] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [highlight, setHighlight] = useState<HeritageItem | null>(null);
  const [audioHighlight, setAudioHighlight] = useState<AudioItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const category = EXPLORER_CATEGORY[String(explorerType)] || undefined;
  const firstName = user?.name?.split(' ')[0] || 'Explorer';
  const greetingPrefix = EXPLORER_GREETINGS[explorerType] || 'Muraho';
  const welcomeHeading = `${greetingPrefix}, ${firstName}`;

  useEffect(() => {
    if (!explorerType) {
      const timer = setTimeout(() => setShowPicker(true), 500);
      return () => clearTimeout(timer);
    }
    setShowPicker(false);
  }, [explorerType]);

  const load = useCallback(async () => {
    const [hist, heritage, featured] = await Promise.all([
      getHistory(5).catch(() => []),
      getHeritage(category).catch(() => []),
      explorerType === 'music-explorer' ? getFeaturedAudio().catch(() => null) : Promise.resolve(null),
    ]);
    setHistory(hist);
    setHighlight(heritage[0] || null);
    setAudioHighlight(featured);
  }, [category, explorerType]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const saveExplorer = async () => {
    if (!selectedType) return;
    setSavingType(true);
    try {
      await updateExplorerType(selectedType);
      updateUser({ explorerType: selectedType, explorer_type: selectedType });
      setShowPicker(false);
    } catch {
      // keep modal open
    } finally {
      setSavingType(false);
    }
  };

  const openHighlight = async () => {
    if (!highlight) return;
    await trackView({
      type: 'Place',
      itemId: highlight.id,
      title: highlight.title,
      image: String(highlight.image_url || highlight.image || ''),
      category: highlight.category,
    });
    await awardXP(10, `Read dashboard item: ${highlight.title}`);
    navigation.navigate('Explore');
  };

  const shareHighlight = async () => {
    if (!highlight) return;
    await Share.share({
      message: `${highlight.title}\n\n${highlight.description || ''}`.trim(),
    });
  };

  const sortedExploreItems = EXPLORE_ITEMS;

  const extractText = (val: unknown, fallback: string) => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const obj = val as Record<string, string>;
      return obj[language] || obj.en || obj.rw || obj.fr || fallback;
    }
    return fallback;
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh} contentStyle={{ paddingBottom: 100 }}>
      {/* ── HEADER: Personalized greeting ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Title style={styles.greeting}>{welcomeHeading}</Title>
          <Muted style={{ marginTop: 4 }}>
            {explorerType
              ? `Your ${t(`explorer.${explorerType}.label`) || 'journey'} through Rwanda's heritage awaits.`
              : t('home.subtitle')}
          </Muted>
        </View>
      </View>

      {/* ── QUEST STRIP: Level, Streak, XP ── */}
      <View style={styles.questStrip}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>Lv {level}</Text>
          <Muted style={styles.statLabel}>{t('home.level') || 'LEVEL'}</Muted>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{streak} days</Text>
          <Muted style={styles.statLabel}>{t('home.streak') || 'STREAK'}</Muted>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{xp}</Text>
          <Muted style={styles.statLabel}>{t('home.xp') || 'XP'}</Muted>
        </Card>
      </View>

      {/* ── TODAY'S HIGHLIGHT CARD ── */}
      {highlight ? (
        <View>
          <SectionHeader title={t('home.todayHighlight') || "Today's Highlight"} />
          <Pressable
            onPress={openHighlight}
            style={({ pressed }) => [
              styles.highlightCard,
              pressed && { opacity: 0.92 },
            ]}
          >
            <View style={styles.highlightImageWrap}>
              {highlight.image_url || highlight.image ? (
                <Image
                  source={{ uri: String(highlight.image_url || highlight.image) }}
                  style={styles.highlightImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.highlightImage, styles.highlightImageFallback]}>
                  <Ionicons name="image-outline" size={48} color="rgba(255,250,244,0.85)" />
                </View>
              )}
              <View style={styles.highlightBadge}>
                <Text style={styles.highlightBadgeText}>{t('home.todayHighlight') || "Today's Pick"}</Text>
              </View>
            </View>
            <View style={styles.highlightBody}>
              <Text style={styles.highlightTitle}>
                {extractText(highlight.title, 'Featured Heritage')}
              </Text>
              <Muted style={styles.highlightDesc} numberOfLines={3}>
                {extractText(highlight.description, '')}
              </Muted>
              <View style={styles.highlightActions}>
                <Button
                  label={t('home.exploreNow') || 'Explore Now'}
                  variant="primary"
                  onPress={openHighlight}
                  style={{ flex: 1 }}
                />
                <Pressable onPress={shareHighlight} style={styles.shareBtn}>
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </Pressable>
        </View>
      ) : null}

      {/* ── CONTINUE EXPLORING: Grid of cards with badges ── */}
      <View>
        <SectionHeader
          title={t('home.continueExploring') || 'Continue Exploring'}
          actionLabel={t('home.viewAll') || 'View All'}
          onAction={() => navigation.navigate('Explore')}
        />
        <View style={styles.exploreGrid}>
          {sortedExploreItems.slice(0, 4).map((item, idx) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [styles.exploreThumb, pressed && { opacity: 0.9 }]}
              onPress={() => {
                awardXP(10, `Read dashboard item: ${item.title}`);
                navigation.navigate('Explore');
              }}
            >
              <View style={[styles.exploreThumbImg, { backgroundColor: idx % 2 === 0 ? '#F4E8DC' : '#EADBC8' }]}>
                <View style={styles.exploreThumbBadges}>
                  <View style={styles.badgeCategory}>
                    <Text style={styles.badgeCategoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.badgeXP}>
                    <Text style={styles.badgeXPText}>+{item.xp} XP</Text>
                  </View>
                </View>
                <Ionicons
                  name={
                    idx === 0 ? 'people-circle' :
                    idx === 1 ? 'trophy' :
                    idx === 2 ? 'musical-notes' : 'heart'
                  }
                  size={36}
                  color={colors.primary}
                  style={{ opacity: 0.5 }}
                />
              </View>
              <View style={styles.exploreThumbBody}>
                <Text style={styles.exploreThumbLabel} numberOfLines={1}>{item.title}</Text>
                <Muted style={styles.exploreThumbMeta}>{item.meta}</Muted>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── POPULAR TOPICS: Chips ── */}
      <View>
        <Text style={styles.topicsLabel}>
          {t('home.popularTopics') || 'POPULAR TOPICS'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
          {TOPICS.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onPress={() => navigation.navigate('Explore')}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── KWIBUKA COUNTDOWN CARD ── */}
      <Pressable
        style={({ pressed }) => [styles.kwibukaCard, pressed && { opacity: 0.92 }]}
        onPress={() => navigation.navigate('More')}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.kwibukaHeader}>
            <Ionicons name="flower-outline" size={18} color={colors.primary} />
            <Text style={styles.kwibukaTitle}>{t('sidebar.kwibuka') || 'Kwibuka'}</Text>
          </View>
          <Muted style={{ marginTop: 4 }}>{t('kwibuka.subtitle') || 'Remember • Unite • Renew'}</Muted>
          <Button
            label={t('home.exploreKwibuka') || 'Explore Kwibuka'}
            variant="primary"
            style={{ marginTop: 14 }}
            onPress={() => navigation.navigate('More')}
          />
        </View>
        <View style={styles.kwibukaCountdown}>
          <Text style={styles.kwibukaDaysNum}>31</Text>
          <Text style={styles.kwibukaDaysLabel}>{t('home.daysToGo') || 'days to go'}</Text>
        </View>
      </Pressable>

      {/* ── RECENTLY VIEWED ── */}
      <View>
        <SectionHeader
          title={t('home.recentlyAdded') || 'Recently Viewed'}
          actionLabel={t('home.viewAll') || 'View All'}
          onAction={() => navigation.navigate('More')}
        />
        {history.length === 0 ? (
          <Card>
            <Muted style={{ textAlign: 'center', paddingVertical: 16 }}>
              {t('history.empty') || 'No recent items yet.'}
            </Muted>
          </Card>
        ) : (
          <Card style={{ padding: 4 }}>
            {history.slice(0, 3).map((item) => (
              <Pressable
                key={String(item.id)}
                style={({ pressed }) => [styles.recentItem, pressed && { backgroundColor: colors.bgMain }]}
                onPress={() => navigation.navigate('More')}
              >
                <View style={[styles.recentIcon, { backgroundColor: item.type === 'Audio' ? 'rgba(141,73,58,0.12)' : 'rgba(141,73,58,0.10)' }]}>
                  <Ionicons
                    name={
                      item.type === 'Audio' ? 'headset-outline' :
                      item.type === 'Video' ? 'play-circle-outline' :
                      'document-text-outline'
                    }
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                  <Muted>
                    {item.type || 'Item'}
                    {item.viewedAt ? ` · ${new Date(item.viewedAt).toLocaleDateString()}` : ''}
                  </Muted>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        )}
      </View>

      {/* ── YOUR ACTIVITY FEED ── */}
      <View>
        <SectionHeader title={t('home.yourActivity') || 'Your Activity'} />
        <Card style={{ padding: 4 }}>
          {ACTIVITY_ITEMS.map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.activityItem, pressed && { backgroundColor: colors.bgMain }]}
            >
              <View style={styles.activityDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityLabel}>{item.label}</Text>
                <Muted>{item.time}</Muted>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* ── FOOTER QUOTE ── */}
      <View style={styles.footerQuote}>
        <Text style={styles.footerQuoteText}>
          "{t('home.quoteText') || 'A people without the knowledge of their past history, origin and culture is like a tree without roots.'}"
        </Text>
        <Muted style={{ marginTop: 8, textAlign: 'center' }}>
          {t('home.quoteSub') || '— Marcus Garvey'}
        </Muted>
      </View>

      {/* ── AUDIO HIGHLIGHT (for music explorers) ── */}
      {audioHighlight ? (
        <Card>
          <Text style={styles.audioTitle}>{String(audioHighlight.title)}</Text>
          <Muted style={{ marginTop: 4 }} numberOfLines={2}>
            {String(audioHighlight.description || '')}
          </Muted>
          <Button
            label={t('tabs.listen') || 'Listen'}
            variant="primary"
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('Listen')}
          />
        </Card>
      ) : null}

      {/* ── EXPLORER TYPE PICKER MODAL ── */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>{t('explorerPicker.kicker')}</Text>
            <Text style={styles.modalTitle}>{t('explorerPicker.title')}</Text>
            <Muted style={styles.modalSub}>{t('explorerPicker.subtitle')}</Muted>
            <ScrollView showsVerticalScrollIndicator={false}>
              {EXPLORER_TYPES.map((type) => {
                const active = selectedType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedType(type)}
                    style={[styles.typeRow, active && styles.typeRowActive]}
                  >
                    <View style={styles.typeIconWrap}>
                      <Ionicons
                        name={
                          type === 'warrior' ? 'shield' :
                          type === 'nature-lover' ? 'leaf' :
                          type === 'royal-historian' ? 'trophy' :
                          type === 'folktale-hunter' ? 'book' :
                          'musical-notes'
                        }
                        size={20}
                        color={active ? colors.primary : colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeTitle}>{t(`explorer.${type}.label`)}</Text>
                      <Text style={styles.typeSub} numberOfLines={1}>
                        {t(`explorer.${type}.tagline`)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.typeRadio,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary : 'transparent',
                        },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button
              label={savingType ? t('common.saving') : t('explorerPicker.start')}
              onPress={saveExplorer}
              disabled={!selectedType}
              loading={savingType}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const SHADOW_CARD = {
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 18,
  elevation: 3,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  greeting: {
    fontSize: 26,
    letterSpacing: -0.4,
  },
  questStrip: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textAlign: 'center',
  },
  highlightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    ...SHADOW_CARD,
  },
  highlightImageWrap: {
    position: 'relative',
  },
  highlightImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primarySoft,
  },
  highlightImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  highlightBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(44, 26, 20, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  highlightBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.12,
    textTransform: 'uppercase',
  },
  highlightBody: {
    padding: 18,
    gap: 10,
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  highlightDesc: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  highlightActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exploreThumb: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    overflow: 'hidden',
    ...SHADOW_CARD,
  },
  exploreThumbImg: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  exploreThumbBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeCategory: {
    backgroundColor: 'rgba(253, 251, 247, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  badgeCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  badgeXP: {
    backgroundColor: 'rgba(44, 26, 20, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeXPText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fef3c7',
    letterSpacing: 0.3,
  },
  exploreThumbBody: {
    padding: 12,
    gap: 4,
  },
  exploreThumbLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  exploreThumbMeta: {
    fontSize: 11,
  },
  topicsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  topicsRow: {
    gap: 8,
    paddingRight: 20,
    alignItems: 'center',
  },
  kwibukaCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF7',
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.22)',
    ...SHADOW_CARD,
  },
  kwibukaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  kwibukaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 20,
  },
  kwibukaCountdown: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  kwibukaDaysNum: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 36,
  },
  kwibukaDaysLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 10,
    borderRadius: 12,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  activityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  footerQuote: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  footerQuoteText: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,26,20,0.40)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 20,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.6)',
    maxHeight: '85%',
  },
  modalKicker: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  modalSub: {
    textAlign: 'center',
    marginBottom: 4,
  },
  typeRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeRowActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(141,73,58,0.10)',
    borderWidth: 2,
  },
  typeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: { fontWeight: '800', color: colors.textPrimary, fontSize: 14 },
  typeSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  typeRadio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
  },
});