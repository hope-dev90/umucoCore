// Ported from web src/pages/Landing.jsx.
// Same structure and section order: Navbar, Hero, DigitalArchive, Discover,
// CommunityGuardian, Footer. Two web-only mechanisms have RN equivalents:
//  - IntersectionObserver (which section is active for the navbar) becomes
//    onScroll + measured section offsets, since RN has no viewport observer.
//  - useNavigate()/navigate('/path') becomes React Navigation's
//    navigation.navigate('ScreenName'), matching AppNavigator's route names.
// Nothing in the section components' content, copy, or order was changed.
import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DigitalArchive from '../components/Archive';
import Discover from '../components/Discover';
import CommunityGuardian from '../components/Community';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { colors } from '../theme/colors';

export default function LandingScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('Home');
  const scrollRef = useRef(null);
  const sectionOffsets = useRef({});

  const sectionLabels = {
    home: t('nav.home'),
    archive: t('nav.about'),
    community: t('nav.community'),
  };

  const handleNavigate = (view, storyId) => {
    if (view === 'login') navigation.navigate('Login');
    else if (view === 'signup') navigation.navigate('Signup', { continueStoryId: storyId });
    else if (view === 'collections') navigation.navigate('Collections');
    else if (view === 'home') scrollRef.current?.scrollTo({ y: 0, animated: true });
    else if (sectionOffsets.current[view] != null) {
      scrollRef.current?.scrollTo({ y: sectionOffsets.current[view], animated: true });
    }
  };

  const scrollToArchive = () => {
    if (sectionOffsets.current.archive != null) {
      scrollRef.current?.scrollTo({ y: sectionOffsets.current.archive, animated: true });
    }
  };

  const recordOffset = (key) => (event) => {
    sectionOffsets.current[key] = event.nativeEvent.layout.y;
  };

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y + 120; // rough "mid-viewport" match for IntersectionObserver's -50% rootMargin
    const entries = Object.entries(sectionOffsets.current);
    let current = 'home';
    for (const [key, offset] of entries) {
      if (y >= offset) current = key;
    }
    setActiveSection(sectionLabels[current] || sectionLabels.home);
  };

  return (
    <View style={styles.container}>
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={recordOffset('home')}>
          <Hero onNavigate={handleNavigate} onExploreMore={scrollToArchive} />
        </View>
        <View onLayout={recordOffset('archive')}>
          <DigitalArchive onNavigate={handleNavigate} />
        </View>
        <View onLayout={recordOffset('discover')}>
          <Discover onNavigate={handleNavigate} />
        </View>
        <View onLayout={recordOffset('community')}>
          <CommunityGuardian onNavigate={handleNavigate} />
        </View>
        <Footer onNavigate={handleNavigate} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
});
