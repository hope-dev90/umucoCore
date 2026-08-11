import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
