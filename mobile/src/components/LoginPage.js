// Ported from web src/components/LoginPage.jsx.
// One deliberate omission: the web LeftSlideshow panel is wrapped in
// `hidden lg:block` — it never renders at mobile viewport widths in the web
// app either, so on a phone-sized RN screen the faithful port is simply not
// rendering it, matching what a mobile-web visitor already sees today.
// Everything else — both auth flows (sign in / forgot password), all copy,
// all field validation, the same AuthContext calls — is preserved as-is.
// DOM code-input auto-advance (element.nextSibling/previousSibling) becomes
// a ref array, since RN has no DOM siblings. Google Sign-In uses
// @react-native-google-signin/google-signin (already a dependency) instead
// of @react-oauth/google, calling the same googleLogin(idToken) from
// AuthContext either way.
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react-native';
import UmucoLogo from './UmucoLogo';
import { UmucoGlyph } from './UmucoGlyphs';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiUrl } from '../config/api';
import { colors, fontFamily } from '../theme/colors';

// Guarded the same way as App.js: this native module isn't present in Expo
// Go, so requiring it there would throw before the screen even renders.
let GoogleSignin = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  // Expected in Expo Go — handled in handleGoogleLogin below.
}

function LoginPage({ onNavigate, onLoginSuccess, isGovLogin = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef([]);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleLogin } = useAuth();
  const { t, language } = useLanguage();

  const handleCodeChange = (value, index) => {
    if (value && isNaN(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (onLoginSuccess) onLoginSuccess(result.user);
      else onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      setError('Google Sign-In needs a dev build (not available in Expo Go). See App.js for setup steps.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      const result = await googleLogin(idToken);
      if (onLoginSuccess) onLoginSuccess(result.user);
      else onNavigate('dashboard');
    } catch (err) {
      setError(err.message || t('auth.googleError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send reset code');
      setVerificationStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = () => {
    if (verificationCode.join('').length === 6) setVerificationStep('success');
  };

  const welcomeTitle = isGovLogin
    ? (language === 'rw' ? 'Murakaza neza, Abakozi ba Leta' : language === 'fr' ? 'Bienvenue, personnel gouvernemental' : 'Welcome, Government Staff')
    : t('auth.welcomeBack');
  const welcomeSubtitle = isGovLogin
    ? (language === 'rw' ? "Injira ukoresheje konti yawe yemewe ya Leta." : language === 'fr' ? 'Connectez-vous avec vos identifiants gouvernementaux autorisés.' : 'Sign in with your authorized government credentials.')
    : t('auth.readyToAccess');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('home')}>
            <ArrowLeft size={16} color={colors.brown} />
            <Text style={styles.backButtonText}>{t('auth.backToHome')}</Text>
          </TouchableOpacity>
          <UmucoLogo style={{ width: 44, height: 44 }} />
        </View>

        {!isForgotPassword ? (
          <View style={styles.formWrap}>
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>{welcomeTitle}</Text>
              <Text style={styles.subheading}>{welcomeSubtitle}</Text>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorIcon}>
                  <UmucoGlyph type="shield" size={16} color="#6b3e26" />
                </View>
                <View style={styles.errorTextWrap}>
                  <Text style={styles.errorTitle}>
                    {error.toLowerCase().includes('no account') ? 'Account not found' : "Couldn't sign you in"}
                  </Text>
                  <Text style={styles.errorBody}>{error}</Text>
                  {error.toLowerCase().includes('no account') ? (
                    <Text style={styles.errorLink} onPress={() => onNavigate('signup')}>
                      Want to join? <Text style={styles.errorLinkBold}>Create an account</Text>
                    </Text>
                  ) : (
                    <Text
                      style={styles.errorLink}
                      onPress={() => { setIsForgotPassword(true); setVerificationStep('email'); setError(''); }}
                    >
                      Need help? <Text style={styles.errorLinkBold}>Reset your password</Text>
                    </Text>
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('auth.labelEmail')}</Text>
              <View style={styles.inputWrap}>
                <Mail size={16} color={colors.stone} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(v) => setFormData((p) => ({ ...p, email: v }))}
                  placeholder={t('auth.placeholder.email')}
                  placeholderTextColor="#a3a3a3"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t('auth.labelPassword')}</Text>
                <TouchableOpacity onPress={() => { setIsForgotPassword(true); setVerificationStep('email'); }}>
                  <Text style={styles.forgotLink}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Lock size={16} color={colors.stone} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 36 }]}
                  value={formData.password}
                  onChangeText={(v) => setFormData((p) => ({ ...p, password: v }))}
                  placeholder={t('auth.placeholder.password')}
                  placeholderTextColor="#a3a3a3"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={16} color={colors.stone} /> : <Eye size={16} color={colors.stone} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setFormData((p) => ({ ...p, rememberMe: !p.rememberMe }))}
            >
              <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
                {formData.rememberMe && <Check size={12} color={colors.white} />}
              </View>
              <Text style={styles.rememberText}>{t('auth.rememberMe')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} disabled={isLoading} onPress={handleLoginSubmit}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>{t('auth.signIn')}</Text>
              )}
            </TouchableOpacity>

            {!isGovLogin && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={isLoading}>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <Text style={styles.noAccountText}>
                  {t('auth.noAccount')}{' '}
                  <Text style={styles.noAccountLink} onPress={() => onNavigate('signup')}>
                    {t('auth.signUp')}
                  </Text>
                </Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.formWrap}>
            <TouchableOpacity style={styles.backToSignInButton} onPress={() => setIsForgotPassword(false)}>
              <ArrowLeft size={16} color={colors.brown} />
              <Text style={styles.backButtonText}>{t('auth.backToSignIn')}</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>{t('auth.resetPassword')}</Text>
            <Text style={[styles.subheading, { marginBottom: 24 }]}>
              {verificationStep === 'email' && t('auth.reset.emailLabel')}
              {verificationStep === 'code' && `${t('auth.enterCode')} ${resetEmail}.`}
              {verificationStep === 'success' && t('auth.reset.successLabel')}
            </Text>

            {verificationStep === 'email' && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('auth.labelEmail')}</Text>
                  <View style={styles.inputWrap}>
                    <Mail size={16} color={colors.stone} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      placeholder={t('auth.placeholder.email')}
                      placeholderTextColor="#a3a3a3"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleEmailSubmit} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.submitButtonText}>{t('auth.reset.sendCode')}</Text>}
                </TouchableOpacity>
              </>
            )}

            {verificationStep === 'code' && (
              <>
                <Text style={[styles.label, { textAlign: 'center', marginBottom: 12 }]}>{t('auth.verificationCode')}</Text>
                <View style={styles.codeRow}>
                  {verificationCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { codeInputRefs.current[index] = ref; }}
                      style={styles.codeInput}
                      value={digit}
                      onChangeText={(v) => handleCodeChange(v.slice(-1), index)}
                      onKeyPress={(e) => handleCodeKeyPress(e, index)}
                      maxLength={1}
                      keyboardType="number-pad"
                      textAlign="center"
                    />
                  ))}
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleCodeSubmit}>
                  <Text style={styles.submitButtonText}>{t('auth.reset.verifyCode')}</Text>
                </TouchableOpacity>
              </>
            )}

            {verificationStep === 'success' && (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <UmucoGlyph type="medal" size={26} color={colors.brown} />
                </View>
                <Text style={styles.successTitle}>{t('auth.success.identityVerified')}</Text>
                <Text style={styles.successDesc}>{t('auth.success.description')}</Text>
                <TouchableOpacity style={styles.submitButton} onPress={() => setIsForgotPassword(false)}>
                  <Text style={styles.submitButtonText}>{t('auth.reset.backLogin')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ivory },
  scrollContent: { flexGrow: 1, padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButtonText: { fontSize: 12, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  formWrap: { flex: 1, justifyContent: 'center', maxWidth: 400, width: '100%', alignSelf: 'center' },
  headingBlock: { marginBottom: 24 },
  heading: { fontSize: 26, fontFamily: fontFamily.sansBold, color: colors.brown, marginBottom: 8 },
  subheading: { fontSize: 13, fontFamily: fontFamily.sans, color: colors.taupe },
  errorBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dcd0',
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  errorIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8dcd0', alignItems: 'center', justifyContent: 'center' },
  errorTextWrap: { flex: 1 },
  errorTitle: { fontSize: 12, fontFamily: fontFamily.sansBold, color: '#4b2e1e', marginBottom: 2 },
  errorBody: { fontSize: 12, fontFamily: fontFamily.sans, color: '#6b4c3b', lineHeight: 17 },
  errorLink: { fontSize: 11, fontFamily: fontFamily.sans, color: '#8a6a58', marginTop: 4 },
  errorLinkBold: { fontFamily: fontFamily.sansBold, color: '#6b3e26' },
  fieldGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.espresso, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  forgotLink: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.brown },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.espresso,
    fontFamily: fontFamily.sans,
  },
  eyeButton: { position: 'absolute', right: 12 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.brown, borderColor: colors.brown },
  rememberText: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe },
  submitButton: { backgroundColor: colors.brown, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cream },
  dividerText: { fontSize: 11, fontFamily: fontFamily.sans, color: colors.taupe, marginHorizontal: 12 },
  googleButton: {
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  googleButtonText: { fontSize: 13, fontFamily: fontFamily.sansMedium, color: colors.espresso },
  noAccountText: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, marginTop: 20, textAlign: 'center' },
  noAccountLink: { fontFamily: fontFamily.sansBold, color: colors.brown },
  backToSignInButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  codeInput: {
    width: 44,
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cream,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: fontFamily.sansBold,
    color: colors.espresso,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(252,223,211,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.3)',
    borderRadius: 12,
    padding: 20,
  },
  successIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(141,73,58,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 14, fontFamily: fontFamily.sansBold, color: colors.brown, marginBottom: 4, textAlign: 'center' },
  successDesc: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
});

export default LoginPage;