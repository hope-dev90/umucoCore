import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import artifactsData from '../../data/artifacts.json';
import museumGallery from '../../data/museumGallery.json';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import {
  Button,
  Card,
  Chip,
  KickerLabel,
  Muted,
  OverlayBadge,
  Row,
  SectionHeader,
  Title,
} from '../../components/ui';
import { HeritageCard } from '../../components/HeritageCard';
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
  categoryLabel?: string;
  description: string;
  image?: string;
  images?: string[];
  source: 'artifact' | 'heritage' | 'featured';
  numericId?: number | string;
  itemCount?: string;
};

type MuseumItem = {
  id?: string;
  artifact?: string;
  title?: string;
  category?: string;
  image?: string;
  src?: string;
  url?: string;
  description?: string;
};

function slugToNumericId(slug: string): number {
  return slug.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);
}

export default function CollectionsScreen() {
  const { t } = useLanguage();
  const { awardXP, trackActivity } = useGamification();
  const [heritage, setHeritage] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryCollection, setGalleryCollection] = useState<CollectionCard | null>(null);
  const [sort, setSort] = useState<'default' | 'viewed' | 'az'>('default');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const museumItems = useMemo<MuseumItem[]>(() => {
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

  const artifactCards = useMemo<CollectionCard[]>(
    () =>
      (
        (
          artifactsData as {
            collections?: Array<{
              id: string;
              title: string;
              category: string;
              description: string;
              images?: string[];
              count?: string | number;
            }>;
          }
        ).collections || []
      ).map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        categoryLabel: a.category,
        description: a.description,
        image: a.images?.[0],
        images: a.images,
        source: 'artifact' as const,
        numericId: slugToNumericId(a.id),
        itemCount: a.count ? `${a.count} ${t('collections.items') || 'items'}` : undefined,
      })),
    [t]
  );

  const smallCollections = useMemo<CollectionCard[]>(() => {
    const museumFirstImage = museumItems[0]?.url || museumItems[0]?.image || museumItems[0]?.src;
    return [
      {
        id: 'imigongo-patterns',
        title: 'Imigongo Patterns',
        category: 'Visual Art',
        categoryLabel: t('collections.visualArt') || 'Visual Art',
        description:
          'A catalog of over 100 geometric variants used in traditional wall art, including the symbolic patterns of the Gatsi dynasty.',
        image: museumFirstImage,
        images: [museumFirstImage].filter(Boolean) as string[],
        source: 'featured',
        numericId: slugToNumericId('imigongo-patterns'),
        itemCount: `115 ${t('collections.items') || 'items'}`,
      },
      {
        id: 'sacred-spaces',
        title: 'Sacred Spaces',
        category: 'Architecture',
        categoryLabel: t('collections.architecture') || 'Architecture',
        description:
          "3D reconstructions and high-fidelity photographs of the King's Palace and traditional sacred sites across Rwanda.",
        image: museumItems[1]?.url || museumItems[1]?.image || museumFirstImage,
        images: [(museumItems[1]?.url || museumItems[1]?.image || museumFirstImage)].filter(Boolean) as string[],
        source: 'featured',
        numericId: slugToNumericId('sacred-spaces'),
        itemCount: `18 ${t('collections.items') || 'items'}`,
      },
      {
        id: 'woven-narratives',
        title: 'Woven Narratives',
        category: 'Craftsmanship',
        categoryLabel: t('collections.craftsmanship') || 'Craftsmanship',
        description:
          'Tracing the history of the Agaseke basket, from its role in royal gift-giving to its modern symbolism of peace.',
        image: museumItems[2]?.url || museumItems[2]?.image || museumFirstImage,
        images: [(museumItems[2]?.url || museumItems[2]?.image || museumFirstImage)].filter(Boolean) as string[],
        source: 'featured',
        numericId: slugToNumericId('woven-narratives'),
        itemCount: `56 ${t('collections.items') || 'items'}`,
      },
    ];
  }, [t, museumItems]);

  const heritageCards: CollectionCard[] = useMemo(
    () =>
      heritage.map((h) => ({
        id: `heritage-${h.id}`,
        title: h.title,
        category: h.category || 'Heritage',
        categoryLabel: h.category || 'Heritage',
        description: String(h.description || ''),
        image: String(h.image_url || h.image || ''),
        images: h.image_url || h.image ? [String(h.image_url || h.image)] : undefined,
        source: 'heritage' as const,
        numericId: h.id,
      })),
    [heritage]
  );

  const all: CollectionCard[] = useMemo(
    () => [...smallCollections, ...artifactCards, ...heritageCards],
    [smallCollections, artifactCards, heritageCards]
  );

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(all.map((c) => c.categoryLabel || c.category).filter(Boolean)))],
    [all]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((c) => {
      const catOk =
        category === 'all' ||
        c.category === category ||
        (c.categoryLabel && c.categoryLabel === category);
      if (!catOk) return false;
      if (!q) return true;
      return [c.title, c.category, c.categoryLabel, c.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'viewed') {
      list = [...list].sort((a, b) => Number(viewed.has(b.id)) - Number(viewed.has(a.id)));
    }
    return list;
  }, [all, category, query, sort, viewed]);

  const onSave = async (c: CollectionCard) => {
    if (savedSlugs.has(c.id)) {
      showToast(t('collections.alreadySaved') || 'Already saved');
      return;
    }
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
      showToast(t('collections.savedToast') || 'Saved to your library ✓');
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    }
  };

  const markViewed = (id: string) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  };

  const openMuseum = async () => {
    setGalleryCollection({
      id: 'museum-gallery',
      title: t('collections.inangaTitle') || 'The Inanga Tradition',
      category: 'Museum',
      categoryLabel: t('collections.oralTradition') || 'Oral Tradition',
      description: t('collections.inangaDesc') || '',
      images: museumItems
        .map((m) => m.url || m.image || m.src)
        .filter(Boolean) as string[],
      source: 'featured',
    });
    setGalleryIndex(0);
    setGalleryOpen(true);
    await trackView({
      type: 'Collection',
      itemId: 'museum-gallery',
      title: t('collections.inangaTitle') || 'Museum Gallery',
      image: (museumItems[0]?.url || museumItems[0]?.image || '') as string,
      category: 'Museum',
    });
    markViewed('museum-gallery');
  };

  const openGallery = async (c: CollectionCard) => {
    const imgs = c.images || (c.image ? [c.image] : []);
    if (imgs.length === 0) return;
    setGalleryCollection(c);
    setGalleryIndex(0);
    setGalleryOpen(true);
    await trackView({
      type: 'Collection',
      itemId: c.id,
      title: c.title,
      image: imgs[0],
      category: c.categoryLabel || c.category,
    });
    markViewed(c.id);
  };

  const handleReadStory = async (c: CollectionCard) => {
    const stableId = String(c.id);
    if (!completedIds.has(stableId)) {
      setCompletedIds((prev) => new Set(prev).add(stableId));
      try {
        await Promise.all([
          awardXP(30, 'collection'),
          trackActivity('collection', stableId),
        ]);
      } catch {
      }
    }
    markViewed(stableId);
    await trackView({
      type: 'Collection',
      itemId: c.id,
      title: c.title,
      image: c.image || '',
      category: c.categoryLabel || c.category,
    });
    showToast(t('collections.xpEarned') || '+30 XP earned!');
  };

  const onMuseumNavigate = async (index: number) => {
    setGalleryIndex(index);
    const item = museumItems[index];
    if (!item) return;
    const title = item.artifact || item.title || `Artifact ${index + 1}`;
    await trackView({ type: 'Collection', title, category: item.category || 'Museum' });
    try {
      await Promise.all([
        awardXP(10, 'collection'),
        trackActivity('collection', `museum-${title}`),
      ]);
    } catch {
    }
    setViewed((prev) => new Set(prev).add(`museum-${title}`));
  };

  const currentMuseumImage = galleryCollection?.images?.[galleryIndex];
  const galleryImgCount = galleryCollection?.images?.length || 0;

  const renderFeaturedMain = () => (
    <Pressable
      onPress={openMuseum}
      style={({ pressed }) => [styles.featuredMain, pressed && { opacity: 0.92, transform: [{ translateY: 1 }] }]}
    >
      <View style={styles.featuredMainImgWrap}>
        {museumItems[0]?.url || museumItems[0]?.image || museumItems[0]?.src ? (
          <Image
            source={{ uri: String(museumItems[0]?.url || museumItems[0]?.image || museumItems[0]?.src) }}
            style={styles.featuredMainImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.featuredMainImg, styles.featuredImgFallback]}>
            <Ionicons name="musical-notes" size={52} color="rgba(255,255,255,0.85)" />
          </View>
        )}
        <View style={styles.featuredBadgeWrap}>
          <OverlayBadge variant="category">{t('collections.oralTradition') || 'Oral Tradition'}</OverlayBadge>
        </View>
      </View>
      <View style={styles.featuredMainBody}>
        <View style={styles.featuredMainMeta}>
          <Text style={styles.featuredMainTitle}>{t('collections.inangaTitle') || 'The Inanga Tradition'}</Text>
          <Text style={styles.featuredItemCount}>24 {t('collections.items') || 'items'}</Text>
        </View>
        <Text style={styles.featuredMainDesc} numberOfLines={3}>
          {t('collections.inangaDesc') ||
            'From ritual chants to the intimate tales of court bards, this collection preserves Rwanda\u2019s most beloved storytelling instrument, the inanga zither.'}
        </Text>
        <View style={styles.featuredCurator}>
          <View style={styles.curatorInfo}>
            <View style={styles.curatorAvatar}>
              <Ionicons name="person" size={13} color={colors.white} />
            </View>
            <Text style={styles.curatorName}>{t('collections.curatedBy') || 'Curated by Dr. Aimé N.'}</Text>
          </View>
          <Pressable onPress={(e) => { e.stopPropagation(); openMuseum(); }}>
            <Row>
              <Text style={styles.openArchiveLink}>{t('collections.viewGallery') || 'View Gallery'}</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.primary} />
            </Row>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const renderFeaturedSide = () => {
    const rcItem = museumItems[3] || museumItems[0];
    const rcImage = rcItem?.url || rcItem?.image || rcItem?.src;
    return (
      <Pressable
        onPress={openMuseum}
        style={({ pressed }) => [styles.featuredSide, pressed && { opacity: 0.92, transform: [{ translateY: 1 }] }]}
      >
        <View style={styles.featuredSideImgWrap}>
          {rcImage ? (
            <Image source={{ uri: String(rcImage) }} style={styles.featuredSideImg} resizeMode="cover" />
          ) : (
            <View style={[styles.featuredSideImg, styles.sideImgFallback]}>
              <Ionicons name="medal-outline" size={50} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={{ opacity: 0.7, ...StyleSheet.absoluteFill, backgroundColor: '#000' }} />
          <Text style={styles.featuredSideTitle}>
            {t('collections.royalCourtTitle') || 'Royal Court Rituals'}
          </Text>
        </View>
        <View style={styles.featuredSideBody}>
          <Text style={styles.featuredSideCount}>42 {t('collections.items') || 'items'}</Text>
          <Text style={styles.featuredSideQuote} numberOfLines={3}>
            "{t('collections.royalCourtQuote') ||
              'A king who does not listen to the elders will walk into fire with open eyes.'}"
          </Text>
          <View style={styles.featuredSideTags}>
            <View style={styles.sideTag}>
              <Text style={styles.sideTagText}>{t('collections.history') || 'History'}</Text>
            </View>
            <View style={styles.sideTag}>
              <Text style={styles.sideTagText}>{t('collections.sacred') || 'Sacred'}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderWrap}>
          <View style={styles.pageHeader}>
            <View style={{ flex: 1 }}>
              <Title>{t('collections.title')}</Title>
              <Muted style={{ marginTop: 6, lineHeight: 20 }}>
                {t('collections.subtitle') ||
                  'High-fidelity collections from the Umuco archive — artifacts, curated galleries, and reconstructed heritage sites.'}
              </Muted>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('collections.searchPlaceholder') || t('explore.search')}
            />
          </View>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>{t('collections.sortBy') || 'Sort by'}:</Text>
            <View style={styles.sortChips}>
              <Chip label={t('explore.places') || 'Default'} active={sort === 'default'} onPress={() => setSort('default')} />
              <Chip label={t('history.title') || 'Recently Viewed'} active={sort === 'viewed'} onPress={() => setSort('viewed')} />
              <Chip label="A–Z" active={sort === 'az'} onPress={() => setSort('az')} />
            </View>
          </View>
          <View style={styles.catChipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChips}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat === 'all' ? (t('explore.allPlaces') || 'All') : cat}
                  active={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.featuredArea}>
          {renderFeaturedMain()}
          {renderFeaturedSide()}
        </View>

        <View style={styles.gridArea}>
          <SectionHeader
            title={t('collections.allCollections') || 'All Collections'}
            actionLabel={t('explore.viewAll') || 'View All'}
          />
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t('explore.empty')} />
          ) : (
            filtered.map((c, idx) => (
              <HeritageCard
                key={`${c.id}-${idx}`}
                item={{
                  id: c.id,
                  title: c.title,
                  category: c.categoryLabel || c.category,
                  description: c.description,
                  location: c.itemCount,
                  image: c.image,
                  image_url: c.image,
                }}
                saved={savedSlugs.has(c.id)}
                onSave={() => onSave(c)}
                completed={completedIds.has(c.id) || viewed.has(c.id)}
                xp={30}
                onReadMore={() => handleReadStory(c)}
                onPress={() => c.images && c.images.length > 0 ? openGallery(c) : handleReadStory(c)}
                variant="collection"
              />
            ))
          )}
        </View>

        <View style={styles.cantFindBox}>
          <View style={styles.cantFindText}>
            <Text style={styles.cantFindTitle}>{t('collections.cantFindTitle') || "Can't find what you're looking for?"}</Text>
            <Text style={styles.cantFindDesc}>
              {t('collections.cantFindDesc') ||
                'Subscribe for new drops or contact the archive team with research inquiries.'}
            </Text>
          </View>
          <View style={styles.cantFindActions}>
            <Button
              label={t('collections.subscribe') || 'Subscribe'}
              variant="primary"
              onPress={() => showToast(t('collections.subscribed') || 'Thank you for subscribing!')}
              style={{ flex: 1 }}
            />
            <Button
              label={t('collections.contactArchive') || 'Contact Archive'}
              variant="outline"
              onPress={() => showToast('Contact form coming soon')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <Modal visible={galleryOpen} animationType="fade" transparent onRequestClose={() => setGalleryOpen(false)}>
        <View style={styles.galleryOverlay}>
          <View style={styles.galleryModal} onStartShouldSetResponder={() => true}>
            <View style={styles.galleryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.galleryTitle}>
                  {galleryCollection?.title || t('collections.title')}
                </Text>
                {galleryCollection?.categoryLabel ? (
                  <Text style={styles.galleryCat}>{galleryCollection.categoryLabel.toUpperCase()}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => setGalleryOpen(false)}
                style={({ pressed }) => [styles.galleryCloseBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons name="close" size={22} color="#6F5B55" />
              </Pressable>
            </View>

            <View style={styles.galleryMain}>
              {galleryImgCount > 1 && galleryIndex > 0 ? (
                <Pressable
                  onPress={() => {
                    const next = galleryIndex - 1;
                    setGalleryIndex(next);
                    if (galleryCollection?.id === 'museum-gallery') onMuseumNavigate(next);
                  }}
                  style={({ pressed }) => [styles.galleryNavBtn, styles.galleryNavPrev, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.white} />
                </Pressable>
              ) : null}
              {currentMuseumImage ? (
                <Image source={{ uri: currentMuseumImage }} style={styles.galleryMainImg} resizeMode="contain" />
              ) : (
                <View style={styles.galleryFallback}>
                  <Ionicons name="image" size={52} color={colors.primary} style={{ opacity: 0.3 }} />
                </View>
              )}
              {galleryImgCount > 1 && galleryIndex < galleryImgCount - 1 ? (
                <Pressable
                  onPress={() => {
                    const next = galleryIndex + 1;
                    setGalleryIndex(next);
                    if (galleryCollection?.id === 'museum-gallery') onMuseumNavigate(next);
                  }}
                  style={({ pressed }) => [styles.galleryNavBtn, styles.galleryNavNext, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.white} />
                </Pressable>
              ) : null}
            </View>

            {galleryCollection?.description ? (
              <Text style={styles.galleryDesc}>{galleryCollection.description}</Text>
            ) : null}

            {galleryImgCount > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryThumbs}>
                {galleryCollection?.images?.map((img, i) => (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setGalleryIndex(i);
                      if (galleryCollection?.id === 'museum-gallery') onMuseumNavigate(i);
                    }}
                    style={[
                      styles.galleryThumb,
                      i === galleryIndex && styles.galleryThumbActive,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.galleryThumbImg} resizeMode="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            <View style={{ marginTop: 16 }}>
              <Button
                label={t('collections.readEarnXP') || 'Read & Earn XP'}
                variant="xp"
                leftIcon="book-outline"
                onPress={() => {
                  if (galleryCollection) handleReadStory(galleryCollection);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  scrollContent: { paddingBottom: 20 },
  pageHeaderWrap: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bgMain },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  sortRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#7A675C',
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  catChipsWrap: {
    marginHorizontal: -20,
    marginTop: 12,
  },
  catChips: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 2,
  },
  featuredArea: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 16,
  },
  featuredMain: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 2,
  },
  featuredMainImgWrap: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  featuredMainImg: {
    width: '100%',
    height: '100%',
  },
  featuredImgFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadgeWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  featuredMainBody: {
    padding: 18,
  },
  featuredMainMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  featuredMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  featuredItemCount: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  featuredMainDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  featuredCurator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  curatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  curatorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curatorName: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  openArchiveLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  featuredSide: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 3,
  },
  featuredSideImgWrap: {
    position: 'relative',
    height: 140,
    overflow: 'hidden',
  },
  featuredSideImg: {
    width: '100%',
    height: '100%',
  },
  sideImgFallback: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredSideTitle: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  featuredSideBody: {
    padding: 14,
  },
  featuredSideCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F6D860',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  featuredSideQuote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  featuredSideTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sideTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  sideTagText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
  },
  gridArea: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  cantFindBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    backgroundColor: colors.bgCard,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  cantFindText: { marginBottom: 16 },
  cantFindTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cantFindDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cantFindActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  galleryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44,26,20,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  galleryModal: {
    backgroundColor: '#FDFBF7',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 10,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  galleryCat: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.08,
  },
  galleryCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(141,73,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryMain: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f1ee',
    borderRadius: 12,
    minHeight: 280,
    overflow: 'hidden',
  },
  galleryMainImg: {
    width: '100%',
    height: 280,
  },
  galleryFallback: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryNavPrev: { left: 10 },
  galleryNavNext: { right: 10 },
  galleryDesc: {
    marginVertical: 16,
    color: '#555',
    fontSize: 13,
    lineHeight: 20,
  },
  galleryThumbs: {
    gap: 8,
    paddingVertical: 2,
  },
  galleryThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    opacity: 0.6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryThumbActive: {
    opacity: 1,
    borderColor: colors.primary,
  },
  galleryThumbImg: {
    width: '100%',
    height: '100%',
  },
});
