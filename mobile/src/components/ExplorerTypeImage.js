// Ported from web src/components/ExplorerTypeImage.jsx.
// Same cached Wikimedia Commons lookup (URLs and one base64 data-URI entry,
// both of which RN's Image handles fine via {uri}), same circular avatar
// with initial-letter fallback, same selected/unselected styling.
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import commonsImagesCached from '../data/commonsImageCache.json';

export const EXPLORER_IMAGES = {
  warrior: commonsImagesCached["Intore – Umubyino w'Ubutwari"] || commonsImagesCached['Intore Warriors – The Dance of Courage'],
  'nature-lover': commonsImagesCached['Nyungwe Ancient Rainforest'] || commonsImagesCached['Sacred Forests of Gishwati'],
  'royal-historian': commonsImagesCached["Ingoro y'Ubwami ya Nyanza"] || commonsImagesCached['The Royal Palace of Nyanza'],
  'folktale-hunter': commonsImagesCached['Imigani – Inkuru zivugwa ku Muriro'] || commonsImagesCached['Imigani – Stories by the Fire'],
  'music-explorer': commonsImagesCached["Inanga – Umutima w'Umuziki Nyarwanda"] || commonsImagesCached['Inanga – The Soul of Rwandan Music'],
};

export function getExplorerImage(type) {
  return EXPLORER_IMAGES[type] || null;
}

export default function ExplorerTypeImage({ type, label = 'Explorer', size = 40, selected = false, style }) {
  const src = getExplorerImage(type);
  const fallback = label.charAt(0).toUpperCase();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: selected ? '#8D493A' : 'rgba(141,73,58,0.12)',
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? '#8D493A' : 'rgba(141,73,58,0.18)',
        },
        style,
      ]}
    >
      {src ? (
        <Image source={{ uri: src }} style={styles.image} />
      ) : (
        <Text style={{ color: selected ? '#fff' : '#8D493A', fontWeight: '800', fontSize: size * 0.38 }}>
          {fallback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
});
