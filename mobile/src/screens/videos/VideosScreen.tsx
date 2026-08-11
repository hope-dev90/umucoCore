import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { getVideos } from '../../services/videoService';
import { saveItem } from '../../services/savedService';
import { colors } from '../../theme/colors';
import type { VideoItem } from '../../types';

export default function VideosScreen() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVideos(await getVideos());
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openVideo = async (video: VideoItem) => {
    if (!video.video_url) {
      Alert.alert('Unavailable', 'No video file available for this item yet.');
      return;
    }
    await Linking.openURL(String(video.video_url));
  };

  const onSave = async (video: VideoItem) => {
    try {
      await saveItem({
        itemType: 'video',
        itemId: video.id,
        itemTitle: video.title,
        itemSubtitle: video.description || video.category || '',
        itemImage: String(video.thumbnail_url || ''),
        itemMeta: { videoUrl: video.video_url, duration: video.duration },
      });
      Alert.alert('Saved', video.title);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('videos.title')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title={t('videos.empty')} actionLabel={t('common.retry')} onAction={load} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.thumbnail_url ? (
                <Image source={{ uri: String(item.thumbnail_url) }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.fallback]}>
                  <Text style={styles.fallbackText}>Video</Text>
                </View>
              )}
              <View style={styles.body}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {item.description || item.category || 'Video'}
                </Text>
                <View style={styles.row}>
                  <Pressable style={styles.btn} onPress={() => openVideo(item)}>
                    <Text style={styles.btnText}>Watch</Text>
                  </Pressable>
                  <Pressable style={styles.btnSecondary} onPress={() => onSave(item)}>
                    <Text style={styles.btnSecondaryText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumb: { width: '100%', height: 160, backgroundColor: colors.primarySoft },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: colors.primary, fontWeight: '800' },
  body: { padding: 14, gap: 6 },
  cardTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  meta: { color: colors.textSecondary, fontSize: 13 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  btnSecondary: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnSecondaryText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
