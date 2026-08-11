import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGamification } from '../context/GamificationContext';
import { colors } from '../theme/colors';

/** RN equivalent of frontend RewardToastContainer */
export default function RewardToastContainer() {
  const { toasts, dismissToast } = useGamification();

  useEffect(() => {
    if (!toasts.length) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => dismissToast(latest.id), 3500);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  if (!toasts.length) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {toasts.slice(-3).map((toast) => {
        let title = '';
        let sub = '';
        if (toast.type === 'xp') {
          title = `+${toast.amount} XP`;
          sub = toast.reason || '';
        } else if (toast.type === 'levelUp') {
          title = `Level ${toast.level}`;
          sub = 'Level up';
        } else if (toast.type === 'badge') {
          title = toast.badge.name;
          sub = 'Badge unlocked';
        } else if (toast.type === 'streak') {
          title = `${toast.streak} day streak`;
          sub = toast.isNew ? 'Daily login' : '';
        }
        return (
          <Pressable key={toast.id} onPress={() => dismissToast(toast.id)} style={styles.toast}>
            <Text style={styles.title}>{title}</Text>
            {sub ? <Text style={styles.sub}>{sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 100,
  },
  toast: {
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: { color: colors.white, fontWeight: '800', fontSize: 14 },
  sub: { color: colors.primarySoft, marginTop: 2, fontSize: 12 },
});
