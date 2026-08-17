import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button, Card } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { MoreStackParamList } from '../../navigation/types';
import type { LanguageCode } from '../../types';

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

type Localized = { en: string; rw: string; fr: string };

type MemorialSite = {
  id: string;
  lat: number;
  lng: number;
  established?: string;
  type: string;
  district: Localized;
  name: Localized;
  description: Localized;
};

import memorialData from '../../data/genocideMemorialSites.json';

const SITES = memorialData.sites as MemorialSite[];

const INITIAL_REGION: Region = {
  latitude: memorialData.center.lat,
  longitude: memorialData.center.lng,
  latitudeDelta: 1.6,
  longitudeDelta: 1.6,
};

function pick(field: Localized, lang: LanguageCode) {
  return field[lang] || field.en;
}

export default function KwibukaScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const mapRef = React.useRef<MapView>(null);
  const [selectedId, setSelectedId] = React.useState(SITES[0]?.id ?? null);

  const selected = SITES.find((s) => s.id === selectedId) ?? null;

  const selectSite = (site: MemorialSite) => {
    setSelectedId(site.id);
    mapRef.current?.animateToRegion(
      {
        latitude: site.lat,
        longitude: site.lng,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      },
      450
    );
  };

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

      <Text style={styles.section}>Memorial Sites Map</Text>
      <Text style={styles.mapSubtitle}>{t('kwibuka.mapSub')}</Text>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          mapType="standard"
        >
          {SITES.map((site) => (
            <Marker
              key={site.id}
              coordinate={{ latitude: site.lat, longitude: site.lng }}
              title={pick(site.name, language)}
              description={pick(site.district, language)}
              pinColor={site.id === selectedId ? colors.primary : colors.primaryDark}
              onPress={() => selectSite(site)}
            />
          ))}
        </MapView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}
      >
        {SITES.map((site) => {
          const active = site.id === selectedId;
          return (
            <Pressable
              key={site.id}
              onPress={() => selectSite(site)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {pick(site.name, language)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selected && (
        <Card style={styles.detailCard}>
          <Text style={styles.type}>{t(`kwibuka.map.type.${selected.type}`)}</Text>
          <Text style={styles.detailName}>{pick(selected.name, language)}</Text>
          <Text style={styles.detailMeta}>
            {pick(selected.district, language)}
            {selected.established ? ` · ${selected.established}` : ''}
          </Text>
          <Text style={styles.detailDesc}>{pick(selected.description, language)}</Text>
        </Card>
      )}

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
    marginTop: 24,
  },
  mapSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  mapWrap: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  chipScroll: { maxHeight: 44, marginTop: 12 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 220,
  },
  chipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipText: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: colors.white },
  detailCard: {
    marginTop: 16,
    gap: 6,
  },
  detailName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  detailMeta: { fontSize: 12, color: colors.textMuted },
  detailDesc: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 4 },
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
