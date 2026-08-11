import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button, Card } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { MoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Kwibuka'>;

const VOICES = [
  {
    type: 'Survivor voice',
    title: 'Remembering with dignity',
    excerpt: 'We remember not to reopen wounds, but to honor lives and renew our shared humanity.',
  },
  {
    type: 'Community',
    title: 'Unity after mourning',
    excerpt: 'Kwibuka binds communities through remembrance, learning, and responsibility.',
  },
  {
    type: 'Youth',
    title: 'Never again starts with us',
    excerpt: 'Young people carry memory forward through education, art, and dialogue.',
  },
];

export default function KwibukaScreen({ navigation }: Props) {
  const { t } = useLanguage();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.flame}>✦</Text>
        <Text style={styles.heroTitle}>{t('kwibuka.title')}</Text>
        <Text style={styles.heroSub}>{t('kwibuka.subtitle')}</Text>
      </View>

      <Button
        label={t('kwibuka.testimonies')}
        onPress={() => navigation.navigate('Testimonies')}
      />

      <Text style={styles.section}>Voices of remembrance</Text>
      {VOICES.map((v) => (
        <Card key={v.title} style={styles.card}>
          <Text style={styles.type}>{v.type}</Text>
          <Text style={styles.cardTitle}>{v.title}</Text>
          <Text style={styles.excerpt}>{v.excerpt}</Text>
        </Card>
      ))}

      <Pressable style={styles.timeline}>
        <Text style={styles.section}>Remembrance timeline</Text>
        <Text style={styles.timelineItem}>7 April — National mourning begins</Text>
        <Text style={styles.timelineItem}>Kwibuka week — Community vigils & learning</Text>
        <Text style={styles.timelineItem}>4 July — Liberation Day remembrance</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  flame: { color: colors.primarySoft, fontSize: 28 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: colors.white },
  heroSub: { fontSize: 15, color: colors.primarySoft, lineHeight: 22 },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  card: { gap: 4 },
  type: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: { fontWeight: '800', color: colors.textPrimary, fontSize: 16 },
  excerpt: { color: colors.textSecondary, lineHeight: 20 },
  timeline: { gap: 8 },
  timelineItem: { color: colors.textSecondary, fontSize: 14 },
});
