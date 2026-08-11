import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { Button, Chip, Input, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  changePassword,
  deactivateAccount,
  deleteAccount,
  exportUserData,
  fetchSessions,
  updateAccessibility,
  updateNotifications,
} from '../../services/userService';
import { SUPPORTED_LANGUAGES } from '../../utils/localization';
import { colors } from '../../theme/colors';
import type { LanguageCode } from '../../types';

const LANG_KEYS: Record<LanguageCode, string> = {
  en: 'settings.english',
  rw: 'settings.kinyarwanda',
  fr: 'settings.french',
};

export default function SettingsScreen() {
  const { user, updateUser, logout } = useAuth();
  const { t, language, setLanguage, isSaving } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savingA11y, setSavingA11y] = useState(false);
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [busy, setBusy] = useState('');

  const [notifArchive, setNotifArchive] = useState(user?.notifications?.archiveUpdates ?? true);
  const [notifNews, setNotifNews] = useState(user?.notifications?.newsletter ?? false);
  const [notifEvents, setNotifEvents] = useState(user?.notifications?.eventReminders ?? true);
  const [highContrast, setHighContrast] = useState(user?.accessibility?.highContrast ?? false);
  const [reducedMotion, setReducedMotion] = useState(user?.accessibility?.reduceMotion ?? false);
  const [fontSize, setFontSize] = useState(user?.accessibility?.fontSize ?? 50);
  const [voice, setVoice] = useState(user?.accessibility?.voice ?? 0);

  useEffect(() => {
    fetchSessions().then(setSessions);
  }, []);

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      Alert.alert(t('common.error'), t('settings.changePassword.desc'));
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert(t('settings.changePassword'), t('settings.password'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSavingPassword(false);
    }
  };

  const onSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      const notifications = {
        archiveUpdates: notifArchive,
        newsletter: notifNews,
        eventReminders: notifEvents,
      };
      await updateNotifications(notifications);
      updateUser({ notifications });
      Alert.alert(t('settings.notifications'), t('settings.archiveUpdates.desc'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSavingNotifs(false);
    }
  };

  const onSaveAccessibility = async () => {
    setSavingA11y(true);
    try {
      const accessibility = {
        fontSize,
        highContrast,
        reduceMotion: reducedMotion,
        voice,
        dateFormat: user?.accessibility?.dateFormat || 'DD / MM / YYYY',
        timezone: user?.accessibility?.timezone || 'CAT',
      };
      await updateAccessibility(accessibility);
      updateUser({ accessibility });
      Alert.alert(t('settings.accessibility'), t('settings.saveAccessibility'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSavingA11y(false);
    }
  };

  const onExport = async () => {
    setBusy('export');
    try {
      const data = await exportUserData();
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: t('settings.dataDownload'),
      });
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy('');
    }
  };

  const onDeactivate = () => {
    Alert.alert(t('settings.deactivate'), t('settings.dangerZone.desc'), [
      { text: t('settings.view'), style: 'cancel' },
      {
        text: t('settings.deactivate'),
        style: 'destructive',
        onPress: async () => {
          setBusy('deactivate');
          try {
            await deactivateAccount();
            await logout();
          } catch (err) {
            Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
          } finally {
            setBusy('');
          }
        },
      },
    ]);
  };

  const onDelete = () => {
    if (!deletePassword) {
      Alert.alert(t('common.error'), t('settings.currentPassword'));
      return;
    }
    Alert.alert(t('settings.delete'), t('settings.dangerZone.desc'), [
      { text: t('settings.view'), style: 'cancel' },
      {
        text: t('settings.delete'),
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          try {
            await deleteAccount(deletePassword);
            await logout();
          } catch (err) {
            Alert.alert(t('common.error'), err instanceof Error ? err.message : t('common.error'));
          } finally {
            setBusy('');
          }
        },
      },
    ]);
  };

  const onLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.dangerZone.desc'), [
      { text: t('settings.view'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <Title>{t('settings.title')}</Title>
      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

      <Text style={styles.section}>{t('settings.language')}</Text>
      <View style={styles.chips}>
        {SUPPORTED_LANGUAGES.map((code: LanguageCode) => (
          <Chip
            key={code}
            label={t(LANG_KEYS[code])}
            active={language === code}
            onPress={() => setLanguage(code)}
          />
        ))}
      </View>
      {isSaving ? <Text style={styles.muted}>{t('common.loading')}</Text> : null}

      <Text style={styles.section}>{t('settings.notifications')}</Text>
      <ToggleRow
        label={t('settings.archiveUpdates')}
        value={notifArchive}
        onValueChange={setNotifArchive}
      />
      <ToggleRow label={t('settings.newsletter')} value={notifNews} onValueChange={setNotifNews} />
      <ToggleRow
        label={t('settings.dayReminders')}
        value={notifEvents}
        onValueChange={setNotifEvents}
      />
      <Button
        label={t('settings.manage')}
        onPress={onSaveNotifications}
        loading={savingNotifs}
        variant="secondary"
      />

      <Text style={styles.section}>{t('settings.accessibility')}</Text>
      <ToggleRow
        label={t('settings.highContrast')}
        value={highContrast}
        onValueChange={setHighContrast}
      />
      <ToggleRow
        label={t('settings.reducedMotion')}
        value={reducedMotion}
        onValueChange={setReducedMotion}
      />
      <Text style={styles.muted}>
        {t('settings.fontSize')}: {fontSize}
      </Text>
      <View style={styles.chips}>
        {[30, 50, 70].map((size) => (
          <Chip
            key={size}
            label={String(size)}
            active={fontSize === size}
            onPress={() => setFontSize(size)}
          />
        ))}
      </View>
      <Text style={styles.muted}>{t('settings.voiceSelection')}</Text>
      <View style={styles.chips}>
        {[0, 1, 2].map((id) => (
          <Chip
            key={id}
            label={String(id + 1)}
            active={voice === id}
            onPress={() => setVoice(id)}
          />
        ))}
      </View>
      <Button
        label={t('settings.saveAccessibility')}
        onPress={onSaveAccessibility}
        loading={savingA11y}
        variant="secondary"
      />

      <Text style={styles.section}>{t('settings.changePassword')}</Text>
      <Input
        label={t('settings.currentPassword')}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <Input
        label={t('settings.newPassword')}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Button
        label={t('settings.savePassword')}
        onPress={onChangePassword}
        loading={savingPassword}
      />

      <Text style={styles.section}>{t('settings.activeSessions')}</Text>
      <Text style={styles.muted}>
        {t('settings.activeSessions.desc')} ({sessions.length})
      </Text>

      <Text style={styles.section}>{t('settings.dataDownload')}</Text>
      <Button
        label={t('settings.dataDownload')}
        variant="secondary"
        onPress={onExport}
        loading={busy === 'export'}
      />

      <Text style={styles.section}>{t('settings.dangerZone')}</Text>
      <Button
        label={t('settings.deactivate')}
        variant="secondary"
        onPress={onDeactivate}
        loading={busy === 'deactivate'}
      />
      <Input
        label={t('settings.currentPassword')}
        secureTextEntry
        value={deletePassword}
        onChangeText={setDeletePassword}
      />
      <Button
        label={t('settings.delete')}
        variant="danger"
        onPress={onDelete}
        loading={busy === 'delete'}
      />

      <Button label={t('settings.logout')} variant="danger" onPress={onLogout} />
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={() => onValueChange(!value)}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textSecondary, marginBottom: 4 },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muted: { color: colors.textMuted, fontSize: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleLabel: { color: colors.textPrimary, fontWeight: '600', flex: 1, paddingRight: 12 },
});
