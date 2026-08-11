import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeritageCard } from '../../components/HeritageCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { getHeritage } from '../../services/heritageService';
import { saveItem } from '../../services/savedService';
import { trackView } from '../../services/historyService';
import exploreStories from '../../data/explore-stories.json';
import { localizeField } from '../../utils/localization';
import { colors } from '../../theme/colors';
import type { HeritageItem } from '../../types';

type Mode = 'list' | 'map';

function normalizeStory(raw: Record<string, unknown>, index: number, language: 'en' | 'rw' | 'fr'): HeritageItem {
  const title = localizeField(raw.title as string | Record<string, string>, language, `Story ${index + 1}`);
  const description = localizeField(
    (raw.desc || raw.description) as string | Record<string, string>,
    language
  );
  const location = localizeField(raw.location as string | Record<string, string>, language);
  const category = localizeField(raw.category as string | Record<string, string>, language, String(raw.catKey || 'heritage'));
  return {
    id: (raw.id as string | number) || `story-${index}`,
    title,
    description,
    category,
    location,
    lat: typeof raw.lat === 'number' ? raw.lat : Number(raw.lat) || null,
    lng: typeof raw.lng === 'number' ? raw.lng : Number(raw.lng) || null,
    image: typeof raw.image === 'string' ? raw.image : undefined,
    image_url: typeof raw.image === 'string' ? raw.image : undefined,
  };
}

/** Explore — RN equivalent of frontend Explore.jsx (list + map). */
export default function ExploreScreen() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('list');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHeritage();
      if (data.length > 0) {
        setItems(data);
      } else {
        const stories = (exploreStories as unknown as Record<string, unknown>[]).map((s, i) =>
          normalizeStory(s, i, language)
        );
        setItems(stories);
      }
    } catch {
      const stories = (Array.isArray(exploreStories) ? exploreStories : []) as Record<string, unknown>[];
      if (stories.length) {
        setItems(stories.map((s, i) => normalizeStory(s, i, language)));
        setError('');
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [t, language]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.description, item.category, item.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const mappable = useMemo(
    () =>
      filtered.filter(
        (item) =>
          item.lat != null &&
          item.lng != null &&
          Number.isFinite(Number(item.lat)) &&
          Number.isFinite(Number(item.lng))
      ),
    [filtered]
  );

  const onSave = async (item: HeritageItem) => {
    try {
      await saveItem({
        itemType: 'heritage',
        itemId: item.id,
        itemTitle: item.title,
        itemSubtitle: item.category || '',
        itemImage: String(item.image_url || item.image || ''),
        itemMeta: { category: item.category, description: item.description },
      });
      setSavedIds((prev) => new Set(prev).add(String(item.id)));
      Alert.alert(t('saved.title'), t('listen.saved'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('explore.title')}</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('explore.search')} />
        <View style={styles.modeRow}>
          <Chip label={t('explore.places')} active={mode === 'list'} onPress={() => setMode('list')} />
          <Chip label={t('explore.map')} active={mode === 'map'} onPress={() => setMode('map')} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <EmptyState title={t('common.error')} message={error} actionLabel={t('common.retry')} onAction={load} />
      ) : mode === 'map' ? (
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: -1.94,
              longitude: 29.87,
              latitudeDelta: 1.8,
              longitudeDelta: 1.8,
            }}
          >
            {mappable.map((item) => (
              <Marker
                key={String(item.id)}
                coordinate={{ latitude: Number(item.lat), longitude: Number(item.lng) }}
                title={item.title}
                description={item.location || item.category}
                pinColor={colors.primary}
                onCalloutPress={() =>
                  trackView({
                    type: 'Place',
                    itemId: item.id,
                    title: item.title,
                    image: String(item.image_url || ''),
                    category: item.category,
                  })
                }
              />
            ))}
          </MapView>
          {mappable.length === 0 ? (
            <Text style={styles.mapEmpty}>{t('explore.empty')}</Text>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title={t('explore.empty')} />}
          renderItem={({ item }) => (
            <HeritageCard
              item={item}
              saved={savedIds.has(String(item.id))}
              onSave={() => onSave(item)}
              onPress={() =>
                trackView({
                  type: 'Place',
                  itemId: item.id,
                  title: item.title,
                  image: String(item.image_url || ''),
                  category: item.category,
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  modeRow: { flexDirection: 'row', gap: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  mapWrap: { flex: 1, margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  mapEmpty: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: colors.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    color: colors.textMuted,
    overflow: 'hidden',
  },
});
