import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import artifactsData from '../../data/artifacts.json';
import museumGallery from '../../data/museumGallery.json';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { getHeritage } from '../../services/heritageService';
import { getSaved, saveItem } from '../../services/savedService';
import { trackView } from '../../services/historyService';
import { fetchUserActivityItems } from '../../services/gamificationService';
import { colors } from '../../theme/colors';
import type { HeritageItem } from '../../types';

type CollectionCard = {
  id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  images?: string[];
  source: 'artifact' | 'heritage' | 'featured';
  numericId?: number | string;
};

type MuseumItem = {
  id?: string;
  artifact?: string;
  title?: string;
  category?: string;
  image?: string;
  src?: string;
  url?: string;
};

function slugToNumericId(slug: string): number {
  return slug.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);
}

export default function CollectionsScreen() {
  const { t } = useLanguage();
  const { awardXP } = useGamification();
  const [heritage, setHeritage] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [sort, setSort] = useState<'default' | 'viewed' | 'az'>('default');

  const museumItems = useMemo(() => {
    const raw = museumGallery as unknown;
    if (Array.isArray(raw)) return raw as MuseumItem[];
    if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
      return (raw as { items: MuseumItem[] }).items;
    }
    if (raw && typeof raw === 'object' && Array.isArray((raw as { gallery?: unknown }).gallery)) {
      return (raw as { gallery: MuseumItem[] }).gallery;
    }
    return [];
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, saved, viewedIds] = await Promise.all([
        getHeritage().catch(() => []),
        getSaved().catch(() => ({ items: [] })),
        fetchUserActivityItems('collection').catch(() => []),
      ]);
      setHeritage(h);
      setViewed(new Set(viewedIds));
      const slugs = new Set(
        (saved.items || [])
          .filter((i) => i.item_type?.toLowerCase() === 'collection' || i.item_type === 'heritage')
          .map((i) => String((i.item_meta as { slug?: string } | undefined)?.slug || i.item_id))
      );
      setSavedSlugs(slugs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const all = useMemo<CollectionCard[]>(() => {
    const featured: CollectionCard[] = [
      {
        id: 'museum-gallery',
        title: t('collections.museumGallery') || 'Museum Gallery',
        category: 'Museum',
        description: t('collections.museumGalleryDesc') || 'Browse curated artifacts from the archive.',
        image: museumItems[0]?.url || museumItems[0]?.image || museumItems[0]?.src,
        source: 'featured',
      },
    ];

    const artifactCards: CollectionCard[] = (
      (
        artifactsData as {
          collections?: Array<{
            id: string;
            title: string;
            category: string;
            description: string;
            images?: string[];
          }>;
        }
      ).collections || []
    ).map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      description: a.description,
      image: a.images?.[0],
      images: a.images,
      source: 'artifact' as const,
      numericId: slugToNumericId(a.id),
    }));

    const heritageCards: CollectionCard[] = heritage.map((h) => ({
      id: `heritage-${h.id}`,
      title: h.title,
      category: h.category || 'Heritage',
      description: String(h.description || ''),
      image: String(h.image_url || h.image || ''),
      source: 'heritage' as const,
      numericId: h.id,
    }));

    return [...featured, ...artifactCards, ...heritageCards];
  }, [heritage, museumItems, t]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(all.map((c) => c.category).filter(Boolean)))],
    [all]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((c) => {
      const catOk = category === 'all' || c.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [c.title, c.category, c.description].some((v) => v.toLowerCase().includes(q));
    });
    if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'viewed') {
      list = [...list].sort((a, b) => Number(viewed.has(b.id)) - Number(viewed.has(a.id)));
    }
    return list;
  }, [all, category, query, sort, viewed]);

  const onSave = async (c: CollectionCard) => {
    try {
      await saveItem({
        itemType: c.source === 'artifact' || c.source === 'featured' ? 'Collection' : 'heritage',
        itemId: c.numericId ?? c.id,
        itemTitle: c.title,
        itemSubtitle: c.category,
        itemImage: c.image || '',
        itemMeta: { category: c.category, description: c.description, slug: c.id },
      });
      setSavedSlugs((prev) => new Set(prev).add(c.id));
      Alert.alert(t('saved.title'), c.title);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    }
  };

  const openMuseum = async () => {
    setGalleryIndex(0);
    setGalleryOpen(true);
  };

  const onMuseumNavigate = async (index: number) => {
    setGalleryIndex(index);
    const item = museumItems[index];
    if (!item) return;
    const title = item.artifact || item.title || `Artifact ${index + 1}`;
    await trackView({ type: 'Collection', title, category: item.category || 'Museum' });
    await awardXP(10, `Viewed museum artifact: ${title}`);
    setViewed((prev) => new Set(prev).add(`museum-${title}`));
  };

  const currentMuseum = museumItems[galleryIndex];
  const museumImage = currentMuseum?.url || currentMuseum?.image || currentMuseum?.src;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('collections.title')}</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('collections.searchPlaceholder') || t('explore.search')}
        />
        <View style={styles.chips}>
          {categories.slice(0, 10).map((cat) => (
            <Chip
              key={cat}
              label={cat === 'all' ? t('explore.allPlaces') : cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>
        <View style={styles.chips}>
          <Chip label="A–Z" active={sort === 'az'} onPress={() => setSort('az')} />
          <Chip
            label={t('history.title')}
            active={sort === 'viewed'}
            onPress={() => setSort('viewed')}
          />
          <Chip
            label={t('explore.places')}
            active={sort === 'default'}
            onPress={() => setSort('default')}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title={t('explore.empty')} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.fallback]}>
                  <Text style={styles.fallbackText}>Umuco</Text>
                </View>
              )}
              <View style={styles.body}>
                <Text style={styles.cat}>{item.category}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={3}>
                  {item.description}
                </Text>
                <View style={styles.actions}>
                  {item.id === 'museum-gallery' ? (
                    <Pressable style={styles.saveBtn} onPress={openMuseum}>
                      <Text style={styles.saveText}>{t('collections.viewGallery') || 'View Gallery'}</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.saveBtn} onPress={() => onSave(item)}>
                    <Text style={styles.saveText}>
                      {savedSlugs.has(item.id) ? t('listen.saved') : t('collections.save')}
                    </Text>
                  </Pressable>
                  {viewed.has(item.id) ? (
                    <Text style={styles.viewed}>{t('history.title')}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={galleryOpen} animationType="slide" onRequestClose={() => setGalleryOpen(false)}>
        <SafeAreaView style={styles.gallerySafe}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>
              {currentMuseum?.artifact || currentMuseum?.title || t('collections.title')}
            </Text>
            <Pressable onPress={() => setGalleryOpen(false)}>
              <Text style={styles.close}>{t('settings.view')}</Text>
            </Pressable>
          </View>
          {museumImage ? (
            <Image source={{ uri: museumImage }} style={styles.galleryImage} resizeMode="contain" />
          ) : (
            <View style={styles.galleryFallback}>
              <Text style={styles.fallbackText}>Umuco</Text>
            </View>
          )}
          <Text style={styles.galleryMeta}>
            {galleryIndex + 1} / {Math.max(museumItems.length, 1)}
          </Text>
          <View style={styles.galleryNav}>
            <Pressable
              style={styles.navBtn}
              disabled={galleryIndex <= 0}
              onPress={() => onMuseumNavigate(galleryIndex - 1)}
            >
              <Text style={styles.navText}>‹</Text>
            </Pressable>
            <Pressable
              style={styles.navBtn}
              disabled={galleryIndex >= museumItems.length - 1}
              onPress={() => onMuseumNavigate(galleryIndex + 1)}
            >
              <Text style={styles.navText}>›</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: { width: '100%', height: 150, backgroundColor: colors.primarySoft },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: colors.primary, fontWeight: '800' },
  body: { padding: 14, gap: 4 },
  cat: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  desc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' },
  saveBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  saveText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  viewed: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  gallerySafe: { flex: 1, backgroundColor: colors.bgMain, padding: 16 },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  close: { color: colors.primary, fontWeight: '800' },
  galleryImage: { flex: 1, width: '100%', borderRadius: 12, backgroundColor: colors.primarySoft },
  galleryFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
  },
  galleryMeta: { textAlign: 'center', color: colors.textMuted, marginVertical: 10 },
  galleryNav: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: {
    width: 56,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: { color: colors.white, fontSize: 28, fontWeight: '700' },
});
