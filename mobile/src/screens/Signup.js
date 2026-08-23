// Ported from web src/pages/Signup.jsx.
// Same route-state passthrough (continueStoryId, for "sign up to keep
// reading" from Discover) via React Navigation params instead of
// react-router's location.state.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SignUpPage from '../components/AuthPage';
import { colors } from '../theme/colors';

export default function SignupScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const handleNavigate = (view) => {
    setTimeout(() => {
      if (view === 'login') navigation.navigate('Login');
      else if (view === 'home') navigation.navigate('Landing');
      else if (view === 'dashboard') navigation.reset({ index: 0, routes: [{ name: 'Home', params: route.params }] });
    }, 250);
  };

  return (
    <View style={styles.container}>
      <SignUpPage onNavigate={handleNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
});
