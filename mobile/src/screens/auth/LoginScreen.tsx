import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { Screen } from '../../components/Screen';
import { Button, Input, Subtitle, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateLogin } from '../../utils/validation';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, forgotPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const onSubmit = async () => {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      Alert.alert(
        t('auth.resetPassword'),
        result.message || 'If an account exists, a reset email was sent.'
      );
      setForgotMode(false);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>{forgotMode ? t('auth.resetPassword') : t('auth.login.title')}</Title>
      <Subtitle>
        {forgotMode ? t('auth.reset.emailLabel') : t('auth.login.subtitle')}
      </Subtitle>

      <Input
        label={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />

      {!forgotMode ? (
        <Input
          label={t('auth.password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
      ) : null}

      {forgotMode ? (
        <Button label={t('auth.reset.sendCode')} onPress={onForgot} loading={loading} />
      ) : (
        <>
          <Text style={styles.forgot} onPress={() => setForgotMode(true)}>
            {t('auth.forgotPassword')}
          </Text>
          <Button label={t('auth.login.button')} onPress={onSubmit} loading={loading} />
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>{t('auth.orContinueWith')}</Text>
            <View style={styles.line} />
          </View>
          <GoogleSignInButton disabled={loading} />
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup', {})}>
          {t('auth.signUp')}
        </Text>
      </View>
      <Text style={styles.backHome} onPress={() => navigation.navigate('Landing')}>
        {t('auth.backToHome')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgot: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: { color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '700' },
  backHome: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 10,
    fontWeight: '600',
  },
});
