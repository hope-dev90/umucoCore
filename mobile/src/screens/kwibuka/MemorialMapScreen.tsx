import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import memorialData from '../../data/genocideMemorialSites.json';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { MoreStackParamList } from '../../navigation/types';
import type { LanguageCode } from '../../types';

type Props = NativeStackScreenProps<MoreStackParamList, 'MemorialMap'>;

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

export default function MemorialMapScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState(SITES[0]?.id ?? null);

  useEffect(() => {
    navigation.setOptions({ title: t('kwibuka.mapTitle') });
  }, [navigation, t]);

  const selected = useMemo(
    () => SITES.find((s) => s.id === selectedId) ?? null,
    [selectedId]
  );

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

  const openDirections = async () => {
    if (!selected) return;
    const url = `https://www.openstreetmap.org/directions?to=${selected.lat}%2C${selected.lng}`;
    await Linking.openURL(url);
  };

  return (
    <Screen>
      <Text style={styles.subtitle}>{t('kwibuka.mapSub')}</Text>
      <Text style={styles.count}>{t('kwibuka.mapCount', { count: SITES.length })}</Text>

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
        <View style={styles.detail}>
          <Text style={styles.type}>{t(`kwibuka.map.type.${selected.type}`)}</Text>
          <Text style={styles.name}>{pick(selected.name, language)}</Text>
          <Text style={styles.meta}>
            {pick(selected.district, language)}
            {selected.established ? ` · ${selected.established}` : ''}
          </Text>
          <Text style={styles.desc}>{pick(selected.description, language)}</Text>
          <Pressable onPress={openDirections} style={styles.directionsBtn}>
            <Text style={styles.directionsText}>{t('kwibuka.mapDirections')}</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  mapWrap: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  chipScroll: { maxHeight: 44 },
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
  detail: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  type: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted },
  desc: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 4 },
  directionsBtn: { marginTop: 8, alignSelf: 'flex-start' },
  directionsText: {
    color: colors.primaryDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
