// Ported from web src/components/AuthPage.jsx (the sign-up flow).
// Same as LoginPage.js: the `hidden lg:block` LeftSlideshow never shows on
// mobile-width web either, so it's dropped here rather than reimplemented.
// Same 5 explorer types, same "pick your explorer" modal, same signup ->
// verify-email -> success flow, same resend-OTP cooldown timer. DOM
// paste-handling for the 6-digit code (clipboardData) has no RN
// equivalent without an extra native module, so it's simplified to typing
// each digit — auto-advance-by-typing still works the same way.
// localStorage.setItem('token', ...) on verify success becomes
// AsyncStorage.setItem('token', ...), matching how AuthContext.js's own
// login/register already store the token.
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
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check, ArrowRight } from 'lucide-react-native';
import UmucoLogo from './UmucoLogo';
import { UmucoGlyph } from './UmucoGlyphs';
import ExplorerTypeImage from './ExplorerTypeImage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiUrl } from '../config/api';
import { colors, fontFamily } from '../theme/colors';

// See LoginPage.js / App.js for why this is guarded — native module,
// unavailable in Expo Go.
let GoogleSignin = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  // Expected in Expo Go — handled in handleGoogleSignup below.
}

const EXPLORER_TYPES = [
  { id: 'warrior', label: 'Warrior', tagline: 'Battles, legends & brave deeds', adventureTitle: 'Ready your shield, Warrior', adventureSubtitle: 'Your saga begins the moment you sign up. Stories of courage, battle and honor await.', cta: 'Begin the Battle' },
  { id: 'nature-lover', label: 'Nature Lover', tagline: 'Forests, hills & wild places', adventureTitle: 'Step into the wild, Nature Lover', adventureSubtitle: "Rwanda's hills, forests and rivers are waiting to share their stories with you.", cta: 'Start the Trail' },
  { id: 'royal-historian', label: 'Royal Historian', tagline: 'Kings, courts & old dynasties', adventureTitle: 'Enter the royal court, Historian', adventureSubtitle: 'Centuries of kings, courts and dynasties are ready to be uncovered.', cta: 'Claim the Throne' },
  { id: 'folktale-hunter', label: 'Folktale Hunter', tagline: 'Myths, proverbs & fireside tales', adventureTitle: 'Follow the tale, Folktale Hunter', adventureSubtitle: 'Myths, proverbs and fireside stories are hidden throughout the archive, waiting to be found.', cta: 'Chase the Legend' },
  { id: 'music-explorer', label: 'Music Explorer', tagline: 'Rhythms, songs & instruments', adventureTitle: 'Follow the rhythm, Music Explorer', adventureSubtitle: 'Songs, instruments and rhythms passed down for generations are ready to be heard.', cta: 'Strike the First Note' },
];

const getExplorerCopy = (t, id, fallback = {}) => ({
  label: t(`explorer.${id}.label`) || fallback.label,
  tagline: t(`explorer.${id}.tagline`) || fallback.tagline,
  adventureTitle: t(`auth.explorer.${id}.title`) || fallback.adventureTitle,
  adventureSubtitle: t(`auth.explorer.${id}.subtitle`) || fallback.adventureSubtitle,
  cta: t(`auth.explorer.${id}.cta`) || fallback.cta,
});

