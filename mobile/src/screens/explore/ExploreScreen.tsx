import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HeritageCard } from '../../components/HeritageCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import {
  Button,
  Card,
  Chip,
  KickerLabel,
  Row,
} from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { getHeritage } from '../../services/heritageService';
import { saveItem } from '../../services/savedService';
import { trackView } from '../../services/historyService';
import exploreStories from '../../data/explore-stories.json';
import { localizeField } from '../../utils/localization';
import { colors } from '../../theme/colors';
import type { HeritageItem } from '../../types';

type Mode = 'list' | 'map';

const EXPLORER_CATKEY_MAP: Record<string, string[]> = {
  warrior: ['performance', 'history'],
  'nature-lover': ['wildlife', 'lakes'],
  'royal-historian': ['architecture', 'history'],
  'folktale-hunter': ['culture', 'crafts', 'art'],
  'music-explorer': ['artifacts'],
};

function normalizeStory(raw: Record<string, unknown>, index: number, language: 'en' | 'rw' | 'fr'): HeritageItem & { catKey?: string; era?: string; locationKey?: string } {
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
    catKey: typeof raw.catKey === 'string' ? raw.catKey : undefined,
    era: typeof raw.era === 'string' ? raw.era : undefined,
    locationKey: typeof raw.locationKey === 'string' ? raw.locationKey : undefined,
  };
}

