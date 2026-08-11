import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../config/auth';
import { colors } from '../theme/colors';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  disabled?: boolean;
};

export default function GoogleSignInButton({ disabled }: Props) {
  const { googleLogin } = useAuth();
  const { t } = useLanguage();
  const [busy, setBusy] = React.useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  useEffect(() => {
    const run = async () => {
      if (response?.type !== 'success') return;
      const idToken =
        response.params?.id_token ||
        (response as { authentication?: { idToken?: string } }).authentication?.idToken;
      if (!idToken) {
        Alert.alert(t('common.error'), t('auth.googleError'));
        return;
      }
      setBusy(true);
      try {
        await googleLogin(idToken);
      } catch (err) {
        Alert.alert(
          t('common.error'),
          err instanceof Error ? err.message : t('auth.googleError')
        );
      } finally {
        setBusy(false);
      }
    };
    run();
  }, [response, googleLogin, t]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!request || disabled || busy}
      onPress={() => promptAsync()}
      style={({ pressed }) => [
        styles.button,
        (pressed || busy || !request) && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors.primaryDark} />
      ) : (
        <View style={styles.row}>
          <Text style={styles.g}>G</Text>
          <Text style={styles.label}>{t('auth.google')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pressed: { opacity: 0.75 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  g: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '900',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});