function ExplorerTypeModal({ visible, onContinue }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalKicker}>{t('auth.explorer.kicker')}</Text>
              <Text style={styles.modalTitle}>{t('explorerPicker.title')}</Text>
              <Text style={styles.modalSubtitle}>{t('auth.explorer.subtitle')}</Text>
            </View>

            <View style={styles.modalOptions}>
              {EXPLORER_TYPES.map((type) => {
                const isSelected = selected === type.id;
                const copy = getExplorerCopy(t, type.id, type);
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setSelected(type.id)}
                    style={[styles.explorerOption, isSelected && styles.explorerOptionSelected]}
                  >
                    <ExplorerTypeImage type={type.id} label={copy.label} selected={isSelected} size={42} />
                    <View style={styles.explorerOptionText}>
                      <Text style={styles.explorerOptionLabel}>{copy.label}</Text>
                      <Text style={styles.explorerOptionTagline}>{copy.tagline}</Text>
                    </View>
                    <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              disabled={!selected}
              onPress={() => onContinue(selected)}
              style={[styles.modalContinueButton, !selected && { opacity: 0.5 }]}
            >
              <Text style={styles.modalContinueText}>{t('auth.continue')}</Text>
              <ArrowRight size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function VerificationNotice({ visible, email }) {
  const { t } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.noticeOverlay}>
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Mail size={20} color={colors.brown} />
          </View>
          <Text style={styles.noticeTitle}>{t('auth.checkEmail')}</Text>
          <Text style={styles.noticeBody}>
            {t('auth.receiveVerificationCode')}
            {email ? <Text style={styles.noticeEmail}> at {email}</Text> : null}.
          </Text>
          <View style={styles.noticeLoadingRow}>
            <ActivityIndicator size="small" color={colors.brown} />
            <Text style={styles.noticeLoadingText}>{t('auth.sendingCode')}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SignUpPage({ onNavigate }) {
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerType, setExplorerType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', termsAccepted: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const { register, googleLogin, updateUser } = useAuth();
  const { t } = useLanguage();

  const selectedExplorer = EXPLORER_TYPES.find((type) => type.id === explorerType) || null;
  const selectedExplorerCopy = selectedExplorer ? getExplorerCopy(t, selectedExplorer.id, selectedExplorer) : null;

  const handleExplorerContinue = (typeId) => {
    setExplorerType(typeId);
    setShowExplorerModal(false);
  };

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

  const handleSignUpSubmit = async () => {
    setIsLoading(true);
    setShowVerificationNotice(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, explorerType);
      setIsVerifying(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowVerificationNotice(false);
    }
  };

  const handleCodeSubmit = async () => {
    setIsLoading(true);
    setError('');
    const code = verificationCode.join('');
    try {
      const response = await fetch(apiUrl('/auth/verify-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');

      if (data.token && data.user) {
        await AsyncStorage.setItem('token', data.token);
        const userToSet = { ...data.user, explorerType: data.user.explorerType || explorerType };
        updateUser(userToSet);
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      await googleLogin(idToken);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    const explorerInfo = EXPLORER_TYPES.find((type) => type.id === explorerType);
    const explorerCopy = explorerInfo ? getExplorerCopy(t, explorerInfo.id, explorerInfo) : null;
    return (
      <View style={styles.successScreen}>
        <View style={styles.successContent}>
          <UmucoLogo style={{ width: 90, height: 90 }} />

          {explorerInfo && (
            <View style={styles.explorerBadge}>
              <ExplorerTypeImage type={explorerInfo.id} label={explorerCopy.label} size={24} />
              <Text style={styles.explorerBadgeText}>{explorerCopy.label}</Text>
            </View>
          )}

          <Text style={styles.successTitle}>{explorerInfo ? explorerCopy.adventureTitle : t('auth.youreIn')}</Text>
          <Text style={styles.successWelcome}>
            {t('auth.welcomeTo')} <Text style={styles.successName}>{formData.name}</Text>.
          </Text>
          <Text style={styles.successSubtitle}>
            {explorerInfo ? explorerCopy.adventureSubtitle : t('auth.yourGatewayReady')}
          </Text>

          <View style={styles.xpBadge}>
            <UmucoGlyph type="spark" size={18} color={colors.white} />
            <Text style={styles.xpBadgeText}>{t('auth.explorerUnlocked')}</Text>
          </View>

          <TouchableOpacity style={styles.enterButton} onPress={() => onNavigate('dashboard')}>
            <Text style={styles.enterButtonText}>
              {explorerInfo ? `${explorerCopy.cta} ->` : t('auth.enterArchive')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => onNavigate('home')}>
            <Text style={styles.homeButtonText}>{t('auth.backToHome')}</Text>
          </TouchableOpacity>

          <Text style={styles.preservingText}>{t('auth.success.preservingText')}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <VerificationNotice visible={showVerificationNotice && !isVerifying} email={formData.email} />
      <ExplorerTypeModal visible={showExplorerModal} onContinue={handleExplorerContinue} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('home')}>
            <ArrowLeft size={16} color={colors.brown} />
            <Text style={styles.backButtonText}>{t('auth.backToHome')}</Text>
          </TouchableOpacity>
          <UmucoLogo style={{ width: 44, height: 44 }} />
        </View>

        <View style={styles.formWrap}>
          {!isVerifying ? (
            <>
              <View style={styles.headingBlock}>
                <TouchableOpacity style={styles.explorerPickButton} onPress={() => setShowExplorerModal(true)}>
                  {selectedExplorer ? (
                    <View style={styles.explorerBadgeInline}>
                      <ExplorerTypeImage type={selectedExplorer.id} label={selectedExplorerCopy.label} size={22} />
                      <Text style={styles.explorerBadgeInlineText}>{selectedExplorerCopy.label}</Text>
                    </View>
                  ) : (
                    <Text style={styles.explorerPickText}>{t('auth.explorer.kicker')}</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.heading}>
                  {selectedExplorer ? selectedExplorerCopy.adventureTitle : t('auth.createAccount')}
                </Text>
                <Text style={styles.subheading}>
                  {selectedExplorer ? selectedExplorerCopy.adventureSubtitle : t('auth.setUpProfile')}
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <View style={styles.errorIcon}>
                    <UmucoGlyph type="shield" size={16} color="#6b3e26" />
                  </View>
                  <View style={styles.errorTextWrap}>
                    <Text style={styles.errorTitle}>
                      {error.toLowerCase().includes('already exists') ? 'Account already exists' : 'Something went wrong'}
                    </Text>
                    <Text style={styles.errorBody}>{error}</Text>
                    {error.toLowerCase().includes('already exists') && (
                      <Text style={styles.errorLink} onPress={() => onNavigate('login')}>
                        <Text style={styles.errorLinkBold}>Sign in instead</Text>
                      </Text>
                    )}
                  </View>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('auth.labelFullName')}</Text>
                <View style={styles.inputWrap}>
                  <User size={16} color={colors.stone} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(v) => setFormData((p) => ({ ...p, name: v }))}
                    placeholder={t('auth.placeholder.name')}
                    placeholderTextColor="#a3a3a3"
                  />
                </View>
              </View>

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
                <Text style={styles.label}>{t('auth.labelPassword')}</Text>
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
                style={styles.termsRow}
                onPress={() => setFormData((p) => ({ ...p, termsAccepted: !p.termsAccepted }))}
              >
                <View style={[styles.checkbox, formData.termsAccepted && styles.checkboxChecked]}>
                  {formData.termsAccepted && <Check size={12} color={colors.white} />}
                </View>
                <Text style={styles.termsText}>
                  {t('auth.agreePrefix')} <Text style={styles.termsLink}>{t('auth.termsLink')}</Text> {t('auth.agreeAnd')} <Text style={styles.termsLink}>{t('auth.privacyLink')}</Text>.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                disabled={isLoading || !formData.termsAccepted}
                onPress={handleSignUpSubmit}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {selectedExplorer ? selectedExplorerCopy.cta : t('auth.signUp')}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup} disabled={isLoading}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <Text style={styles.hasAccountText}>
                {t('auth.hasAccount')}{' '}
                <Text style={styles.hasAccountLink} onPress={() => onNavigate('login')}>
                  {t('auth.signIn')}
                </Text>
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsVerifying(false)} style={{ marginBottom: 20 }}>
                <Text style={styles.backButtonText}>{t('auth.backToSignup')}</Text>
              </TouchableOpacity>

              <Text style={styles.heading}>{t('auth.verifyEmail')}</Text>
              <Text style={[styles.subheading, { marginBottom: 24 }]}>
                {t('auth.enterCodeSentTo')} <Text style={styles.successName}>{formData.email}</Text>.
              </Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <View style={styles.errorIcon}>
                    <Mail size={16} color="#6b3e26" />
                  </View>
                  <View style={styles.errorTextWrap}>
                    <Text style={styles.errorTitle}>Verification failed</Text>
                    <Text style={styles.errorBody}>{error}</Text>
                  </View>
                </View>
              ) : null}

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

              <TouchableOpacity style={styles.submitButton} onPress={handleCodeSubmit} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.submitButtonText}>{t('auth.confirmAccount')}</Text>}
              </TouchableOpacity>

              <Text style={styles.resendText}>
                {t('auth.didntReceive')}{' '}
                <Text
                  style={[styles.hasAccountLink, (resendCooldown > 0 || resendLoading) && { opacity: 0.5 }]}
                  onPress={resendCooldown > 0 || resendLoading ? undefined : handleResendOtp}
                >
                  {resendLoading ? t('auth.sending') : resendCooldown > 0 ? t('auth.resendIn').replace('{seconds}', resendCooldown) : t('auth.resendOtp')}
                </Text>
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ivory },
  scrollContent: { flexGrow: 1, padding: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButtonText: { fontSize: 12, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  formWrap: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  headingBlock: { marginBottom: 20 },
  explorerPickButton: { alignSelf: 'flex-start', marginBottom: 10 },
  explorerPickText: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 1 },
  explorerBadgeInline: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(141,73,58,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  explorerBadgeInlineText: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 1 },
  heading: { fontSize: 24, fontFamily: fontFamily.sansBold, color: colors.brown, marginBottom: 8 },
  subheading: { fontSize: 13, fontFamily: fontFamily.sans, color: colors.taupe },
  errorBanner: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e8dcd0', backgroundColor: colors.white, marginBottom: 16 },
  errorIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8dcd0', alignItems: 'center', justifyContent: 'center' },
  errorTextWrap: { flex: 1 },
  errorTitle: { fontSize: 12, fontFamily: fontFamily.sansBold, color: '#4b2e1e', marginBottom: 2 },
  errorBody: { fontSize: 12, fontFamily: fontFamily.sans, color: '#6b4c3b', lineHeight: 17 },
  errorLink: { fontSize: 11, fontFamily: fontFamily.sans, color: '#8a6a58', marginTop: 4 },
  errorLinkBold: { fontFamily: fontFamily.sansBold, color: '#6b3e26' },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.espresso, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cream, borderRadius: 12, paddingLeft: 38, paddingRight: 14, paddingVertical: 12, fontSize: 13, color: colors.espresso, fontFamily: fontFamily.sans },
  eyeButton: { position: 'absolute', right: 12 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 20 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.sand, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: colors.brown, borderColor: colors.brown },
  termsText: { flex: 1, fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, lineHeight: 17 },
  termsLink: { fontFamily: fontFamily.sansMedium, color: colors.brown },
  submitButton: { backgroundColor: colors.brown, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cream },
  dividerText: { fontSize: 11, fontFamily: fontFamily.sans, color: colors.taupe, marginHorizontal: 12 },
  googleButton: { borderWidth: 1, borderColor: colors.cream, borderRadius: 30, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.white },
  googleButtonText: { fontSize: 13, fontFamily: fontFamily.sansMedium, color: colors.espresso },
  hasAccountText: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, marginTop: 20, textAlign: 'center' },
  hasAccountLink: { fontFamily: fontFamily.sansBold, color: colors.brown },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  codeInput: { width: 44, height: 48, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cream, borderRadius: 12, fontSize: 16, fontFamily: fontFamily.sansBold, color: colors.espresso },
  resendText: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, marginTop: 16, textAlign: 'center' },
  // Explorer modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(44,26,20,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 420, maxHeight: '85%', backgroundColor: colors.ivory, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(234,219,200,0.6)', overflow: 'hidden' },
  modalHeader: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8, alignItems: 'center' },
  modalKicker: { fontSize: 10, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontFamily: fontFamily.sansBold, color: colors.espresso, marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, textAlign: 'center' },
  modalOptions: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  explorerOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(234,219,200,0.8)' },
  explorerOptionSelected: { backgroundColor: 'rgba(141,73,58,0.10)', borderWidth: 2, borderColor: colors.brown },
  explorerOptionText: { flex: 1 },
  explorerOptionLabel: { fontSize: 13, fontFamily: fontFamily.sansBold, color: colors.espresso },
  explorerOptionTagline: { fontSize: 11, fontFamily: fontFamily.sans, color: colors.taupe },
  radioDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#D9C6BC' },
  radioDotSelected: { backgroundColor: colors.brown, borderColor: colors.brown },
  modalFooter: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  modalContinueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.brown, borderRadius: 12, paddingVertical: 14 },
  modalContinueText: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  // Verification notice
  noticeOverlay: { flex: 1, backgroundColor: 'rgba(44,26,20,0.28)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  noticeCard: { width: '100%', maxWidth: 340, backgroundColor: colors.ivory, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(234,219,200,0.9)', padding: 24, alignItems: 'center' },
  noticeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(141,73,58,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  noticeTitle: { fontSize: 15, fontFamily: fontFamily.sansBold, color: colors.espresso, marginBottom: 8 },
  noticeBody: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, textAlign: 'center', lineHeight: 18 },
  noticeEmail: { fontFamily: fontFamily.sansSemiBold, color: colors.espresso },
  noticeLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  noticeLoadingText: { fontSize: 11, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 1 },
  // Success screen
  successScreen: { flex: 1, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successContent: { alignItems: 'center' },
  explorerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(141,73,58,0.10)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 16, marginBottom: 16 },
  explorerBadgeText: { fontSize: 11, fontFamily: fontFamily.sansBold, color: colors.brown, textTransform: 'uppercase', letterSpacing: 1 },
  successTitle: { fontSize: 26, fontFamily: fontFamily.sansBold, color: colors.espresso, textAlign: 'center', marginBottom: 8, lineHeight: 32 },
  successWelcome: { fontSize: 13, fontFamily: fontFamily.sans, color: colors.taupe, textAlign: 'center', marginBottom: 4 },
  successName: { fontFamily: fontFamily.sansSemiBold, color: colors.espresso },
  successSubtitle: { fontSize: 12, fontFamily: fontFamily.sans, color: 'rgba(141,73,58,0.7)', textAlign: 'center', marginBottom: 12 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.brown, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 32 },
  xpBadgeText: { fontSize: 11, fontFamily: fontFamily.sansBold, color: colors.white },
  enterButton: { width: '100%', backgroundColor: colors.brown, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  enterButtonText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.white },
  homeButton: { width: '100%', borderWidth: 1, borderColor: colors.cream, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  homeButtonText: { fontSize: 11, fontFamily: fontFamily.sansMedium, color: colors.taupe },
  preservingText: { fontSize: 9, fontFamily: fontFamily.sansBold, color: 'rgba(141,73,58,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 32 },
});

export default SignUpPage;