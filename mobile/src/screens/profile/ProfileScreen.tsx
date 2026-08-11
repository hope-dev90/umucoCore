import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/Screen';
import { Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import {
  fetchBadges,
  fetchCollectibles,
  fetchMyBadges,
  fetchMyCollectibles,
} from '../../services/gamificationService';
import {
  resolveAvatar,
  updateExplorerType,
  updateProfile,
  uploadAvatar,
} from '../../services/userService';
import { colors } from '../../theme/colors';
import type { Badge, Collectible, ExplorerType, UserBadge, UserCollectible } from '../../types';

const EXPLORERS: ExplorerType[] = [
  'warrior',
  'nature-lover',
  'royal-historian',
  'folktale-hunter',
  'music-explorer',
];

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { xp, level, streak, bestStreak, nextLevelXP, refreshXP } = useGamification();

  const [name, setName] = useState(user?.name || '');
  const [explorerType, setExplorerType] = useState(
    String(user?.explorerType || user?.explorer_type || '')
  );
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(resolveAvatar(user));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setName(user?.name || '');
    setExplorerType(String(user?.explorerType || user?.explorer_type || ''));
    setAvatarUrl(resolveAvatar(user));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshXP();
      const [catalog, mine, cols, myCols] = await Promise.all([
        fetchBadges(),
        fetchMyBadges(),
        fetchCollectibles(),
        fetchMyCollectibles(),
      ]);
      if (cancelled) return;
      setBadges(catalog);
      setUserBadges(
        mine.map((b) => ({ ...b, unlockedAt: b.unlockedAt || b.unlocked_at || null }))
      );
      setCollectibles(cols);
      setUserCollectibles(
        myCols.map((c) => ({ ...c, obtainedAt: c.obtainedAt || c.obtained_at || null }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshXP]);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.error'), t('profile.title'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(
        asset.uri,
        asset.mimeType || 'image/jpeg',
        asset.fileName || 'avatar.jpg'
      );
      setAvatarUrl(url);
      updateUser({ profileImage: url, avatar: url });
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) throw new Error(t('common.error'));
      if (!explorerType) throw new Error(t('auth.explorerType'));
      await updateProfile({ fullName: trimmed });
      await updateExplorerType(explorerType);
      updateUser({ name: trimmed, explorerType, explorer_type: explorerType });
      setEditMode(false);
      Alert.alert(t('common.save'), t('profile.title'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const unlockedCount = userBadges.filter((b) => b.unlockedAt).length;
  const obtainedCount = userCollectibles.filter((c) => c.obtainedAt).length;
  const xpPct = Math.min(100, (xp / Math.max(nextLevelXP, 1)) * 100);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.idCard}>
          <View style={styles.band} />
          <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>
          <Text style={styles.hint}>
            {uploadingAvatar ? t('common.loading') : t('profile.title')}
          </Text>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.explorer}>
            {explorerType ? t(`explorer.${explorerType}.label`) : t('profile.explorer')}
          </Text>

          <View style={styles.xpRow}>
            <Text style={styles.xpText}>
              {xp} / {nextLevelXP} XP
            </Text>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>
                {t('home.level')} {level}
              </Text>
            </View>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
          </View>

          <View style={styles.stats}>
            <Stat label={t('home.streak')} value={streak} />
            <Stat label="Best" value={bestStreak} />
          </View>
        </View>

        <Card style={styles.details}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>{t('profile.title')}</Text>
            {!editMode ? (
              <Button label={t('settings.manage')} variant="secondary" onPress={() => setEditMode(true)} />
            ) : null}
          </View>
          <Input label={t('auth.name')} value={name} onChangeText={setName} editable={editMode} />
          <Text style={styles.label}>{t('profile.explorer')}</Text>
          <View style={styles.explorerList}>
            {EXPLORERS.map((type) => (
              <Pressable
                key={type}
                disabled={!editMode}
                onPress={() => setExplorerType(type)}
                style={[
                  styles.explorerChip,
                  explorerType === type && styles.explorerChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.explorerChipText,
                    explorerType === type && styles.explorerChipTextActive,
                  ]}
                >
                  {t(`explorer.${type}.label`)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Input label={t('auth.email')} value={user?.email || ''} editable={false} />
          {editMode ? (
            <View style={styles.actions}>
              <Button
                label={t('settings.view')}
                variant="secondary"
                onPress={() => {
                  setEditMode(false);
                  setName(user?.name || '');
                  setExplorerType(String(user?.explorerType || user?.explorer_type || ''));
                }}
              />
              <Button label={t('common.save')} onPress={handleSave} loading={saving} />
            </View>
          ) : null}
        </Card>

        <Section
          title={t('profile.badges') || 'Badges'}
          count={`${unlockedCount}/${badges.length}`}
          loading={loading}
          empty={badges.length === 0}
        >
          <View style={styles.grid}>
            {badges.map((badge) => {
              const unlocked = !!userBadges.find((b) => b.id === badge.id && b.unlockedAt);
              return (
                <View key={String(badge.id)} style={[styles.gridItem, !unlocked && styles.locked]}>
                  <Text style={styles.gridIcon}>{unlocked ? '🏅' : '🔒'}</Text>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Section
          title={t('profile.collectibles') || 'Collectibles'}
          count={`${obtainedCount}/${collectibles.length}`}
          loading={loading}
          empty={collectibles.length === 0}
        >
          <View style={styles.grid}>
            {collectibles.map((item) => {
              const obtained = !!userCollectibles.find((c) => c.id === item.id && c.obtainedAt);
              return (
                <View key={String(item.id)} style={[styles.gridItem, !obtained && styles.locked]}>
                  <Text style={styles.gridIcon}>{obtained ? '💎' : '🔒'}</Text>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  count,
  loading,
  empty,
  children,
}: {
  title: string;
  count: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <Card>
      <View style={styles.sectionHeader}>
        <Text style={styles.detailsTitle}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
      </View>
      {loading ? <Text style={styles.hint}>{t('common.loading')}</Text> : null}
      {!loading && empty ? <Text style={styles.hint}>{t('common.error')}</Text> : null}
      {!loading && !empty ? children : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 16, paddingBottom: 24 },
  idCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 20,
  },
  band: { alignSelf: 'stretch', height: 72, backgroundColor: colors.primary },
  avatarWrap: { marginTop: -40 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.bgCard,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bgCard,
  },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: colors.primaryDark },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 8 },
  explorer: { color: colors.primary, fontWeight: '700', marginTop: 4 },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  xpText: { fontWeight: '700', color: colors.textPrimary },
  levelPill: {
    marginLeft: 'auto',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  xpTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 8,
  },
  xpFill: { height: '100%', backgroundColor: colors.primary },
  stats: { flexDirection: 'row', gap: 10, marginTop: 16, paddingHorizontal: 20 },
  stat: {
    flex: 1,
    backgroundColor: colors.bgMain,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statValue: { fontWeight: '800', fontSize: 18, color: colors.textPrimary },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  details: { gap: 10 },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailsTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  label: { fontWeight: '700', color: colors.textSecondary, marginTop: 4 },
  explorerList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  explorerChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgMain,
  },
  explorerChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  explorerChipText: { color: colors.textPrimary, fontWeight: '700', fontSize: 12 },
  explorerChipTextActive: { color: colors.primaryDark },
  actions: { flexDirection: 'row', gap: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  count: { color: colors.primaryDark, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: {
    width: '47%',
    backgroundColor: colors.bgMain,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  locked: { opacity: 0.55 },
  gridIcon: { fontSize: 22 },
  gridName: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
});