export default function ExploreScreen() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { awardXP, trackActivity } = useGamification();
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('list');
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<HeritageItem | null>(null);

  const [activeRegion, setActiveRegion] = useState('all');
  const [activePlace, setActivePlace] = useState('all');
  const [activeEras, setActiveEras] = useState<string[]>([]);

  const explorerType = (user?.explorerType || user?.explorer_type || '') as string;

  const regions = useMemo(() => [
    { value: 'all', label: t('explore.allRegions') },
    { value: 'north', label: t('explore.north') },
    { value: 'south', label: t('explore.south') },
    { value: 'east', label: t('explore.east') },
    { value: 'west', label: t('explore.west') },
    { value: 'kigali', label: t('explore.kigali') },
  ], [t]);

  const REGION_LOCATION_MAP = useMemo<Record<string, string[]>>(() => ({
    north: ['Musanze', 'Rubavu'],
    south: ['Nyanza', 'Gitarama', 'Rusizi'],
    east: ['Kibungo', 'Kayonza'],
    west: ['Rubavu', 'Rusizi'],
    kigali: ['Kigali'],
  }), []);

  const ERA_KEY_MAP = useMemo<Record<string, string>>(() => ({
    [t('explore.preColonial')]: 'pre-colonial',
    [t('explore.colonial')]: 'colonial',
    [t('explore.post1994')]: 'post-1994',
  }), [t]);

  const eras = useMemo(() => [
    t('explore.preColonial'),
    t('explore.colonial'),
    t('explore.post1994'),
  ], [t]);

  const places = useMemo(() => [
    { value: 'all', label: t('explore.allPlaces') },
    { value: 'Nyanza', label: t('explore.nyanza') },
    { value: 'Musanze', label: t('explore.musanze') },
    { value: 'Kibungo', label: t('explore.kibungo') },
    { value: 'Gitarama', label: t('explore.gitarama') },
    { value: 'Rubavu', label: t('explore.rubavu') },
    { value: 'Rusizi', label: t('explore.rusizi') },
    { value: 'Kayonza', label: t('explore.kayonza') },
    { value: 'Kigali', label: t('explore.kigali') },
  ], [t]);

  const visiblePlaces = useMemo(() => {
    if (activeRegion === 'all') return places;
    const allowedKeys = REGION_LOCATION_MAP[activeRegion] || [];
    return places.filter((p) => p.value === 'all' || allowedKeys.includes(p.value));
  }, [activeRegion, REGION_LOCATION_MAP, places]);

  const hasActiveFilters = useMemo(() => (
    activeRegion !== 'all' ||
    activePlace !== 'all' ||
    activeEras.length > 0 ||
    query.trim() !== ''
  ), [activeRegion, activePlace, activeEras, query]);

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

  const handleRegionChange = useCallback((region: string) => {
    setActiveRegion(region);
    setActivePlace('all');
  }, []);

  const toggleEra = useCallback((era: string) => {
    setActiveEras((prev) =>
      prev.includes(era) ? prev.filter((e) => e !== era) : [...prev, era]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveRegion('all');
    setActivePlace('all');
    setActiveEras([]);
    setQuery('');
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item: any) => {
      const regionMatch = activeRegion === 'all' ||
        (REGION_LOCATION_MAP[activeRegion] || []).includes(item.locationKey);
      const eraMatch = activeEras.length === 0 ||
        activeEras.some((era) => ERA_KEY_MAP[era] === item.era);
      const placeMatch = activePlace === 'all' ||
        String(item.locationKey || '').toLowerCase() === activePlace.toLowerCase();
      const searchMatch = !q ||
        [item.title, item.description, item.category, item.location]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return regionMatch && eraMatch && placeMatch && searchMatch;
    });
  }, [items, query, activeRegion, activePlace, activeEras, REGION_LOCATION_MAP, ERA_KEY_MAP]);

  const sortedItems = useMemo(() => {
    const matchCatKeys = EXPLORER_CATKEY_MAP[explorerType] || [];
    return [...filtered].sort((a: any, b: any) => {
      const aCompleted = completedIds.has(String(a.id));
      const bCompleted = completedIds.has(String(b.id));
      if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
      const aMatch = matchCatKeys.includes(a.catKey) ? 0 : 1;
      const bMatch = matchCatKeys.includes(b.catKey) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return 0;
    });
  }, [filtered, explorerType, completedIds]);

  const mappable = useMemo(
    () =>
      sortedItems.filter(
        (item: any) =>
          item.lat != null &&
          item.lng != null &&
          Number.isFinite(Number(item.lat)) &&
          Number.isFinite(Number(item.lng))
      ),
    [sortedItems]
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

  const handleMapPress = useCallback((item: HeritageItem) => {
    setMode('map');
    setMapVisible(true);
    if (item.lat != null && item.lng != null) {
      setSelectedMarker(item);
    }
  }, []);

  const handleReadMore = useCallback(async (item: HeritageItem) => {
    const stableId = String(item.id);
    if (!completedIds.has(stableId)) {
      setCompletedIds((prev) => new Set(prev).add(stableId));
      try {
        await Promise.all([
          awardXP(25, 'story'),
          trackActivity('story', stableId),
        ]);
      } catch {
      }
    }
    await trackView({
      type: 'Article',
      itemId: item.id,
      title: item.title,
      image: String(item.image_url || item.image || ''),
      category: item.category || '',
      location: item.location || '',
    });
  }, [completedIds, awardXP]);

  const renderFilterSection = (label: string, content: React.ReactNode, isLast = false) => (
    <View style={[styles.filterRow, !isLast && styles.filterRowDivider]}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterChipsWrap}>{content}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.headerWrap}>
          <View style={styles.exploreHeader}>
            <View style={{ flex: 1 }}>
              <KickerLabel>{t('sidebar.explore')}</KickerLabel>
              <Text style={styles.pageTitle}>{t('explore.title')}</Text>
            </View>
            <Button
              label={t('explore.map')}
              variant="primary"
              leftIcon="map-outline"
              onPress={() => {
                setMapVisible(true);
                setMode('map');
              }}
              style={styles.mapCtaBtn}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <SearchBar value={query} onChangeText={setQuery} placeholder={t('explore.search')} />
          </View>

          <View style={styles.modeRow}>
            <Chip
              label={t('explore.places')}
              active={mode === 'list'}
              onPress={() => { setMode('list'); }}
            />
            <Chip
              label={t('explore.map')}
              active={mode === 'map'}
              onPress={() => { setMode('map'); setMapVisible(true); }}
            />
          </View>
        </View>

        <View style={styles.filterBar}>
          {renderFilterSection(
            t('explore.regions'),
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
              {regions.map((region) => (
                <Chip
                  key={region.value}
                  label={region.label}
                  active={activeRegion === region.value}
                  onPress={() => handleRegionChange(region.value)}
                />
              ))}
            </ScrollView>
          )}
          {renderFilterSection(
            t('explore.places'),
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
              {visiblePlaces.map((place) => (
                <Chip
                  key={place.value}
                  label={place.label}
                  active={activePlace === place.value}
                  onPress={() => setActivePlace(place.value)}
                />
              ))}
            </ScrollView>
          )}
          {renderFilterSection(
            t('explore.eras'),
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
              {eras.map((era) => (
                <Chip
                  key={era}
                  label={era}
                  active={activeEras.includes(era)}
                  onPress={() => toggleEra(era)}
                />
              ))}
            </ScrollView>,
            true
          )}
          {hasActiveFilters ? (
            <Pressable
              onPress={clearAllFilters}
              style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="close" size={13} color={colors.primary} />
              <Text style={styles.clearBtnText}>{t('explore.clearFilters') || 'Clear filters'}</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
          <EmptyState title={t('common.error')} message={error} actionLabel={t('common.retry')} onAction={load} />
        ) : mode === 'map' || mapVisible ? (
          <View style={styles.mapSection}>
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
                region={selectedMarker && selectedMarker.lat != null && selectedMarker.lng != null ? {
                  latitude: Number(selectedMarker.lat),
                  longitude: Number(selectedMarker.lng),
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                } : undefined}
              >
                {mappable.map((item: any) => (
                  <Marker
                    key={String(item.id)}
                    coordinate={{ latitude: Number(item.lat), longitude: Number(item.lng) }}
                    title={item.title}
                    description={item.location || item.category}
                    pinColor={colors.primary}
                    onPress={() => setSelectedMarker(item)}
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
            <Pressable
              style={({ pressed }) => [styles.discoverBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => {
                setMapVisible(!mapVisible);
                setMode(mapVisible ? 'list' : 'map');
              }}
            >
              <Text style={styles.discoverBtnText}>
                {mapVisible ? (t('explore.hideMap') || 'Hide map') : t('explore.map')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.primary}
                style={{ transform: [{ rotate: mapVisible ? '180deg' : '0deg' }] }}
              />
            </Pressable>
          </View>
        ) : null}

        {mode === 'list' && !mapVisible ? (
          sortedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="search" size={56} color={colors.primary} style={{ opacity: 0.35 }} />
              </View>
              <Text style={styles.emptyTitle}>
                {t('explore.noResultsTitle') || 'No heritage sites match your search.'}
              </Text>
              <Text style={styles.emptyDesc}>
                {t('explore.noResultsDescLine1') || "We couldn't find any results for the selected filters."}
                {'\n'}
                {t('explore.noResultsDescLine2') || "Try adjusting your filters or explore other stories."}
              </Text>
              <Button
                label={t('explore.clearFilters') || 'Clear filters'}
                variant="outline"
                leftIcon="refresh"
                onPress={clearAllFilters}
              />
            </View>
          ) : (
            <View style={styles.listContainer}>
              {sortedItems.map((item, index) => (
                <HeritageCard
                  key={`${String(item.id)}-${index}`}
                  item={item}
                  saved={savedIds.has(String(item.id))}
                  onSave={() => onSave(item)}
                  completed={completedIds.has(String(item.id))}
                  xp={25}
                  onMap={() => handleMapPress(item)}
                  onReadMore={() => handleReadMore(item)}
                  onPress={() => handleReadMore(item)}
                  variant="explore"
                />
              ))}
            </View>
          )
        ) : null}

        {mode === 'list' && !mapVisible ? (
          <Pressable
            style={({ pressed }) => [styles.discoverBtn, { marginTop: 4, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => { setMapVisible(true); setMode('map'); }}
          >
            <Text style={styles.discoverBtnText}>{t('explore.map')}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </Pressable>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  scrollContent: { paddingBottom: 20 },
  headerWrap: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bgMain },
  exploreHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.16)',
    borderRadius: 16,
    backgroundColor: '#FFFAF4',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 32,
  },
  mapCtaBtn: {
    minHeight: 38,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterBar: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  filterRow: {
    gap: 10,
  },
  filterRowDivider: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141, 73, 58, 0.10)',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#7A675C',
    marginBottom: 8,
    paddingTop: 0,
  },
  filterChipsWrap: { minHeight: 0 },
  filterChips: {
    gap: 8,
    paddingBottom: 2,
  },
  clearBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 2,
  },
  emptyState: {
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(141, 73, 58, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  mapSection: {
    paddingHorizontal: 20,
  },
  mapWrap: {
    height: 420,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.16)',
    backgroundColor: colors.bgCard,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
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
    fontSize: 12,
    fontWeight: '700',
  },
  discoverBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.20)',
    backgroundColor: '#FFF8EF',
  },
  discoverBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },
});
