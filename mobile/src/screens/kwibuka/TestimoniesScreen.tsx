import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import survivorData from '../../data/survivorTestimony.json';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { SurvivorTestimony } from '../../types';
import type { MoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Testimonies'>;

export default function TestimoniesScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const testimonies = (survivorData as { testimonies: SurvivorTestimony[] }).testimonies || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return testimonies;
    return testimonies.filter((item) =>
      [item.title, item.summary, item.district, ...(item.subjects || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [testimonies, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{t('testimonies.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('testimonies.title')}</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search testimonies…" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No testimonies found" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TestimonyDetail', { id: item.id })}
          >
            <Text style={styles.district}>{item.district || 'Rwanda'}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.subjects}>
              {(item.subjects || []).join(', ') || 'Survivor'}
            </Text>
            {item.summary ? (
              <Text style={styles.summary} numberOfLines={3}>
                {item.summary}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  back: { color: colors.primary, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  district: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  subjects: { color: colors.textMuted, fontSize: 12 },
  summary: { color: colors.textSecondary, lineHeight: 19, marginTop: 4 },
});
