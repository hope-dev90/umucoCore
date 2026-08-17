import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import ListenScreen from '../screens/listen/ListenScreen';
import CollectionsScreen from '../screens/collections/CollectionsScreen';
import MoreStack from './MoreStack';
import ChatWidget from '../components/ChatWidget';
import RiddlePopup from '../components/RiddlePopup';
import MobileHeader from '../components/MobileHeader';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const map: Record<string, string> = {
    Home: '⌂',
    Explore: '◎',
    Listen: '♪',
    Collections: '▣',
    More: '⋯',
  };
  return (
    <Text style={{ fontSize: 16, color: focused ? colors.primary : colors.textMuted }}>
      {map[label] || '•'}
    </Text>
  );
}

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <MobileHeader />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.bgCard,
            borderTopColor: colors.border,
          },
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
        <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: t('tabs.explore') }} />
        <Tab.Screen name="Listen" component={ListenScreen} options={{ title: t('tabs.listen') }} />
        <Tab.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{ title: t('tabs.collections') }}
        />
        <Tab.Screen name="More" component={MoreStack} options={{ title: t('tabs.more') }} />
      </Tab.Navigator>
      {/* Web App.jsx: ChatWidget + RiddlePopup for logged-in non-admin users */}
      <ChatWidget />
      <RiddlePopup />
    </View>
  );
}
