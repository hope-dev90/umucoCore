import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Button, Card } from '../../components/ui';
import { HeritageCard } from '../../components/HeritageCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { getHeritage } from '../../services/heritageService';
import { getFeaturedAudio } from '../../services/audioService';
import { getHistory, trackView } from '../../services/historyService';
import { updateExplorerType } from '../../services/userService';
import { colors } from '../../theme/colors';
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

/** Dashboard Home — RN equivalent of frontend Home.jsx (not marketing landing). */
export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { xp, level, streak, awardXP } = useGamification();
  const navigation = useNavigation<any>();

  const explorerType = user?.explorerType || user?.explorer_type || '';
  const [showPicker, setShowPicker] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [savingType, setSavingType] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [highlight, setHighlight] = useState<HeritageItem | null>(null);
  const [audioHighlight, setAudioHighlight] = useState<AudioItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const category = EXPLORER_CATEGORY[String(explorerType)] || undefined;

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

  const questTiles = useMemo(
    () => [
      { label: t('home.level'), value: String(level) },
      { label: t('home.streak'), value: String(streak) },
      { label: t('home.xp'), value: String(xp) },
    ],
    [t, level, streak, xp]
  );

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Text style={styles.greeting}>
        {t('home.greeting', { name: user?.name || 'explorer' })}
      </Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      <View style={styles.questStrip}>
        {questTiles.map((tile) => (
          <View key={tile.label} style={styles.questTile}>
            <Text style={styles.questValue}>{tile.value}</Text>
            <Text style={styles.questLabel}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.links}>
        {(
          [
            { label: t('tabs.explore'), tab: 'Explore' },
            { label: t('tabs.listen'), tab: 'Listen' },
            { label: t('sidebar.kwibuka') || 'Kwibuka', more: 'Kwibuka' },
            { label: t('sidebar.contribute') || 'Contribute', more: 'Contribute' },
            { label: t('sidebar.saved') || 'Saved', more: 'Saved' },
            { label: t('sidebar.videos') || 'Videos', more: 'Videos' },
          ] as const
        ).map((link) => (
          <Pressable
            key={link.label}
            style={styles.linkChip}
            onPress={() => {
              if ('tab' in link) navigation.navigate(link.tab);
              else navigation.navigate('More', { screen: link.more });
            }}
          >
            <Text style={styles.linkText}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      {highlight ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.highlight')}</Text>
          <HeritageCard item={highlight} onPress={openHighlight} />
          <View style={styles.row}>
            <Button label={t('explore.discoverMore')} onPress={openHighlight} />
            <Button label={t('common.save')} variant="secondary" onPress={shareHighlight} />
          </View>
        </View>
      ) : null}

      {audioHighlight ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('listen.audio')}</Text>
          <Card>
            <Text style={styles.cardTitle}>{audioHighlight.title}</Text>
            <Text style={styles.cardMeta} numberOfLines={3}>
              {String(audioHighlight.description || '')}
            </Text>
            <Button
              label={t('tabs.listen')}
              variant="secondary"
              onPress={() => navigation.navigate('Listen')}
            />
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
        {history.length === 0 ? (
          <Card>
            <Text style={styles.empty}>{t('history.empty')}</Text>
          </Card>
        ) : (
          history.map((item) => (
            <Card key={String(item.id)} style={styles.historyCard}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.type || 'Item'}
                {item.viewedAt ? ` · ${new Date(item.viewedAt).toLocaleDateString()}` : ''}
              </Text>
            </Card>
          ))
        )}
      </View>

      <Pressable
        style={styles.kwibukaCard}
        onPress={() => navigation.navigate('More', { screen: 'Kwibuka' })}
      >
        <Text style={styles.kwibukaTitle}>{t('sidebar.kwibuka') || 'Kwibuka'}</Text>
        <Text style={styles.kwibukaSub}>{t('kwibuka.subtitle')}</Text>
      </Pressable>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>{t('explorerPicker.kicker')}</Text>
            <Text style={styles.modalTitle}>{t('explorerPicker.title')}</Text>
            <Text style={styles.modalSub}>{t('explorerPicker.subtitle')}</Text>
            {EXPLORER_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[styles.typeRow, active && styles.typeRowActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeTitle}>{t(`explorer.${type}.label`)}</Text>
                    <Text style={styles.typeSub}>{t(`explorer.${type}.tagline`)}</Text>
                  </View>
                </Pressable>
              );
            })}
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

const styles = StyleSheet.create({
  greeting: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginBottom: 8 },
  questStrip: { flexDirection: 'row', gap: 10 },
  questTile: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  questValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  questLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkChip: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  linkText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  row: { flexDirection: 'row', gap: 8 },
  cardTitle: { fontWeight: '800', color: colors.textPrimary, fontSize: 15 },
  cardMeta: { color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: 8 },
  historyCard: { marginBottom: 0 },
  kwibukaCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 18,
    gap: 4,
  },
  kwibukaTitle: { color: colors.white, fontWeight: '800', fontSize: 18 },
  kwibukaSub: { color: colors.primarySoft },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,26,20,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.bgMain,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalKicker: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSub: { color: colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  typeRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.bgCard,
  },
  typeRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
  },
  typeTitle: { fontWeight: '800', color: colors.textPrimary },
  typeSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
