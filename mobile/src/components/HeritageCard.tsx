import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Button, OverlayBadge, Row } from './ui';
import type { HeritageItem } from '../types';

type Variant = 'explore' | 'collection' | 'recent' | 'compact';

export function HeritageCard({
  item,
  onPress,
  onSave,
  onMap,
  onReadMore,
  saved,
  completed,
  isAudio,
  xp,
  variant = 'explore',
  compact = false,
}: {
  item: HeritageItem;
  onPress?: () => void;
  onSave?: () => void;
  onMap?: () => void;
  onReadMore?: () => void;
  saved?: boolean;
  completed?: boolean;
  isAudio?: boolean;
  xp?: number;
  variant?: Variant;
  compact?: boolean;
}) {
  const image = item.image_url || item.image;
  const category = item.category || 'Heritage';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.cardShadow,
        pressed && { opacity: 0.9, transform: [{ translateY: 1 }] },
        compact && styles.cardCompact,
      ]}
    >
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: String(image) }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            {isAudio ? (
              <Ionicons name="headset" size={52} color="rgba(255,250,244,0.9)" />
            ) : (
              <Text style={styles.fallbackText}>Umuco</Text>
            )}
          </View>
        )}
        <View style={styles.badgesRow}>
          <OverlayBadge variant="category">{category}</OverlayBadge>
          <View style={styles.badgesRight}>
            {xp ? <OverlayBadge variant="xp">+{xp} XP</OverlayBadge> : null}
            {completed ? (
              <OverlayBadge variant="read">
                <Row>
                  <Ionicons name="checkmark-circle" size={11} color="#2F6B3D" />
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#2F6B3D', marginLeft: 3 }}>
                    Read
                  </Text>
                </Row>
              </OverlayBadge>
            ) : null}
            {isAudio ? (
              <OverlayBadge variant="audio">
                <Row>
                  <Ionicons name="headset" size={11} color={colors.primary} />
                  <Text style={{ fontSize: 10, fontWeight: '900', color: colors.primary, marginLeft: 3 }}>
                    Listen
                  </Text>
                </Row>
              </OverlayBadge>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.bodyTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          {item.location ? (
            <View style={styles.locationPill}>
              <Ionicons name="location-outline" size={9} color={colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {String(item.location)}
              </Text>
            </View>
          ) : null}
        </View>

        {item.description && !compact ? (
          <Text style={styles.desc} numberOfLines={3}>
            {String(item.description)}
          </Text>
        ) : null}

        {!compact ? (
          <View style={styles.actions}>
            {variant === 'collection' ? (
              <>
                <Button
                  label="Read & Earn XP"
                  variant="xp"
                  onPress={onReadMore ?? (() => {})}
                  leftIcon="book-outline"
                  style={{ flex: 1 }}
                />
                {onSave ? (
                  <Pressable
                    onPress={onSave}
                    style={[
                      styles.saveHeart,
                      saved && { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
                    ]}
                  >
                    <Ionicons
                      name={saved ? 'heart' : 'heart-outline'}
                      size={18}
                      color={saved ? '#DC2626' : colors.textMuted}
                    />
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                {onMap ? (
                  <Button
                    label="Map"
                    variant="outline"
                    onPress={onMap}
                    leftIcon="map-outline"
                    style={{ flex: 1 }}
                  />
                ) : null}
                <Button
                  label={isAudio ? 'Play' : 'Read more'}
                  variant="primary"
                  onPress={onReadMore ?? (() => {})}
                  leftIcon={isAudio ? 'play-outline' : 'book-outline'}
                  style={{ flex: 1 }}
                />
              </>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.14)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardShadow: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3,
  },
  cardCompact: {
    marginBottom: 10,
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: '#F4E8DC',
  },
  image: {
    width: '100%',
    height: 162,
    backgroundColor: colors.primarySoft,
  },
  imageFallback: {
    width: '100%',
    height: 162,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  fallbackText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 20,
  },
  badgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgesRight: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  bodyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.16)',
    backgroundColor: colors.bgMain,
    maxWidth: '45%',
  },
  locationText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 12,
  },
  desc: {
    fontSize: 12.5,
    color: '#655349',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  saveHeart: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
