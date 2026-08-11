import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import {
  Button,
  Card,
  Chip,
  Input,
  StatPill,
  Subtitle,
  Title,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchXP,
  fetchMyBadges,
  fetchCollectibles,
  fetchMyCollectibles,
} from '../../services/gamificationService';
import { updateExplorerType, updateProfile, resolveAvatar } from '../../services/userService';
import { assetUrl, getToken } from '../../services/api';
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
  const [name, setName] = useState(user?.name || '');
  const [explorerType, setExplorerType] = useState<string>(
    user?.explorerType || user?.explorer_type || ''
  );
  const [xp, setXp] = useState(user?.xp || 0);
  const [level, setLevel] = useState(user?.level || 1);
  const [streak, setStreak] = useState(user?.currentStreak || 0);
  const [bestStreak, setBestStreak] = useState(user?.bestStreak || 0);
  const [totalDays, setTotalDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(resolveAvatar(user));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [recentMarks, setRecentMarks] = useState<Array<{ id: string; type: string; payload?: Record<string, unknown>; createdAt?: string }>>([]);
  const [loadingGamification, setLoadingGamification] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(user?.name || '');
    setExplorerType(user?.explorerType || user?.explorer_type || '');
    setAvatarUrl(resolveAvatar(user));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingGamification(true);
      const [xpData, badgesData, myBadgesData, collectiblesData, myCollectiblesData] =
        await Promise.all([
          fetchXP(),
          fetchMyBadges(),
          fetchMyBadges(),
          fetchCollectibles(),
          fetchMyCollectibles(),
        ]);

      if (cancelled) return;

      if (xpData) {
        setXp(xpData.xp ?? 0);
        setLevel(xpData.level ?? 1);
        setStreak(xpData.currentStreak ?? xpData.current_streak ?? 0);
        setBestStreak(xpData.bestStreak ?? xpData.best_streak ?? 0);
        setTotalDays(xpData.totalDays ?? xpData.total_days ?? 0);
      }

      const normalizedBadges = (badgesData || []).map((b: Badge) => ({
        ...b,
        unlockedAt: b.unlockedAt || b.unlocked_at || null,
      }));
      const normalizedUserBadges = (myBadgesData || []).map((b: UserBadge) => ({
        ...b,
        unlockedAt: b.unlockedAt || b.unlocked_at || null,
      }));
      const normalizedCollectibles = (collectiblesData || []).map((c: Collectible) => ({
        ...c,
        obtainedAt: c.obtainedAt || c.obtained_at || null,
      }));
      const normalizedUserCollectibles = (myCollectiblesData || []).map((c: UserCollectible) => ({
        ...c,
        obtainedAt: c.obtainedAt || c.obtained_at || null,
      }));

      setBadges(normalizedBadges);
      setUserBadges(normalizedUserBadges);
      setCollectibles(normalizedCollectibles);
      setUserCollectibles(normalizedUserCollectibles);

      const feed: Array<{ id: string; type: string; payload?: Record<string, unknown>; createdAt?: string }> = [
        ...normalizedUserBadges
          .filter((b) => b.unlockedAt)
          .slice(0, 3)
          .map((b) => ({
            id: `badge-${b.id}`,
            type: 'badge',
            payload: { badge: b },
            createdAt: b.unlockedAt || undefined,
          })),
        ...normalizedUserCollectibles
          .filter((c) => c.obtainedAt)
          .slice(0, 3)
          .map((c) => ({
            id: `collectible-${c.id}`,
            type: 'collectible',
            payload: { collectible: c },
            createdAt: c.obtainedAt || undefined,
          })),
      ];
      feed.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      setRecentMarks(feed.slice(0, 8));
      setLoadingGamification(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = await getToken();
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload avatar');
      const data = await response.json();
      const fullAvatarUrl = assetUrl(data.avatar);
      setAvatarUrl(fullAvatarUrl);
      updateUser({ profileImage: fullAvatarUrl, avatar: fullAvatarUrl });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error('Name is required');
      if (!explorerType) throw new Error('Please choose an explorer type');

      await updateProfile({ name: trimmedName });
      await updateExplorerType(explorerType);
      updateUser({ name: trimmedName, explorerType, explorer_type: explorerType });
      setEditMode(false);
      Alert.alert('Saved', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const explorerLabel = (key: string) => t(`profile.explorer.${key}`) || key;
  const currentExplorer = explorerType || 'warrior';

  const getMarkTitle = (item: { type: string; payload?: Record<string, unknown> }): string => {
    if (item.type === 'badge') {
      return ((item.payload?.badge as { name?: string } | undefined)?.name as string) || 'New badge';
    }
    if (item.type === 'collectible') {
      return ((item.payload?.collectible as { name?: string } | undefined)?.name as string) || 'New collectible';
    }
    return 'New achievement';
  };

  const renderExplorerOption = (type: string, selected: boolean) => {
    const profile = {
      warrior: { label: 'Warrior Explorer', Icon: '🛡️' },
      'nature-lover': { label: 'Nature Lover', Icon: '🌿' },
      'royal-historian': { label: 'Royal Historian', Icon: '👑' },
      'folktale-hunter': { label: 'Folktale Hunter', Icon: '⭐' },
      'music-explorer': { label: 'Music Explorer', Icon: '🎵' },
    }[type] || { label: type, Icon: '🧭' };

    return (
      <Pressable
        key={type}
        onPress={() => editMode && setExplorerType(type)}
        style={[
          styles.explorerOption,
          selected && styles.explorerOptionSelected,
        ]}
      >
        <Text style={styles.explorerOptionIcon}>{profile.Icon}</Text>
        <View style={styles.explorerOptionText}>
          <Text style={[styles.explorerOptionTitle, selected && styles.explorerOptionTitleSelected]}>
            {explorerLabel(type)}
          </Text>
          <Text style={styles.explorerOptionSubtitle}>{profile.label}</Text>
        </View>
        <Text style={styles.explorerOptionCheck}>{selected ? '✓' : profile.Icon}</Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          {/* Left Column */}
          <View style={styles.leftCol}>
            {/* ID Card */}
            <View style={styles.idCard}>
              <View style={styles.idCardBand} />
              <View style={styles.idCardBody}>
                <View style={styles.avatarContainer}>
                  <Pressable
                    onPress={() => fileInputRef.current?.click()}
                    style={styles.avatarButton}
                  >
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.avatarInitial, { color: colors.primaryDark }]}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {uploadingAvatar && (
                    <View style={styles.uploadingOverlay}>
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
                <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
                <View style={[styles.roleChip, { backgroundColor: colors.primarySoft }]}>
                  <Text style={styles.roleChipIcon}>🧭</Text>
                  <Text style={[styles.roleChipText, { color: colors.primaryDark }]}>
                    {currentExplorer ? explorerLabel(currentExplorer) : 'Explorer'}
                  </Text>
                </View>

                {/* XP Bar */}
                <View style={styles.xpWrap}>
                  <View style={styles.xpText}>
                    <Text style={styles.xpCurrent}>{xp}</Text>
                    <Text style={styles.xpSeparator}>/</Text>
                    <Text style={styles.xpRequired}>{user?.xpToNextLevel || 100}</Text>
                    <Text style={styles.xpLabel}>XP</Text>
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.levelBadgeText}>Level {level}</Text>
                    </View>
                  </View>
                  <View style={styles.xpBarTrack}>
                    <View style={[styles.xpBarFill, { width: `${Math.min(100, (xp / (user?.xpToNextLevel || 100)) * 100)}%` }]} />
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>{bestStreak}</Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>📅</Text>
                    <Text style={styles.statValue}>{totalDays}</Text>
                    <Text style={styles.statLabel}>Days</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Account Details</Text>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <Input
                  label=""
                  value={name}
                  onChangeText={setName}
                  editable={editMode}
                  placeholder="Your name"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Explorer Type</Text>
                {editMode ? (
                  <View style={styles.explorerPicker}>
                    {EXPLORERS.map((type) => renderExplorerOption(type, explorerType === type))}
                  </View>
                ) : (
                  <View style={[styles.explorerChip, { backgroundColor: colors.primarySoft }]}>
                    <Text style={[styles.explorerChipText, { color: colors.primaryDark }]}>
                      {currentExplorer ? explorerLabel(currentExplorer) : 'Explorer'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <Input
                  label=""
                  value={user?.email || ''}
                  editable={false}
                />
              </View>
              {editMode && (
                <View style={styles.buttonRow}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={() => {
                      setEditMode(false);
                      setName(user?.name || '');
                      setExplorerType(user?.explorerType || user?.explorer_type || '');
                    }}
                    style={styles.cancelButton}
                  />
                  <Button
                    label={saving ? 'Saving...' : 'Save'}
                    onPress={handleSave}
                    loading={saving}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightCol}>
            {/* Recent Marks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Marks</Text>
                <View style={[styles.sectionCount, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.sectionCountText, { color: colors.primaryDark }]}>
                    {recentMarks.length}
                  </Text>
                </View>
              </View>
              {recentMarks.length === 0 ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Your latest rewards will show here.
                  </Text>
                </Card>
              ) : (
                <View style={styles.marksList}>
                  {recentMarks.map((item) => (
                    <Card key={item.id} style={styles.markItem}>
                      <View style={[styles.markIcon, { backgroundColor: colors.primarySoft }]}>
                        <Text style={styles.markIconText}>
                          {item.type === 'badge' ? '🏅' : item.type === 'collectible' ? '💎' : '⭐'}
                        </Text>
                      </View>
                      <View style={styles.markBody}>
                        <Text style={styles.markTitle}>{getMarkTitle(item)}</Text>
                        <Text style={[styles.markSubtitle, { color: colors.textMuted }]}>
                          {item.type === 'badge'
                            ? 'This mark now shows on your profile.'
                            : item.type === 'collectible'
                              ? 'A new reward was added to your collection.'
                              : 'A fresh mark was added to your profile.'}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>

            {/* Badges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Badges</Text>
                <View style={[styles.sectionCount, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.sectionCountText, { color: colors.primaryDark }]}>
                    {userBadges.filter((b) => b.unlockedAt).length}/{badges.length}
                  </Text>
                </View>
              </View>
              {loadingGamification ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading badges...</Text>
                </Card>
              ) : badges.length === 0 ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No badges available yet.
                  </Text>
                </Card>
              ) : (
                <View style={styles.sectionGrid}>
                  {badges.map((badge) => {
                    const unlocked = !!userBadges.find((ub) => ub.id === badge.id && ub.unlockedAt);
                    const unlockedBadge = userBadges.find((ub) => ub.id === badge.id);
                    return (
                      <Card key={String(badge.id)} style={styles.gridCard}>
                        <View style={[styles.gridIcon, { backgroundColor: unlocked ? colors.primarySoft : colors.border }]}>
                          <Text style={styles.gridIconText}>
                            {badge.icon || badge.image_url ? '🏅' : '🔒'}
                          </Text>
                        </View>
                        <Text style={[styles.gridName, !unlocked && { color: colors.textMuted }]} numberOfLines={1}>
                          {badge.name}
                        </Text>
                        {unlocked && unlockedBadge?.unlockedAt ? (
                          <Text style={[styles.gridDate, { color: colors.textMuted }]}>
                            {new Date(unlockedBadge.unlockedAt).toLocaleDateString()}
                          </Text>
                        ) : null}
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Collectibles */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Collectibles</Text>
                <View style={[styles.sectionCount, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.sectionCountText, { color: colors.primaryDark }]}>
                    {userCollectibles.filter((c) => c.obtainedAt).length}/{collectibles.length}
                  </Text>
                </View>
              </View>
              {loadingGamification ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Loading collectibles...
                  </Text>
                </Card>
              ) : collectibles.length === 0 ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No collectibles available yet.
                  </Text>
                </Card>
              ) : (
                <View style={styles.sectionGrid}>
                  {collectibles.map((collectible) => {
                    const obtained = !!userCollectibles.find((uc) => uc.id === collectible.id && uc.obtainedAt);
                    const obtainedCollectible = userCollectibles.find((uc) => uc.id === collectible.id);
                    return (
                      <Card key={String(collectible.id)} style={styles.gridCard}>
                        <View style={[styles.gridIcon, { backgroundColor: obtained ? colors.primarySoft : colors.border }]}>
                          <Text style={styles.gridIconText}>
                            {collectible.icon || collectible.image_url ? '💎' : '🔒'}
                          </Text>
                        </View>
                        <Text style={[styles.gridName, !obtained && { color: colors.textMuted }]} numberOfLines={1}>
                          {collectible.name}
                        </Text>
                        {obtained && obtainedCollectible?.obtainedAt ? (
                          <Text style={[styles.gridDate, { color: colors.textMuted }]}>
                            {new Date(obtainedCollectible.obtainedAt).toLocaleDateString()}
                          </Text>
                        ) : null}
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  page: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  leftCol: {
    flex: 340,
    maxWidth: 340,
    gap: 16,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  idCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  idCardBand: {
    height: 84,
    backgroundColor: colors.primary,
  },
  idCardBody: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -48,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.bgCard,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bgCard,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  avatarHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  roleChip: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleChipIcon: {
    fontSize: 14,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpWrap: {
    width: '100%',
    marginTop: 20,
  },
  xpText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  xpCurrent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  xpSeparator: {
    fontSize: 14,
    color: colors.textMuted,
  },
  xpRequired: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 2,
  },
  levelBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  explorerPicker: {
    gap: 10,
  },
  explorerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.bgMain,
  },
  explorerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  explorerOptionIcon: {
    fontSize: 24,
    width: 42,
    height: 42,
    textAlign: 'center',
    lineHeight: 42,
  },
  explorerOptionText: {
    flex: 1,
  },
  explorerOptionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  explorerOptionTitleSelected: {
    color: colors.primaryDark,
  },
  explorerOptionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  explorerOptionCheck: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  explorerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  explorerChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '47%',
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconText: {
    fontSize: 24,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gridDate: {
    fontSize: 11,
    textAlign: 'center',
  },
  marksList: {
    gap: 12,
  },
  markItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  markIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markIconText: {
    fontSize: 20,
  },
  markBody: {
    flex: 1,
  },
  markTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  markSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});