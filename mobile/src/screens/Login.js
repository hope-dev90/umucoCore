// Ported from web src/pages/Login.jsx.
// Web's fade/slide route-transition (opacity + translateY on unmount) has no
// direct RN equivalent since React Navigation handles screen transitions
// itself — the 250ms exit delay before navigating is kept so the timing
// feels the same, just without the CSS transition class.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginPage from '../components/LoginPage';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const navigation = useNavigation();

  // LoginPage handles its own ScrollView/KeyboardAvoidingView internally,
  // so this screen only supplies navigation wiring, not layout.
  const handleNavigate = (view) => {
    setTimeout(() => {
      if (view === 'signup') navigation.navigate('Signup');
      else if (view === 'home') navigation.navigate('Landing');
      else if (view === 'dashboard') navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }, 250);
  };

  return (
    <View style={styles.container}>
      <LoginPage onNavigate={handleNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
});
