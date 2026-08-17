import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function Muted({ children, style, ...props }: React.ComponentProps<typeof Text> & { style?: TextStyle }) {
  return <Text style={[styles.muted, style]} {...props}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'soft' | 'xp';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const getBg = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.primarySoft;
      case 'danger': return colors.danger;
      case 'xp': return '#FEF3C7';
      case 'outline':
      case 'ghost':
      default: return 'transparent';
    }
  };

  const getFg = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.white;
      case 'xp': return '#92400E';
      case 'soft':
      case 'secondary': return colors.primaryDark;
      case 'outline':
      case 'ghost':
      default: return colors.primary;
    }
  };

  const bg = getBg();
  const fg = getFg();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled || loading ? 0.55 : pressed ? 0.88 : 1 },
        (variant === 'ghost' || variant === 'outline') && styles.buttonGhost,
        variant === 'xp' && { borderWidth: 1, borderColor: '#F6D860' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonRow}>
          {leftIcon ? <Ionicons name={leftIcon} size={16} color={fg} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.buttonLabel, { color: fg }, textStyle]}>{label}</Text>
          {rightIcon ? <Ionicons name={rightIcon} size={16} color={fg} style={{ marginLeft: 6 }} /> : null}
        </View>
      )}
    </Pressable>
  );
}

export function Input({
  label,
  error,
  style,
  inputStyle,
  ...props
}: TextInputProps & { label?: string; error?: string; style?: ViewStyle; inputStyle?: TextStyle }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          props.multiline ? { minHeight: 110, textAlignVertical: 'top' } : null,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
  elevated,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  return <View style={[styles.card, elevated && styles.cardElevated, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statPill}>
      {icon ? <Ionicons name={icon} size={22} color={colors.primary} style={{ marginBottom: 4 }} /> : null}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.sectionLinkWrap, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.sectionLink}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={12} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function OverlayBadge({
  children,
  variant = 'category',
  style,
}: {
  children: React.ReactNode;
  variant?: 'category' | 'xp' | 'status' | 'read' | 'audio';
  style?: ViewStyle;
}) {
  const getStyle = () => {
    switch (variant) {
      case 'xp': return styles.badgeXP;
      case 'status': return styles.badgeStatus;
      case 'read': return styles.badgeRead;
      case 'audio': return styles.badgeAudio;
      case 'category':
      default: return styles.badgeCategory;
    }
  };
  const getText = () => {
    switch (variant) {
      case 'xp': return styles.badgeXPText;
      case 'status': return styles.badgeStatusText;
      case 'read': return styles.badgeReadText;
      case 'audio': return styles.badgeAudioText;
      case 'category':
      default: return styles.badgeCategoryText;
    }
  };
  return (
    <View style={[getStyle(), style]}>
      <Text style={getText()}>{children}</Text>
    </View>
  );
}

export function KickerLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Column({ children, style, flex }: { children: React.ReactNode; style?: ViewStyle; flex?: number }) {
  return <View style={[styles.column, flex ? { flex } : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  muted: {
    fontSize: 12,
    color: colors.textMuted,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  button: {
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  inputWrap: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardElevated: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(141, 73, 58, 0.18)',
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextActive: {
    color: colors.white,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  sectionLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  badgeCategory: {
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  badgeCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  badgeXP: {
    backgroundColor: 'rgba(44, 26, 20, 0.82)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeXPText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fef3c7',
    letterSpacing: 0.3,
  },
  badgeStatus: {
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  badgeRead: {
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeReadText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2F6B3D',
  },
  badgeAudio: {
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeAudioText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
  },
});
