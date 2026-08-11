import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { useLanguage } from '../../context/LanguageContext';
import { getSaved, removeSaved } from '../../services/savedService';
import { colors } from '../../theme/colors';
import type { SavedItem } from '../../types';

export default function SavedScreen() {
  const { t } = useLanguage();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSaved();
      setItems(data.items || []);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const onRemove = async (itemId: string | number) => {
    try {
      await removeSaved(itemId);
      setItems((prev) => prev.filter((i) => String(i.item_id) !== String(itemId)));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Remove failed');
    }
  };

  const filtered = query.trim()
    ? items.filter((s) => {
        const q = query.toLowerCase();
        return (
          (s.item_title || '').toLowerCase().includes(q) ||
          (s.item_subtitle || '').toLowerCase().includes(q) ||
          (s.item_type || '').toLowerCase().includes(q)
        );
      })
    : items;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('saved.title')}</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search saved…" />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.item_id}-${index}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title={t('saved.empty')} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.type}>{item.item_type}</Text>
                <Text style={styles.cardTitle}>{item.item_title}</Text>
                {item.item_subtitle ? (
                  <Text style={styles.sub}>{item.item_subtitle}</Text>
                ) : null}
              </View>
              <Pressable style={styles.remove} onPress={() => onRemove(item.item_id)}>
                <Text style={styles.removeText}>{t('saved.remove')}</Text>
              </Pressable>
            </View>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  type: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: { fontWeight: '800', color: colors.textPrimary },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  remove: {
    backgroundColor: '#FDECEC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  removeText: { color: colors.danger, fontWeight: '700', fontSize: 12 },
});
