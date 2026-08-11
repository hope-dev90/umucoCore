import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import survivorData from '../../data/survivorTestimony.json';
import { Screen } from '../../components/Screen';
import { Button, Subtitle, Title } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { SurvivorTestimony } from '../../types';
import type { MoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'TestimonyDetail'>;

function getLinks(itemUrl?: string | string[] | null): string[] {
  if (!itemUrl) return [];
  return Array.isArray(itemUrl) ? itemUrl : [itemUrl];
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('/')[0] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('/')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function TestimonyDetailScreen({ route, navigation }: Props) {
  const { t } = useLanguage();
  const testimonies = (survivorData as { testimonies: SurvivorTestimony[] }).testimonies || [];
  const testimony = testimonies.find((item) => item.id === route.params.id);
  const links = useMemo(() => getLinks(testimony?.item_url), [testimony?.item_url]);
  const [activeIndex, setActiveIndex] = useState(links.length === 1 ? 0 : null);

  if (!testimony) {
    return (
      <Screen>
        <Title>{t('testimonies.notFound')}</Title>
        <Button label={t('testimonies.title')} onPress={() => navigation.navigate('Testimonies')} />
      </Screen>
    );
  }

  const activeUrl = activeIndex != null ? links[activeIndex] : null;
  const youtubeId = activeUrl ? getYouTubeId(activeUrl) : null;

  return (
    <Screen>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← {t('testimonies.title')}</Text>
      </Pressable>
      <Title style={{ fontSize: 24 }}>{testimony.title}</Title>
      <Subtitle>
        {(testimony.subjects || []).join(', ')}
        {testimony.district ? ` · ${testimony.district}` : ''}
      </Subtitle>
      {testimony.summary ? <Text style={styles.summary}>{testimony.summary}</Text> : null}
      <Text style={styles.meta}>
        Language: {testimony.language || '—'}
        {testimony.translation ? ` · Translation: ${testimony.translation}` : ''}
      </Text>

      {links.map((url, index) => (
        <Button
          key={url + index}
          label={youtubeId && activeIndex === index ? 'Hide video' : `Watch source ${index + 1}`}
          variant={activeIndex === index ? 'primary' : 'secondary'}
          onPress={() => setActiveIndex(activeIndex === index ? null : index)}
        />
      ))}

      {youtubeId ? (
        <View style={styles.videoWrap}>
          <WebView
            style={styles.webview}
            source={{ uri: `https://www.youtube.com/embed/${youtubeId}` }}
            allowsFullscreenVideo
          />
        </View>
      ) : activeUrl ? (
        <Button label="Open link" onPress={() => Linking.openURL(activeUrl)} />
      ) : null}

      {testimony.listing_url ? (
        <Button
          label="Open archive listing"
          variant="ghost"
          onPress={() => Linking.openURL(testimony.listing_url!)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '700' },
  summary: { color: colors.textSecondary, lineHeight: 22, fontSize: 15 },
  meta: { color: colors.textMuted, fontSize: 13 },
  videoWrap: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  webview: { flex: 1 },
});
