import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

import LandingScreen from '../screens/Landing';
import LoginScreen from '../screens/Login';
import GovLoginScreen from '../screens/GovLogin';
import SignupScreen from '../screens/Signup';
import HomeScreen from '../screens/Home';
import ExploreScreen from '../screens/Explore';
import ListenScreen from '../screens/Listen';
import VideosScreen from '../screens/Videos';
import CollectionsScreen from '../screens/Collections';
import KwibukaScreen from '../screens/Kwibuka';
import SurvivorTestimoniesPageScreen from '../screens/SurvivorTestimoniesPage';
import SurvivorTestimonyViewScreen from '../screens/SurvivorTestimonyView';
import IntlDaysScreen from '../screens/IntlDays';
import ContributeScreen from '../screens/Contribute';
import SavedScreen from '../screens/Saved';
import HistoryScreen from '../screens/History';
import SettingsScreen from '../screens/Settings';
import ProfileScreen from '../screens/Profile';
import AdminScreen from '../screens/Admin';

const Stack = createNativeStackNavigator();

// react-router used PublicRoute/PrivateRoute/AdminRoute wrapper components
// that redirected based on auth state. react-navigation doesn't have an
// equivalent "guard per-route" pattern — the idiomatic RN approach is to
// pick which stack to mount based on the same auth state. The redirect
// *rules* below are identical to App.jsx; only the mechanism changed.
function LoadingScreen() {
  // Mirrors the web PrivateRoute loading state (spinning UmucoLogo on #FDFBF7).
  // TODO: swap in the real UmucoLogo component + spin animation.
  return <View style={styles.loading} />;
}

function AuthStack() {
  // Equivalent of PublicRoute: Landing / Login / Signup / GovLogin,
  // shown when there is no logged-in user.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="GovLogin" component={GovLoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  // Equivalent of the PrivateRoute-wrapped routes. DashboardRoute in the
  // web app pointed "/dashboard" at Home for non-admins — same here, Home
  // is just the entry screen of this stack.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Listen" component={ListenScreen} />
      <Stack.Screen name="Videos" component={VideosScreen} />
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="Kwibuka" component={KwibukaScreen} />
      <Stack.Screen name="Testimonies" component={SurvivorTestimoniesPageScreen} />
      <Stack.Screen name="TestimonyView" component={SurvivorTestimonyViewScreen} />
      <Stack.Screen name="IntlDays" component={IntlDaysScreen} />
      <Stack.Screen name="Contribute" component={ContributeScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  // Equivalent of AdminRoute — only mounted when user.role === 'admin'.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : user.role === 'admin' ? <AdminStack /> : <AppStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
});
