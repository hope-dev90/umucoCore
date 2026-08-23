// Ported from web src/components/Community.jsx.
// Same proverb block + same "become a guardian" banner with the join photo,
// same two CTAs (contribute / dashboard). CSS var(--primary) resolves to
// the brand brown, same as everywhere else in this app's theme.
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Quote, FilePlus, ShieldAlert } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, fontFamily } from '../theme/colors';
import joinImg from '../assets/community/join.png';

function CommunityGuardian({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <View style={styles.wrap}>
      <View style={styles.quoteSection}>
        <Quote size={36} color="rgba(141,73,58,0.3)" style={{ marginBottom: 8 }} />
        <Text style={styles.proverb}>"Ababiri baruta umwe."</Text>
        <Text style={styles.proverbTranslation}>{t('community.proverbTranslation')}</Text>
        <Text style={styles.exploreWisdom}>{t('community.exploreWisdom')}</Text>
        <TouchableOpacity style={styles.createAccountButton} onPress={() => onNavigate('signup')}>
          <Text style={styles.createAccountText}>{t('community.createAccount')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.guardianSection}>
        <View style={styles.guardianCard}>
          <View style={styles.guardianImageWrap}>
            <Image source={joinImg} style={styles.guardianImage} />
            <View style={styles.guardianImageOverlay} />
          </View>
          <View style={styles.guardianTextWrap}>
            <Text style={styles.guardianTitle}>{t('community.becomeGuardian')}</Text>
            <Text style={styles.guardianDesc}>{t('community.joinNetwork')}</Text>
            <View style={styles.guardianActions}>
              <TouchableOpacity style={styles.contributeButton} onPress={() => onNavigate('signup')}>
                <FilePlus size={16} color={colors.brown} />
                <Text style={styles.contributeText}>{t('community.contribute')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dashboardButton} onPress={() => onNavigate('login')}>
                <ShieldAlert size={16} color="rgba(234,219,200,0.6)" />
                <Text style={styles.dashboardText}>{t('community.dashboard')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: colors.ivory },
  quoteSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(234,219,200,0.4)',
  },
  proverb: { fontSize: 22, fontFamily: fontFamily.sansBold, color: colors.brown, textAlign: 'center', marginBottom: 8 },
  proverbTranslation: { fontSize: 14, fontFamily: fontFamily.sansMedium, color: colors.brown, textAlign: 'center', marginBottom: 8 },
  exploreWisdom: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, fontStyle: 'italic', textAlign: 'center', maxWidth: 320, marginBottom: 24 },
  createAccountButton: { width: '100%', backgroundColor: colors.brown, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  createAccountText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.ivory },
  guardianSection: { paddingHorizontal: 20, paddingBottom: 40 },
  guardianCard: { borderRadius: 20, overflow: 'hidden', backgroundColor: colors.brown },
  guardianImageWrap: { height: 180, width: '100%', position: 'relative' },
  guardianImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  guardianImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(62,39,35,0.1)' },
  guardianTextWrap: { padding: 24 },
  guardianTitle: { fontSize: 24, fontFamily: fontFamily.sansBold, color: colors.ivory, marginBottom: 12, lineHeight: 30 },
  guardianDesc: { fontSize: 13, fontFamily: fontFamily.sans, color: 'rgba(234,219,200,0.8)', lineHeight: 20, marginBottom: 20 },
  guardianActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.peach,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contributeText: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.brown },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dashboardText: { fontSize: 12, fontFamily: fontFamily.sansBold, color: colors.ivory },
});

export default CommunityGuardian;
