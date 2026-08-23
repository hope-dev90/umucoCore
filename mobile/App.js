import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { GamificationProvider } from './src/contexts/GamificationContext';

import AppNavigator from './src/navigation/AppNavigator';
import RewardToastContainer from './src/components/RewardToastContainer';
import BadgeUnlockToast from './src/components/BadgeUnlockToast';
import ChatWidget from './src/components/ChatWidget';
import RiddlePopup from './src/components/RiddlePopup';

// RN equivalent of web App.jsx's <GoogleOAuthProvider clientId={...}>.
// @react-native-google-signin/google-signin is a NATIVE module — Expo Go
// only bundles Expo SDK modules, so requiring/configuring it there throws
// "TurboModuleRegistry.getEnforcing(...): 'RNGoogleSignin' could not be
// found" and crashes the whole app on launch. Guarding the import + the
// configure() call means the rest of the app (every screen not using
// Google Sign-In) still runs fine in Expo Go; tapping "Continue with
// Google" specifically needs a real dev build to work — see the two
// options below.
//
// To actually get Google Sign-In working:
//   Option A (fastest): npx expo prebuild && npx expo run:android
//     (or run:ios) — builds a local dev client with the native module
//     included, replacing Expo Go for this project from then on.
//   Option B: eas build --profile development --platform android
//     — same result via EAS Build, useful if you don't have Android
//     Studio / Xcode installed locally.
// Either way you also need google-services.json (Android) /
// GoogleService-Info.plist (iOS) from the Google Cloud / Firebase
// console, placed at the project root — that's one-time setup outside
// this codebase, not something to guess at here.
let GoogleSignin = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });
} catch (e) {
  console.warn('[GoogleSignin] native module not available (expected in Expo Go) — Google Sign-In is disabled until you run a dev build.');
}

// Same visibility rule as web App.jsx's ChatWidgetGate: only non-admin,
// logged-in users see the chat widget.
function ChatWidgetGate() {
  const { user } = useAuth();
  return user && user.role !== 'admin' ? <ChatWidget /> : null;
}

// Same visibility rule as web App.jsx's RiddlePopupGate.
function RiddlePopupGate() {
  const { user } = useAuth();
  return user && user.role !== 'admin' ? <RiddlePopup /> : null;
}

export default function App() {
  // Poppins is used everywhere via src/theme/colors.js's fontFamily map, but
  // RN doesn't auto-load font packages — without this hook every Text style
  // silently falls back to the system font and logs a
  // '"Poppins_700Bold" is not a system font' warning on every screen.
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFBF7' }}>
        <ActivityIndicator size="large" color="#8D493A" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <GamificationProvider>
            <LanguageProvider>
              <StatusBar style="dark" />
              <AppNavigator />
              <RewardToastContainer />
              <BadgeUnlockToast />
              <ChatWidgetGate />
              <RiddlePopupGate />
            </LanguageProvider>
          </GamificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}