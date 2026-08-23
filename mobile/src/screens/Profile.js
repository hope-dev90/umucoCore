import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// TODO (next phase): port web src/pages/Profile.jsx here.
// Auth, navigation, and API layers are already wired up — this screen
// just needs its real markup + backend calls carried over.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Screen not yet converted — coming in the next phase.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.darkBrown,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.taupe,
    textAlign: 'center',
  },
});
