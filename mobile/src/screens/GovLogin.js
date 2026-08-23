// Ported from web src/pages/GovLogin.jsx.
// The web version's own loading-spinner and "already logged in, redirect"
// guards are dropped here on purpose: AppNavigator.js already implements
// that exact logic once, at the navigator level (LoadingScreen while
// `loading`, and swapping AuthStack/AppStack/AdminStack based on `user`) —
// see the comment already in that file. Duplicating it per-screen would
// just be two copies of the same guard. Same LoginPage, same isGovLogin
// prop, same onLoginSuccess role-based routing.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginPage from '../components/LoginPage';
import { colors } from '../theme/colors';

export default function GovLoginScreen() {
  const navigation = useNavigation();

  const handleNavigate = (view) => {
    if (view === 'signup') navigation.navigate('Signup');
    else if (view === 'home') navigation.navigate('Landing');
    else if (view === 'login') navigation.navigate('Login');
    // 'dashboard' needs no explicit navigation: once AuthContext's `user`
    // is set, AppNavigator swaps AuthStack for AppStack/AdminStack itself.
  };

  const handleLoginSuccess = () => {
    // Same as web: AppNavigator's own stack-swap (based on user.role)
    // takes over from here once `user` updates.
  };

  return (
    <View style={styles.container}>
      <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} isGovLogin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
});
