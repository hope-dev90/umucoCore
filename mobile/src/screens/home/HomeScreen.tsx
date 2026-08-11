import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Card, Subtitle, Title } from '../../components/ui';
import { HeritageCard } from '../../components/HeritageCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getHeritage } from '../../services/heritageService';
import { getHistory } from '../../services/historyService';
import { dailyLogin, fetchXP } from '../../services/gamificationService';
import { colors } from '../../theme/colors';
import type { HeritageItem, HistoryItem } from '../../types';

const EXPLORER_CATEGORY: Record<string, string> = {
  warrior: 'warrior',
  'nature-lover': 'nature',
  'royal-historian': 'royal',
  'folktale-hunter': 'folklore',
  'music-explorer': 'music',
};

const QUICK_LINKS = [
  { label: 'Explore', tab: 'Explore' },
  { label: 'Listen', tab: 'Listen' },
  { label: 'Kwibuka', more: 'Kwibuka' },
  { label: 'Contribute', more: 'Contribute' },
  { label: 'Saved', more: 'Saved' },
  { label: 'Videos', more: 'Videos' },
] as const;

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [xp, setXp] = useState(user?.xp || 0);
  const [level, setLevel] = useState(user?.level || 1);
  const [streak, setStreak] = useState(user?.currentStreak || 0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [highlight, setHighlight] = useState<HeritageItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const explorerType = user?.explorerType || user?.explorer_type || '';
  const category = EXPLORER_CATEGORY[String(explorerType)] || undefined;

  const load = useCallback(async () => {
    const [xpData, hist, heritage] = await Promise.all([
      fetchXP(),
      getHistory(5).catch(() => []),
      getHeritage(category).catch(() => []),
      dailyLogin().catch(() => null),
    ]);
    if (xpData) {
      setXp(xpData.xp ?? 0);
      setLevel(xpData.level ?? 1);
      setStreak(xpData.currentStreak ?? xpData.current_streak ?? 0);
    }
    setHistory(hist);
    setHighlight(heritage[0] || null);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const goQuick = (link: (typeof QUICK_LINKS)[number]) => {
    if ('tab' in link) {
      navigation.navigate(link.tab);
      return;
    }
    navigation.navigate('More', { screen: link.more });
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={[styles.questPill, { backgroundColor: colors.primarySoft }]}>
              <Text style={styles.questPillText}>🧭</Text>
              <Text style={[styles.questPillLabel, { color: colors.primaryDark }]}>Begin your journey</Text>
            </View>

            <Title style={styles.heroTitle}>
              Discover Rwanda's <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>Heritage</Text>
            </Title>

            <Subtitle style={styles.heroSubtitle}>
              Explore oral stories, cultural traditions, and historical treasures passed down through generations.
            </Subtitle>

            <View style={styles.heroActions}>
              <Pressable
                onPress={() => navigation.navigate('More', { screen: 'Contribute' })}
                style={[styles.heroButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.heroButtonText, { color: colors.white }]}>Get Involved</Text>
                <Text style={[styles.heroButtonArrow, { color: colors.white }]}>→</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Explore')}
                style={[styles.heroButtonSecondary, { borderColor: colors.primary }]}
              >
                <Text style={[styles.heroButtonSecondaryText, { color: colors.primary }]}>Explore More</Text>
              </Pressable>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>200+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Oral Stories</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>3</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Language Modules</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>24/7</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>AI Assistant</Text>
              </View>
            </View>

            {/* Quest Progress */}
            <View style={styles.questProgress}>
              <View style={styles.questStep}>
                <View style={[styles.questStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.questStepNumberText, { color: colors.white }]}>01</Text>
                </View>
                <Text style={[styles.questStepLabel, { color: colors.textPrimary }]}>Pick a story</Text>
              </View>
              <View style={styles.questStep}>
                <View style={[styles.questStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.questStepNumberText, { color: colors.white }]}>02</Text>
                </View>
                <Text style={[styles.questStepLabel, { color: colors.textPrimary }]}>Learn & explore</Text>
              </View>
              <View style={styles.questStep}>
                <View style={[styles.questStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.questStepNumberText, { color: colors.white }]}>03</Text>
                </View>
                <Text style={[styles.questStepLabel, { color: colors.textPrimary }]}>Earn rewards</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Links</Text>
          <View style={styles.links}>
            {QUICK_LINKS.map((link) => (
              <Pressable key={link.label} style={[styles.linkChip, { backgroundColor: colors.primary }]} onPress={() => goQuick(link)}>
                <Text style={[styles.linkText, { color: colors.white }]}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Highlight */}
        {highlight ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured</Text>
            <HeritageCard item={highlight} />
          </View>
        ) : null}

        {/* Recent */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent</Text>
          {history.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent activity yet.</Text>
            </Card>
          ) : (
            history.map((item) => (
              <Card key={String(item.id)} style={styles.historyCard}>
                <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.historyMeta, { color: colors.textMuted }]}>
                  {item.type || 'Item'}
                  {item.viewedAt ? ` · ${new Date(item.viewedAt).toLocaleDateString()}` : ''}
                </Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: colors.bgMain,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroTop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  questPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  questPillText: {
    fontSize: 16,
  },
  questPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 42,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    minWidth: 160,
    justifyContent: 'center',
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroButtonArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroButtonSecondary: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  questProgress: {
    flexDirection: 'row',
    gap: 16,
  },
  questStep: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  questStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questStepNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  questStepLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  linkChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  linkText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  historyCard: {
    marginBottom: 10,
  },
  historyTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
  },
});