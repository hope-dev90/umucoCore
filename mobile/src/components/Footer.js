// Ported from web src/components/Footer.jsx.
// Same newsletter-subscribe call to /api/contributions/subscribe, same
// explore/community link lists (as plain text rows — no client-side routing
// target for most of these on web either, they're informational), same
// legal row. CSS grid columns become stacked sections on mobile width.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Share2, MessageSquare, CheckCircle } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { apiUrl } from '../config/api';
import { colors, fontFamily } from '../theme/colors';

function Footer({ onNavigate }) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email || !email.includes('@')) {
      setError(language === 'rw' ? 'Injiza imeri yabo' : language === 'fr' ? 'Entrez votre email' : 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/contributions/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_email: email,
          contributor_name: email.split('@')[0],
          title: 'Newsletter Subscription',
          description: 'User subscribed to newsletter',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else if (data.error === 'already_subscribed') {
        setError(language === 'rw' ? 'Wiyandikishije kera!' : language === 'fr' ? 'Vous êtes déjà inscrit!' : 'You have already subscribed!');
      } else {
        setError(data.message || data.error || (language === 'rw' ? 'Byanze' : language === 'fr' ? 'Échec' : 'Subscription failed'));
      }
    } catch (err) {
      setError(language === 'rw' ? 'Habaye ikosa' : language === 'fr' ? 'Erreur' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.footer}>
      <View style={styles.topRow}>
        <View style={styles.brandCol}>
          <Text style={styles.brandTitle}>UmucoCore</Text>
          <Text style={styles.tagline}>{t('footer.tagline')}</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Share2 size={16} color="rgba(234,219,200,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MessageSquare size={16} color="rgba(234,219,200,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.linksCol}>
          <Text style={styles.colHeading}>{t('footer.explore')}</Text>
          <TouchableOpacity onPress={() => onNavigate?.('explore')}><Text style={styles.linkText}>{t('footer.exploreCulture')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('collections')}><Text style={styles.linkText}>{t('footer.kinyarwandaBasics')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('listen')}><Text style={styles.linkText}>{t('footer.oralTraditions')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('explore')}><Text style={styles.linkText}>{t('footer.virtualMuseum')}</Text></TouchableOpacity>
        </View>

        <View style={styles.linksCol}>
          <Text style={styles.colHeading}>{t('footer.community')}</Text>
          <TouchableOpacity onPress={() => onNavigate?.('contribute')}><Text style={styles.linkText}>{t('footer.joinDiscussions')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('intl-days')}><Text style={styles.linkText}>{t('footer.upcomingEvents')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('contribute')}><Text style={styles.linkText}>{t('footer.contributorProgram')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('contribute')}><Text style={styles.linkText}>{t('footer.partnerships')}</Text></TouchableOpacity>
        </View>

        <View style={styles.subscribeCol}>
          <Text style={styles.colHeading}>{t('footer.subscribe')}</Text>
          <Text style={styles.subscribeDesc}>{t('footer.subscribeDesc')}</Text>

          {subscribed ? (
            <View style={styles.subscribedBanner}>
              <CheckCircle size={18} color="#4ade80" />
              <Text style={styles.subscribedText}>
                {language === 'rw' ? 'Wiyandikishije neza!' : language === 'fr' ? 'Inscription réussie!' : 'Successfully subscribed!'}
              </Text>
            </View>
          ) : (
            <View style={styles.subscribeRow}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('footer.emailPlaceholder')}
                placeholderTextColor="rgba(234,219,200,0.5)"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.emailInput}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.sendButtonText}>{t('footer.send')}</Text>}
              </TouchableOpacity>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.copyright}>{t('footer.copyright')}</Text>
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => onNavigate?.('login')}><Text style={styles.legalText}>{t('footer.privacyPolicy')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('login')}><Text style={styles.legalText}>{t('footer.termsOfUse')}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('login')}><Text style={styles.legalText}>{t('footer.helpCenter')}</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { width: '100%', backgroundColor: colors.espressoAlt, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24 },
  topRow: { gap: 32, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  brandCol: {},
  brandTitle: { fontSize: 20, fontFamily: fontFamily.sansBold, color: colors.ivory, marginBottom: 12 },
  tagline: { fontSize: 13, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.6)', lineHeight: 20, marginBottom: 16, maxWidth: 320 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  linksCol: { gap: 10 },
  colHeading: { fontSize: 15, fontFamily: fontFamily.sansBold, color: colors.cream, marginBottom: 4 },
  linkText: { fontSize: 13, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.6)' },
  subscribeCol: {},
  subscribeDesc: { fontSize: 13, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.6)', marginBottom: 14 },
  subscribeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  emailInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.white,
    fontFamily: fontFamily.sans,
  },
  sendButton: { backgroundColor: colors.brown, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
  sendButtonText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.white },
  subscribedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subscribedText: { fontSize: 13, fontFamily: fontFamily.sansMedium, color: '#4ade80' },
  errorText: { fontSize: 11, fontFamily: fontFamily.sans, color: '#f87171', marginTop: 8 },
  bottomRow: { paddingTop: 20, gap: 16 },
  copyright: { fontSize: 11, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.4)' },
  legalRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  legalText: { fontSize: 11, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.4)' },
});

export default Footer;
