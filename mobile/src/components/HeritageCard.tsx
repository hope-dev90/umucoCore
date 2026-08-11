import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { HeritageItem } from '../types';

export function HeritageCard({
  item,
  onPress,
  onSave,
  saved,
}: {
  item: HeritageItem;
  onPress?: () => void;
  onSave?: () => void;
  saved?: boolean;
}) {
  const image = item.image_url || item.image;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {image ? (
        <Image source={{ uri: String(image) }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.fallbackText}>Umuco</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>{item.category || 'Heritage'}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={3}>
            {String(item.description)}
          </Text>
        ) : null}
        {item.location ? (
          <Text style={styles.meta} numberOfLines={1}>
            {String(item.location)}
          </Text>
        ) : null}
        {onSave ? (
          <Pressable onPress={onSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primarySoft,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  body: {
    padding: 14,
    gap: 4,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  saveBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  saveText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
});
