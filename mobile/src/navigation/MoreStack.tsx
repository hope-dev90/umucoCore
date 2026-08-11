import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreHomeScreen from '../screens/more/MoreHomeScreen';
import KwibukaScreen from '../screens/kwibuka/KwibukaScreen';
import TestimoniesScreen from '../screens/kwibuka/TestimoniesScreen';
import TestimonyDetailScreen from '../screens/kwibuka/TestimonyDetailScreen';
import IntlDaysScreen from '../screens/intl/IntlDaysScreen';
import VideosScreen from '../screens/videos/VideosScreen';
import ContributeScreen from '../screens/contribute/ContributeScreen';
import SavedScreen from '../screens/saved/SavedScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import type { MoreStackParamList } from './types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgMain },
        headerTintColor: colors.primaryDark,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bgMain },
      }}
    >
      <Stack.Screen name="MoreHome" component={MoreHomeScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Kwibuka" component={KwibukaScreen} />
      <Stack.Screen name="Testimonies" component={TestimoniesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TestimonyDetail" component={TestimonyDetailScreen} options={{ title: 'Testimony' }} />
      <Stack.Screen name="IntlDays" component={IntlDaysScreen} options={{ title: 'Intl Days' }} />
      <Stack.Screen name="Videos" component={VideosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contribute" component={ContributeScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
