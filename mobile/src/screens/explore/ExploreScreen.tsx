import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeritageCard } from '../../components/HeritageCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { getHeritage } from '../../services/heritageService';
import { saveItem } from '../../services/savedService';
import { trackView } from '../../services/historyService';
import { colors } from '../../theme/colors';
import type { HeritageItem } from '../../types';

export default function ExploreScreen() {
  const { t } = useLanguage();
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHeritage();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      Alert.alert('Saved', 'Added to your library');
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('explore.title')}</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('explore.search')}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <EmptyState title={t('common.error')} message={error} actionLabel={t('common.retry')} onAction={load} />
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
});
