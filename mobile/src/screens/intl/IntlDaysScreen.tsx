import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card, Chip, Title } from '../../components/ui';
import { SearchBar } from '../../components/SearchBar';
import { NATIONAL_EVENTS_2026 } from '../../data/intlEvents';
import { useLanguage } from '../../context/LanguageContext';
import { localizeField } from '../../utils/localization';
import { colors } from '../../theme/colors';

const TYPES = ['all', 'civic', 'faith', 'community', 'remembrance', 'culture'];

export default function IntlDaysScreen() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NATIONAL_EVENTS_2026.filter((event) => {
      if (type !== 'all' && event.type !== type) return false;
      if (!q) return true;
      const title = localizeField(event.title, language).toLowerCase();
      const desc = localizeField(event.desc, language).toLowerCase();
      return title.includes(q) || desc.includes(q) || event.date.includes(q);
    });
  }, [query, type, language]);

  return (
    <Screen>
      <Title>{t('intl.title')}</Title>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search days…" />
      <View style={styles.chips}>
        {TYPES.map((item) => (
          <Chip
            key={item}
            label={item}
            active={type === item}
            onPress={() => setType(item)}
          />
        ))}
      </View>
      {filtered.map((event) => (
        <Card key={event.date + event.title.en} style={styles.card}>
          <Text style={styles.date}>{event.date}</Text>
          <Text style={styles.type}>{event.type}</Text>
          <Text style={styles.title}>{localizeField(event.title, language)}</Text>
          <Text style={styles.desc}>{localizeField(event.desc, language)}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { gap: 4 },
  date: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  type: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  desc: { color: colors.textSecondary, lineHeight: 20 },
});
