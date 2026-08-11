import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { Screen } from '../../components/Screen';
import { Button, Chip, Input, Subtitle, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateSignup } from '../../utils/validation';
import { colors } from '../../theme/colors';
import type { ExplorerType } from '../../types';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const EXPLORERS: ExplorerType[] = [
  'warrior',
  'nature-lover',
  'royal-historian',
  'folktale-hunter',
  'music-explorer',
];

export default function SignupScreen({ navigation }: Props) {
  const { register, verifyEmail, resendOtp } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [explorerType, setExplorerType] = useState<ExplorerType>('folktale-hunter');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    const nextErrors = validateSignup({ name, email, password, confirmPassword });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, explorerType);
      setStep('otp');
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (otp.trim().length < 4) {
      Alert.alert(t('common.error'), 'Enter the verification code');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email.trim(), otp.trim());
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp(email.trim());
      Alert.alert('Sent', 'A new code was sent to your email.');
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Resend failed');
    }
  };

  if (step === 'otp') {
    return (
      <Screen>
        <Title>{t('auth.verifyEmail')}</Title>
        <Subtitle>
          {t('auth.enterCodeSentTo')} {email}
        </Subtitle>
        <Input
          label={t('auth.verificationCode')}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />
        <Button label={t('auth.confirmAccount')} onPress={onVerify} loading={loading} />
        <Button label={t('auth.resend')} variant="ghost" onPress={onResend} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{t('auth.signup.title')}</Title>
      <Subtitle>{t('auth.signup.subtitle')}</Subtitle>
      <Input label={t('auth.name')} value={name} onChangeText={setName} error={errors.name} />
      <Input
        label={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label={t('auth.password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Input
        label={t('auth.confirmPassword')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />
      <Text style={styles.label}>{t('auth.explorerType')}</Text>
      <View style={styles.chips}>
        {EXPLORERS.map((type) => (
          <Chip
            key={type}
            label={t(`explorer.${type}`)}
            active={explorerType === type}
            onPress={() => setExplorerType(type)}
          />
        ))}
      </View>
      <Button label={t('auth.signup.button')} onPress={onRegister} loading={loading} />
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>{t('auth.orContinueWith')}</Text>
        <View style={styles.line} />
      </View>
      <GoogleSignInButton disabled={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('auth.hasAccount')}</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          {t('auth.signIn')}
        </Text>
      </View>
      <Text style={styles.backHome} onPress={() => navigation.navigate('Landing')}>
        {t('auth.backToHome')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
