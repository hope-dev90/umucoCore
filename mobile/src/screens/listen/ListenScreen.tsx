import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { useLanguage } from '../../context/LanguageContext';
import { assetUrl } from '../../services/api';
import { getAudio } from '../../services/audioService';
import { getProverbs } from '../../services/proverbService';
import { saveItem } from '../../services/savedService';
import { colors } from '../../theme/colors';
import type { AudioItem, Proverb } from '../../types';

export default function ListenScreen() {
  const { t } = useLanguage();
  const [audio, setAudio] = useState<AudioItem[]>([]);
  const [proverbs, setProverbs] = useState<Proverb[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        getAudio().catch(() => []),
        getProverbs().catch(() => []),
      ]);
      setAudio(a);
      setProverbs(p);
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      try {
        player.pause();
      } catch {
        // ignore
      }
      try {
        player.release();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    setPlayingId(null);
  }, []);

  useEffect(() => {
    load();
    return () => {
      stop();
    };
  }, [load, stop]);

  const play = async (track: AudioItem) => {
    const raw = track.audioUrl || track.audio_url;
    const url = assetUrl(raw ? String(raw) : null);
    if (!url) {
      Alert.alert('Unavailable', 'No audio file for this track yet.');
      return;
    }
    try {
      stop();
      await setAudioModeAsync({ playsInSilentMode: true });
      const player = createAudioPlayer(url);
      playerRef.current = player;
      player.play();
      setPlayingId(String(track.id));

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          subscription.remove();
        }
      });
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Playback failed');
      setPlayingId(null);
    }
  };

  const onSave = async (track: AudioItem) => {
    try {
      setSavingId(String(track.id));
      await saveItem({
        itemType: 'audio',
        itemId: track.id,
        itemTitle: track.title,
        itemSubtitle: track.narrator || '',
        itemImage: String(track.image || ''),
        itemMeta: {
          duration: track.duration,
          audioUrl: track.audioUrl || track.audio_url,
        },
      });
      Alert.alert(t('listen.saved'), track.title);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filteredAudio = q
    ? audio.filter((a) =>
        [a.title, a.narrator, a.description, a.genre]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    : audio;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('listen.title')}</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search audio…" />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredAudio}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 16 }}>
              <Text style={styles.section}>{t('listen.audio')}</Text>
              {filteredAudio.length === 0 ? <EmptyState title="No audio found" /> : null}
            </View>
          }
          ListFooterComponent={
            <View style={{ marginTop: 20, gap: 10 }}>
              <Text style={styles.section}>{t('listen.proverbs')}</Text>
              {proverbs.slice(0, 12).map((p) => (
                <View key={String(p.id)} style={styles.proverb}>
                  <Text style={styles.proverbText}>
                    {p.text || p.proverb || String(p.content || '')}
                  </Text>
                  {p.meaning || p.translation ? (
                    <Text style={styles.proverbMeaning}>
                      {String(p.meaning || p.translation)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          }
          renderItem={({ item }) => {
            const isPlaying = playingId === String(item.id);
            return (
              <View style={styles.track}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackTitle}>{item.title}</Text>
                  <Text style={styles.trackMeta}>
                    {item.narrator || item.genre || item.category || 'Audio'}
                  </Text>
                </View>
                <Pressable
                  style={styles.btn}
                  onPress={() => (isPlaying ? stop() : play(item))}
                >
                  <Text style={styles.btnText}>
                    {isPlaying ? t('listen.pause') : t('listen.play')}
                  </Text>
                </Pressable>
                <Pressable style={styles.btnSecondary} onPress={() => onSave(item)}>
                  <Text style={styles.btnSecondaryText}>
                    {savingId === String(item.id) ? '…' : t('listen.save')}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 48 },
  section: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  trackTitle: { fontWeight: '700', color: colors.textPrimary },
  trackMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  btnSecondary: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnSecondaryText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  proverb: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  proverbText: { fontWeight: '700', color: colors.textPrimary, fontStyle: 'italic' },
  proverbMeaning: { marginTop: 6, color: colors.textSecondary, fontSize: 13 },
});
