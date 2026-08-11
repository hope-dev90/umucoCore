import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { GamificationProvider } from './src/context/GamificationContext';
import RewardToastContainer from './src/components/RewardToastContainer';
import RootNavigator from './src/navigation/RootNavigator';

function AppTree() {
  const { user } = useAuth();
  return (
    <LanguageProvider>
      {user ? (
        <GamificationProvider>
          <RootNavigator />
          <RewardToastContainer />
        </GamificationProvider>
      ) : (
        <RootNavigator />
      )}
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppTree />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
