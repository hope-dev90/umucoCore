import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Soft atmospheric backdrop without requiring expo-linear-gradient */
export function LinearGradientPlaceholder() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  blobA: {
    width: 280,
    height: 280,
    backgroundColor: colors.primarySoft,
    top: -40,
    right: -60,
  },
  blobB: {
    width: 220,
    height: 220,
    backgroundColor: '#F5E6D8',
    top: 120,
    left: -80,
  },
  blobC: {
    width: 160,
    height: 160,
    backgroundColor: '#E8D4C4',
    bottom: 40,
    right: 20,
  },
});
