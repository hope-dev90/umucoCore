import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button, Chip, Input, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { changePassword } from '../../services/userService';
import { LANGUAGE_LABELS } from '../../utils/localization';
import { colors } from '../../theme/colors';
import type { LanguageCode } from '../../types';

const LANGS: LanguageCode[] = ['en', 'rw', 'fr'];

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { t, language, setLanguage, isSaving } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      Alert.alert(t('common.error'), 'Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Password updated successfully');
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const onLogout = () => {
    Alert.alert(t('settings.logout'), 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <Screen>
      <Title>{t('settings.title')}</Title>

      <Text style={styles.section}>{t('settings.language')}</Text>
      <View style={styles.chips}>
        {LANGS.map((code) => (
          <Chip
            key={code}
            label={LANGUAGE_LABELS[code]}
            active={language === code}
            onPress={() => setLanguage(code)}
          />
        ))}
      </View>
      {isSaving ? <Text style={styles.muted}>Saving language…</Text> : null}

      <Text style={styles.section}>{t('settings.password')}</Text>
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

      <Button label={t('settings.logout')} variant="danger" onPress={onLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muted: { color: colors.textMuted, fontSize: 12 },
});
