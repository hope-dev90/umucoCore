import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Title } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import type { MoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

const LINKS: { labelKey: string; route: keyof MoreStackParamList; fallback: string }[] = [
  { labelKey: 'kwibuka.title', route: 'Kwibuka', fallback: 'Kwibuka' },
  { labelKey: 'testimonies.title', route: 'Testimonies', fallback: 'Testimonies' },
  { labelKey: 'intl.title', route: 'IntlDays', fallback: 'Intl Days' },
  { labelKey: 'videos.title', route: 'Videos', fallback: 'Videos' },
  { labelKey: 'contribute.title', route: 'Contribute', fallback: 'Contribute' },
  { labelKey: 'saved.title', route: 'Saved', fallback: 'Saved' },
  { labelKey: 'history.title', route: 'History', fallback: 'History' },
  { labelKey: 'profile.title', route: 'Profile', fallback: 'Profile' },
  { labelKey: 'settings.title', route: 'Settings', fallback: 'Settings' },
];

export default function MoreHomeScreen({ navigation }: Props) {
  const { t } = useLanguage();

  return (
    <Screen>
      <Title>{t('more.title')}</Title>
      <View style={styles.list}>
        {LINKS.map((link) => (
          <Pressable
            key={link.route}
            style={styles.row}
            onPress={() => navigation.navigate(link.route as any)}
          >
            <Text style={styles.label}>{t(link.labelKey) || link.fallback}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  chevron: { fontSize: 22, color: colors.textMuted },
});
