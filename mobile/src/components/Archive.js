// Ported from web src/components/Archive.jsx.
// Same 3 collection cards, same copy, same "view all" action — CSS grid
// swapped for a simple column stack (RN has no responsive grid here).
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight, History, Landmark, Music } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, fontFamily } from '../theme/colors';

function DigitalArchive({ onNavigate }) {
  const { t } = useLanguage();

  const collections = [
    { title: t('archive.collection1.title'), desc: t('archive.collection1.desc'), Icon: History },
    { title: t('archive.collection2.title'), desc: t('archive.collection2.desc'), Icon: Landmark },
    { title: t('archive.collection3.title'), desc: t('archive.collection3.desc'), Icon: Music },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('archive.title')}</Text>
          <Text style={styles.description}>{t('archive.description')}</Text>
        </View>
        <TouchableOpacity style={styles.viewAll} onPress={() => onNavigate?.('collections')}>
          <Text style={styles.viewAllText}>{t('archive.viewAll')}</Text>
          <ArrowRight size={14} color={colors.brown} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {collections.map((item, index) => {
          const { Icon } = item;
          return (
            <View key={index} style={styles.card}>
              <View>
                <View style={styles.cardIcon}>
                  <Icon size={20} color={colors.brown} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
              <View style={styles.cardBar} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    backgroundColor: colors.ivory,
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(234,219,200,0.4)',
  },
  headerRow: { marginBottom: 24 },
  headerText: { marginBottom: 8 },
  title: { fontSize: 24, fontFamily: fontFamily.sansBold, color: colors.brown, marginBottom: 8 },
  description: { fontSize: 13, fontFamily: fontFamily.sans, color: colors.taupe, lineHeight: 20 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  viewAllText: { fontSize: 13, fontFamily: fontFamily.sansSemiBold, color: colors.brown },
  grid: { gap: 16 },
  card: {
    backgroundColor: 'rgba(252,223,211,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.3)',
    borderRadius: 4,
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: 'rgba(252,223,211,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(234,219,200,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontFamily: fontFamily.sansBold, color: colors.espresso, marginBottom: 8 },
  cardDesc: { fontSize: 12, fontFamily: fontFamily.sans, color: colors.taupe, lineHeight: 18 },
  cardBar: { width: 32, height: 4, backgroundColor: 'rgba(141,73,58,0.3)', borderRadius: 2, marginTop: 16 },
});

export default DigitalArchive;
