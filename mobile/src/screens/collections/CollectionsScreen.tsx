import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import artifactsData from '../../data/artifacts.json';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { getHeritage } from '../../services/heritageService';
import { getSaved, saveItem } from '../../services/savedService';
import { colors } from '../../theme/colors';
import type { HeritageItem } from '../../types';

type CollectionCard = {
  id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  source: 'artifact' | 'heritage';
  numericId?: number | string;
};

function slugToNumericId(slug: string): number {
  return slug.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0x7fffffff, 0);
}

export default function CollectionsScreen() {
  const { t } = useLanguage();
  const [heritage, setHeritage] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, saved] = await Promise.all([
        getHeritage().catch(() => []),
        getSaved().catch(() => ({ items: [] })),
      ]);
      setHeritage(h);
      const slugs = new Set(
        (saved.items || [])
          .filter((i) => i.item_type?.toLowerCase() === 'collection' || i.item_type === 'heritage')
          .map((i) => String((i.item_meta as any)?.slug || i.item_id))
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
    const artifactCards: CollectionCard[] = (
      (artifactsData as { collections?: Array<{
        id: string;
        title: string;
        category: string;
        description: string;
        images?: string[];
      }> }).collections || []
    ).map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      description: a.description,
      image: a.images?.[0],
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

    return [...artifactCards, ...heritageCards];
  }, [heritage]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(all.map((c) => c.category).filter(Boolean)))],
    [all]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      const catOk = category === 'all' || c.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [c.title, c.category, c.description].some((v) => v.toLowerCase().includes(q));
    });
  }, [all, category, query]);

  const onSave = async (c: CollectionCard) => {
    try {
      await saveItem({
        itemType: c.source === 'artifact' ? 'Collection' : 'heritage',
        itemId: c.numericId ?? c.id,
        itemTitle: c.title,
        itemSubtitle: c.category,
        itemImage: c.image || '',
        itemMeta: { category: c.category, description: c.description, slug: c.id },
      });
      setSavedSlugs((prev) => new Set(prev).add(c.id));
      Alert.alert('Saved', c.title);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('collections.title')}</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search collections…" />
        <View style={styles.chips}>
          {categories.slice(0, 10).map((cat) => (
            <Chip
              key={cat}
              label={cat === 'all' ? 'All' : cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No collections found" />}
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
                <Pressable style={styles.saveBtn} onPress={() => onSave(item)}>
                  <Text style={styles.saveText}>
                    {savedSlugs.has(item.id) ? 'Saved' : t('collections.save')}
                  </Text>
                </Pressable>
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
  saveBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  saveText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
