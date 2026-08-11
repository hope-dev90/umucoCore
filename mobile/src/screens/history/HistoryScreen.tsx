import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card, StatPill, Title } from '../../components/ui';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { useLanguage } from '../../context/LanguageContext';
import { getHistory, getHistoryStats } from '../../services/historyService';
import { colors } from '../../theme/colors';
import type { HistoryItem, HistoryStats } from '../../types';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function HistoryScreen() {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [hist, st] = await Promise.all([getHistory(), getHistoryStats()]);
      setItems(hist);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Title>{t('history.title')}</Title>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search history…" />
      <View style={styles.stats}>
        <StatPill label={t('history.itemsViewed')} value={stats.items_viewed || 0} />
        <StatPill label={t('history.audioSessions')} value={stats.audio_sessions || 0} />
        <StatPill label={t('history.articlesRead')} value={stats.articles_read || 0} />
      </View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <EmptyState title={t('common.error')} message={error} actionLabel={t('common.retry')} onAction={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState title={t('history.empty')} />
      ) : null}
      {filtered.map((item) => (
        <Card key={String(item.id)} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.type || 'Item'}
            {item.viewedAt ? ` · ${formatRelativeTime(item.viewedAt)}` : ''}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  card: { gap: 4 },
  title: { fontWeight: '800', color: colors.textPrimary },
  meta: { color: colors.textMuted, fontSize: 12 },
});
