import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import {
  Button,
  Chip,
  Muted,
  Row,
  SectionHeader,
  Title,
} from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { assetUrl } from '../../services/api';
import { getAudio } from '../../services/audioService';
import { getProverbs } from '../../services/proverbService';
import { saveItem } from '../../services/savedService';
import { trackView } from '../../services/historyService';
import { colors } from '../../theme/colors';
import type { AudioItem, Proverb } from '../../types';

const TRADITIONAL_SONGS = [
  {
    id: 'music-inanga-gakondo',
    title: "Ihorere Mwana w'Ibuhoro",
    artist: 'Jean Marie Muyango / Gakondo Tradition',
    genre: 'gakondo',
    genreLabel: 'Gakondo',
    description:
      "A classic Gakondo piece featuring inanga and vocal harmonies. Popularised by Jean Marie Muyango in the 1990s and still performed across Rwanda today.",
    duration: '~4 min',
    imageKey: 'inanga',
  },
  {
    id: 'music-intore',
    title: 'Intore — Dance of Heroes',
    artist: 'Rwanda Traditional Performers',
    genre: 'intore',
    genreLabel: 'Intore',
    description:
      'The Intore (Dance of Heroes) — inscribed by UNESCO as Intangible Cultural Heritage in 2024. Warriors leap and strike to the beat of ingoma drums.',
    duration: '~5 min',
    imageKey: 'intore',
  },
  {
    id: 'music-ingoma',
    title: 'Ingoma — Royal Drum Ceremony',
    artist: 'Rwanda Cultural Heritage',
    genre: 'ingoma',
    genreLabel: 'Ingoma',
    description:
      'The sacred royal drums of Rwanda — ingoma were at the heart of every royal ceremony and are still played at national celebrations today.',
    duration: '~6 min',
    imageKey: 'drums',
  },
  {
    id: 'music-imvyino',
    title: "Imvyino — Celebration Songs",
    artist: "Amasimbi n'Amakombe",
    genre: 'imvyino',
    genreLabel: 'Imvyino',
    description:
      "Imvyino are joyful group songs for celebrations, weddings, and community gatherings. Amasimbi n'Amakombe was one of Rwanda's most celebrated cultural groups.",
    duration: '~4 min',
    imageKey: 'royal',
  },
  {
    id: 'music-sophie-inanga',
    title: 'Inanga — Solo Performance',
    artist: 'Sophie Nzayisenga',
    genre: 'inanga',
    genreLabel: 'Inanga',
    description:
      "Sophie Nzayisenga is one of Rwanda's most celebrated inanga players, continuing the legacy of her father Thomas Kirusu. A rare and beautiful solo performance.",
    duration: '~7 min',
    imageKey: 'inanga',
  },
  {
    id: 'music-ikinimba',
    title: 'Ikinimba — Epic Dance of Kings',
    artist: 'Rwanda Ballet National',
    genre: 'ikinimba',
    genreLabel: 'Ikinimba',
    description:
      "Ikinimba is Rwanda's most revered dance tradition — it tells the stories of kings and heroes through movement, accompanied by ngoma, ikembe, and inanga.",
    duration: '~8 min',
    imageKey: 'mwami',
  },
];

type Tab = 'fables' | 'music';

export default function ListenScreen() {
  const { t, language } = useLanguage();
  const { awardXP } = useGamification();
  const [audio, setAudio] = useState<AudioItem[]>([]);
  const [proverbs, setProverbs] = useState<Proverb[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('fables');
  const [awardedItems, setAwardedItems] = useState<Set<string>>(new Set());
  const [flippedProverbs, setFlippedProverbs] = useState<Set<string>>(new Set());
  const [proverbFilter, setProverbFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [proverbSort, setProverbSort] = useState<'default' | 'read-first' | 'unread-first' | 'alpha'>('default');
  const [proverbPage, setProverbPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        getAudio().catch(() => []),
        getProverbs().catch(() => []),
      ]);
      setAudio(a);
      setProverbs(p);
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    const sub = subscriptionRef.current;
    if (sub) {
      try { sub.remove(); } catch { /* ignore */ }
      subscriptionRef.current = null;
    }
    const player = playerRef.current;
    if (player) {
      try { player.pause(); } catch { /* ignore */ }
      try { player.release(); } catch { /* ignore */ }
      playerRef.current = null;
    }
    setPlayingId(null);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    load();
    return () => { stop(); };
  }, [load, stop]);

  const currentTrack: AudioItem | null = useMemo(() => {
    if (!playingId) return null;
    return audio.find((a) => String(a.id) === playingId) || null;
  }, [audio, playingId]);

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const play = async (track: AudioItem) => {
    const raw = track.audioUrl || track.audio_url;
    const url = raw ? assetUrl(String(raw)) : null;
    try {
      stop();
      if (!url) {
        setPlayingId(String(track.id));
        setDuration(track.durationSec || 180);
        setCurrentTime(0);
        const id = setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 1;
            const max = track.durationSec || 180;
            if (next >= max) {
              clearInterval(id);
              setPlayingId(null);
              return max;
            }
            return next;
          });
        }, 1000);
        subscriptionRef.current = { remove: () => clearInterval(id) };
      } else {
        await setAudioModeAsync({ playsInSilentMode: true });
        const player = createAudioPlayer(url);
        playerRef.current = player;
        player.play();
        setPlayingId(String(track.id));
        const subscription = player.addListener('playbackStatusUpdate', (status: any) => {
          if (typeof status.currentTime === 'number') setCurrentTime(status.currentTime);
          if (typeof status.duration === 'number') setDuration(status.duration);
          if (status.didJustFinish) {
            setPlayingId(null);
            subscription.remove();
          }
        });
        subscriptionRef.current = subscription as any;
      }
      if (!awardedItems.has(track.title || String(track.id))) {
        try {
          await awardXP(15, `audio-${String(track.id)}`);
        } catch { /* ignore */ }
        setAwardedItems((prev) => new Set(prev).add(track.title || String(track.id)));
      }
      await trackView({
        type: 'Audio',
        itemId: track.id,
        title: track.title,
        image: String(track.image || ''),
        category: track.genre || '',
      });
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Playback failed');
      setPlayingId(null);
    }
  };

  const togglePlayPause = () => {
    if (playingId && currentTrack) {
      const player = playerRef.current;
      if (player) {
        if (player.currentStatus.playing) {
          player.pause();
          setPlayingId(null);
        } else {
          stop();
        }
      } else {
        stop();
      }
      return;
    }
    const ruganzu = audio.find((a) => a.title && a.title.includes('Ruganzu')) || audio[0];
    if (ruganzu) play(ruganzu);
  };

  const onSave = async (track: AudioItem) => {
    try {
      setSavingId(String(track.id));
      await saveItem({
        itemType: 'audio',
        itemId: track.id,
        itemTitle: track.title,
        itemSubtitle: track.narrator || '',
        itemImage: String(track.image || ''),
        itemMeta: {
          duration: track.duration,
          audioUrl: track.audioUrl || track.audio_url,
        },
      });
      Alert.alert(t('listen.saved'), track.title);
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filteredAudio = q
    ? audio.filter((a) =>
        [a.title, a.narrator, a.description, a.genre]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    : audio;

  const formatTime = (s: number) => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const handleProverbFlip = (id: string) => {
    setFlippedProverbs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        try {
          awardXP(5, `proverb-${String(id)}`).catch(() => {});
        } catch { /* ignore */ }
      }
      return next;
    });
  };

  const visibleProverbs = useMemo(() => {
    let list = [...proverbs];
    if (proverbFilter === 'read') list = list.filter((p) => flippedProverbs.has(String(p.id)));
    if (proverbFilter === 'unread') list = list.filter((p) => !flippedProverbs.has(String(p.id)));
    if (proverbSort === 'alpha') {
      list.sort((a, b) => String(a.text || a.proverb || a.content || '').localeCompare(String(b.text || b.proverb || b.content || '')));
    }
    if (proverbSort === 'read-first') {
      list.sort((a, b) => Number(flippedProverbs.has(String(b.id))) - Number(flippedProverbs.has(String(a.id))));
    }
    if (proverbSort === 'unread-first') {
      list.sort((a, b) => Number(flippedProverbs.has(String(a.id))) - Number(flippedProverbs.has(String(b.id))));
    }
    return list.slice(0, proverbPage * 6);
  }, [proverbs, proverbFilter, proverbSort, flippedProverbs, proverbPage]);

  const getProverbFront = (p: Proverb) => {
    if (language === 'rw') return String(p.rw || p.text || p.proverb || '');
    if (language === 'fr') return String(p.fr || p.text || p.proverb || '');
    return String(p.en || p.translation || p.text || p.proverb || '');
  };
  const getProverbBack = (p: Proverb) => {
    if (language === 'rw') return String(p.en || p.translation || '');
    if (language === 'fr') return String(p.rw || p.text || '');
    return String(p.rw || p.text || '');
  };
  const getProverbMeaning = (p: Proverb) => {
    if (language === 'rw') return String(p.meaningRw || p.meaning || '');
    if (language === 'fr') return String(p.meaningFr || p.meaning || '');
    return String(p.meaning || '');
  };

  const renderFeaturedEpic = () => (
    <View style={styles.featuredEpic}>
      <View style={styles.featuredEpicAccent} />
      <View style={styles.featuredMeta}>
        <View style={styles.featuredBadgeGold}>
          <Text style={styles.featuredBadgeText}>{t('listen.featured') || 'Featured'}</Text>
        </View>
        <View style={styles.featuredDuration}>
          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.featuredDurationText}>
            {currentTrack ? formatTime(duration || (currentTrack.durationSec || 0)) : '45 min'}
          </Text>
        </View>
      </View>
      <Text style={styles.featuredH1}>
        {currentTrack ? currentTrack.title : (t('listen.ruganzuTitle') || 'Ruganzu II — Epic of Ndoli')}
      </Text>
      <Text style={styles.featuredDesc}>
        {currentTrack ? (currentTrack.narrator || currentTrack.genre || 'Audio from the archive.') : (t('listen.ruganzuDesc') || 'The greatest Rwandan epic, narrated by Mzee Silas and accompanied by the royal inanga. 15 parts, ~45 minutes.')}
      </Text>
      <View style={styles.featuredActions}>
        <Button
          label={playingId ? (t('listen.pause') || 'Pause') : (t('listen.listenNow') || 'Listen Now')}
          variant="primary"
          leftIcon={playingId ? 'pause' : 'play'}
          onPress={togglePlayPause}
          style={styles.playBtn}
        />
        {currentTrack && Number(currentTrack.id) > 0 ? (
          <Button
            label={savingId === String(currentTrack.id) ? 'Saved ✓' : (t('listen.addToLibrary') || 'Add to Library')}
            variant="outline"
            style={styles.libraryBtn}
            onPress={() => onSave(currentTrack)}
            textStyle={{ color: '#FFFFFF' }}
          />
        ) : null}
      </View>
    </View>
  );

  const renderFableCard = (item: AudioItem, i: number) => {
    const isPlaying = playingId === String(item.id);
    const img = item.image;
    return (
      <Pressable
        key={`${String(item.id)}-${i}`}
        onPress={() => play(item)}
        style={({ pressed }) => [styles.fableCard, pressed && { opacity: 0.92, transform: [{ translateY: 1 }] }]}
      >
        <View style={styles.fableThumb}>
          {img ? (
            <Image source={{ uri: String(img) }} style={styles.fableThumbImg} resizeMode="cover" />
          ) : (
            <View style={[styles.fableThumbImg, styles.fableThumbFallback]}>
              <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </View>
        <View style={styles.fableInfo}>
          <Text style={styles.fableGenre}>
            {String(item.genre || item.category || 'Fable').toUpperCase()}
          </Text>
          <Text style={styles.fableTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.fableNarrator} numberOfLines={1}>
            {item.narrator || item.description || ''}
          </Text>
          <Text style={styles.fableDuration}>+ {item.duration || formatTime(item.durationSec || 0)}</Text>
        </View>
        {isPlaying ? (
          <View style={styles.fablePlayingIcon}>
            <Ionicons name="pause" size={14} color={colors.primary} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  const renderMusicCard = (song: typeof TRADITIONAL_SONGS[number], i: number) => (
    <View key={`${song.id}-${i}`} style={styles.musicCard}>
      <View style={styles.musicThumb}>
        <View style={[styles.musicThumbImg, styles.musicThumbFallback]}>
          <Ionicons name={'headset'} size={42} color="rgba(255,255,255,0.55)" />
        </View>
        <View style={styles.musicOverlay}>
          <Pressable
            style={({ pressed }) => [
              styles.musicPlayCircle,
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
            onPress={async () => {
              try {
                await awardXP(10, `song-${song.id}`);
              } catch { /* ignore */ }
              showToast(song.title + ' queued');
            }}
          >
            <Ionicons name="play" size={18} color={colors.primaryDark} style={{ marginLeft: 3 }} />
          </Pressable>
          <Text style={styles.musicPlayLabel}>{t('listen.playMusic') || 'Play'}</Text>
        </View>
      </View>
      <View style={styles.musicInfo}>
        <Text style={styles.musicGenre}>♪ {song.genreLabel.toUpperCase()}</Text>
        <Text style={styles.musicTitle} numberOfLines={2}>{song.title}</Text>
        <Text style={styles.musicArtist}>{song.artist}</Text>
        <Text style={styles.musicDesc} numberOfLines={2}>{song.description}</Text>
        <View style={styles.musicFooter}>
          <View style={styles.musicDurationWrap}>
            <Ionicons name="time-outline" size={11} color={colors.textMuted} />
            <Text style={styles.musicDuration}>{song.duration}</Text>
          </View>
          <Pressable style={styles.musicYtLink}>
            <Ionicons name="logo-youtube" size={13} color="#FF0000" />
            <Text style={styles.musicYtText}>{t('listen.watchOnYoutube') || 'YouTube'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderProverbCard = (p: Proverb, i: number) => {
    const id = String(p.id);
    const flipped = flippedProverbs.has(id);
    return (
      <Pressable
        key={id + '-' + i}
        onPress={() => handleProverbFlip(id)}
        style={styles.proverbCardWrap}
      >
        <View style={styles.proverbCard}>
          <Animated.View
            style={[
              styles.proverbCardFace,
              styles.proverbCardFront,
              {
                opacity: flipped ? 0 : 1,
                zIndex: flipped ? 0 : 1,
              },
            ]}
            pointerEvents={flipped ? 'none' : 'auto'}
          >
            <View style={styles.proverbFrontLabel}>
              <Text style={styles.proverbCardLabel}>{t('listen.proverbOf') || 'PROVERB'}</Text>
            </View>
            <Text style={styles.proverbCardFrontText}>
              "{getProverbFront(p)}"
            </Text>
            <Text style={styles.proverbCardHint}>
              ↩ {t('listen.tapToReveal') || 'Tap to reveal meaning'}
            </Text>
            {flipped ? (
              <View style={styles.proverbReadBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            ) : null}
          </Animated.View>
          <Animated.View
            style={[
              styles.proverbCardFace,
              styles.proverbCardBack,
              {
                opacity: flipped ? 1 : 0,
                zIndex: flipped ? 1 : 0,
              },
            ]}
            pointerEvents={flipped ? 'auto' : 'none'}
          >
            <Text style={styles.proverbCardBackLabel}>{t('listen.meaning') || 'MEANING'}</Text>
            <Text style={styles.proverbCardBackText}>
              "{getProverbBack(p)}"
            </Text>
            <Text style={styles.proverbCardMeaning}>
              {getProverbMeaning(p)}
            </Text>
            <View style={styles.proverbXpPill}>
              <Text style={styles.proverbXpText}>+5 XP</Text>
            </View>
            {flipped ? (
              <View style={[styles.proverbReadBadge, { top: 10 }]}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            ) : null}
          </Animated.View>
        </View>
      </Pressable>
    );
  };

  const [toastText, setToastText] = useState('');
  const showToast = (txt: string) => {
    setToastText(txt);
    setTimeout(() => setToastText(''), 2000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderWrap}>
          <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Title>{t('listen.title')}</Title>
              <Muted style={{ marginTop: 6, lineHeight: 20 }}>
                {t('listen.subtitle') || 'Fables, proverbs, drums and epics from Rwanda\u2019s oral tradition.'}
              </Muted>
            </View>
          </Row>
          <View style={{ marginTop: 14 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search stories, proverbs, genres…"
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {renderFeaturedEpic()}
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab('fables')}
            style={({ pressed }) => [
              styles.tabBtn,
              activeTab === 'fables' && styles.tabBtnActive,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="book-outline" size={14} color={activeTab === 'fables' ? colors.primary : colors.textSecondary} style={{ opacity: activeTab === 'fables' ? 1 : 0.7 }} />
            <Text style={[styles.tabBtnText, activeTab === 'fables' && styles.tabBtnTextActive]}>
              {t('listen.tabFables') || 'Fables & Myths'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('music')}
            style={({ pressed }) => [
              styles.tabBtn,
              activeTab === 'music' && styles.tabBtnActive,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="headset-outline" size={14} color={activeTab === 'music' ? colors.primary : colors.textSecondary} style={{ opacity: activeTab === 'music' ? 1 : 0.7 }} />
            <Text style={[styles.tabBtnText, activeTab === 'music' && styles.tabBtnTextActive]}>
              {t('listen.tabMusic') || 'Traditional Music'}
            </Text>
          </Pressable>
        </View>

        {activeTab === 'fables' ? (
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader
              title={t('listen.fablesAndMyths') || 'Fables & Myths'}
              actionLabel={t('listen.viewAll') || 'View All'}
            />
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : filteredAudio.length === 0 ? (
              <EmptyState title="No stories match your search." />
            ) : (
              <View style={styles.fableGrid}>
                {filteredAudio.map((item, i) => renderFableCard(item, i))}
              </View>
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader
              title={t('listen.traditionalMusic') || 'Traditional Songs & Dances'}
            />
            <View style={styles.musicSectionDesc}>
              <View style={styles.musicDescBar} />
              <Text style={styles.musicSectionDescText}>
                {t('listen.musicSectionDesc') ||
                  'A curated list of Rwanda\u2019s most beloved traditional songs — drums, inanga, gakondo, imvyino and UNESCO-registered intore dance. Opens on YouTube for authentic playback.'}
              </Text>
            </View>
            <View style={styles.musicGrid}>
              {TRADITIONAL_SONGS.map((s, i) => renderMusicCard(s, i))}
            </View>
          </View>
        )}

        <View style={styles.listenDivider} />

        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader title={t('listen.dailyProverbs') || 'Daily Proverbs'} />
          <View style={styles.proverbControls}>
            <View style={styles.proverbFilters}>
              {[
                { key: 'all', label: t('listen.filterAll') || 'All' },
                { key: 'unread', label: t('listen.filterUnread') || 'Unread' },
                { key: 'read', label: (t('listen.filterRead') || 'Read') + (flippedProverbs.size > 0 ? ` ${flippedProverbs.size}` : '') },
              ].map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  active={proverbFilter === f.key}
                  onPress={() => {
                    setProverbFilter(f.key as any);
                    setProverbPage(1);
                  }}
                />
              ))}
            </View>
          </View>
          <View style={styles.proverbSortRow}>
            <Text style={styles.sortLabelSmall}>{t('collections.sortBy') || 'Sort by'}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              <Chip label="Default" active={proverbSort === 'default'} onPress={() => { setProverbSort('default'); setProverbPage(1); }} />
              <Chip label={t('listen.sortUnreadFirst') || 'Unread first'} active={proverbSort === 'unread-first'} onPress={() => { setProverbSort('unread-first'); setProverbPage(1); }} />
              <Chip label={t('listen.sortReadFirst') || 'Read first'} active={proverbSort === 'read-first'} onPress={() => { setProverbSort('read-first'); setProverbPage(1); }} />
              <Chip label="A–Z" active={proverbSort === 'alpha'} onPress={() => { setProverbSort('alpha'); setProverbPage(1); }} />
            </ScrollView>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : visibleProverbs.length === 0 ? (
            <EmptyState title={t('listen.noProverbsMatch') || 'No proverbs match this filter.'} />
          ) : (
            <View style={styles.proverbGrid}>
              {visibleProverbs.map((p, i) => renderProverbCard(p, i))}
            </View>
          )}
          {visibleProverbs.length < (proverbFilter === 'all' ? proverbs.length : proverbFilter === 'read' ? [...proverbs].filter((p) => flippedProverbs.has(String(p.id))).length : [...proverbs].filter((p) => !flippedProverbs.has(String(p.id))).length) ? (
            <Pressable
              style={({ pressed }) => [styles.proverbLoadMore, pressed && { opacity: 0.85 }]}
              onPress={() => setProverbPage((p) => p + 1)}
            >
              <Text style={styles.proverbLoadMoreText}>{t('listen.loadMore') || 'Load more'}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ height: 340 }} />
      </ScrollView>

      {currentTrack || playingId ? (
        <View style={styles.audioPanel}>
          <View style={styles.playerThumb}>
            {currentTrack?.image ? (
              <Image source={{ uri: String(currentTrack.image) }} style={styles.playerThumbImg} resizeMode="cover" />
            ) : (
              <View style={[styles.playerThumbImg, styles.playerThumbFallback]}>
                <Ionicons name="musical-notes" size={52} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTitle} numberOfLines={1}>
              {currentTrack?.title || t('listen.ruganzuTitle') || 'Ruganzu II — Epic'}
            </Text>
            <Text style={styles.playerNarrator} numberOfLines={1}>
              {currentTrack?.narrator || currentTrack?.genre || 'Mzee Silas • Oral Tradition'}
            </Text>
          </View>
          <View style={styles.playerControls}>
            <View style={styles.playerProgress}>
              <View style={styles.playerTimeRow}>
                <Text style={styles.playerTimeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.playerTimeText}>{formatTime(duration || (currentTrack?.durationSec || 0))}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                <View style={[styles.progressDot, { left: `${Math.max(2, Math.min(98, progressPct))}%` }]} />
              </View>
            </View>
            <View style={styles.playerBtns}>
              <Pressable
                style={({ pressed }) => [styles.playerBtn, pressed && { backgroundColor: 'rgba(141,73,58,0.08)' }]}
                onPress={() => {
                  setCurrentTime((prev) => Math.max(0, prev - 10));
                }}
              >
                <Ionicons name="play-back" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.playerBtnPlay, pressed && { transform: [{ scale: 0.94 }], backgroundColor: playingId ? colors.primaryDark : colors.primary }]}
                onPress={togglePlayPause}
              >
                <Ionicons name={playingId ? 'pause' : 'play'} size={18} color={colors.white} style={playingId ? undefined : { marginLeft: 3 }} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.playerBtn, pressed && { backgroundColor: 'rgba(141,73,58,0.08)' }]}
                onPress={() => {
                  setCurrentTime((prev) => Math.min(duration || (currentTrack?.durationSec || 180), prev + 10));
                }}
              >
                <Ionicons name="play-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.playerExtra}>
            <Text style={styles.playerSpeed}>1.0x</Text>
            <View style={styles.playerExtraIcons}>
              <Pressable style={styles.playerIconBtn}>
                <Ionicons name="volume-high" size={16} color={colors.textMuted} />
              </Pressable>
              <Pressable style={styles.playerIconBtn} onPress={() => currentTrack && onSave(currentTrack)}>
                <Ionicons name="add-circle-outline" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
          <View style={styles.transcriptPanel}>
            <Row style={{ gap: 6, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.transcriptHeader}>{t('listen.transcriptHighlighting') || 'Transcript'}</Text>
            </Row>
            <Text style={styles.transcriptText} numberOfLines={2}>
              ...kuko rero Ruganzu amaze kugera mu mazi ya Nyabarongo, yari adi ko abami bamutegeeje...
            </Text>
            <View style={styles.transcriptHighlight}>
              <Text style={styles.transcriptHighlightText}>
                "Nuko aherako ariterimbira abari aho, ijwi rye riragomira mu..."
              </Text>
            </View>
            <View style={styles.transcriptTagsRow}>
              <View style={styles.transcriptTag}><Text style={styles.transcriptTagText}>{t('listen.transcriptTag1') || 'Epic'}</Text></View>
              <View style={styles.transcriptTag}><Text style={styles.transcriptTagText}>{t('listen.transcriptTag2') || 'Oral'}</Text></View>
              <View style={styles.transcriptTag}><Text style={styles.transcriptTagText}>{t('listen.transcriptTag3') || 'Court'}</Text></View>
            </View>
          </View>
        </View>
      ) : null}

      {toastText ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgMain },
  scrollContent: { paddingBottom: 20 },
  pageHeaderWrap: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: colors.bgMain },
  featuredEpic: {
    marginTop: 20,
    position: 'relative',
    padding: 24,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#3E2723',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  featuredEpicAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#2C1A14',
    transform: [{ translateX: -120 }, { rotate: '160deg' }, { scale: 2 }],
    opacity: 0.55,
  },
  featuredMeta: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  featuredBadgeGold: {
    backgroundColor: '#F6D860',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3E2723',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDurationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  featuredH1: {
    position: 'relative',
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 30,
    marginBottom: 10,
    maxWidth: 520,
  },
  featuredDesc: {
    position: 'relative',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 500,
  },
  featuredActions: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playBtn: {
    minHeight: 42,
    paddingHorizontal: 22,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  libraryBtn: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabsRow: {
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 16,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(141,73,58,0.12)',
    backgroundColor: colors.bgMain,
    flexDirection: 'row',
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: colors.bgCard,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  fableGrid: {
    gap: 12,
    flexDirection: 'column',
  },
  fableCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(141,73,58,0.12)',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
    alignItems: 'center',
  },
  fableThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  fableThumbImg: {
    width: '100%',
    height: '100%',
  },
  fableThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fableInfo: {
    flex: 1,
    minWidth: 0,
  },
  fableGenre: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 3,
  },
  fableTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 17,
    marginBottom: 4,
  },
  fableNarrator: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  fableDuration: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '700',
  },
  fablePlayingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(141,73,58,0.1)',
  },
  musicSectionDesc: {
    marginTop: -4,
    marginBottom: 14,
    padding: 12,
    paddingLeft: 14,
    borderRadius: 10,
    backgroundColor: colors.bgMain,
    borderLeftWidth: 3,
    borderLeftColor: '#F6D860',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  musicDescBar: { width: 0, height: 0 },
  musicSectionDescText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  musicGrid: {
    gap: 14,
  },
  musicCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(141,73,58,0.12)',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 1,
  },
  musicThumb: {
    position: 'relative',
    height: 180,
    width: '100%',
    backgroundColor: colors.primaryDark,
  },
  musicThumbImg: {
    width: '100%',
    height: '100%',
  },
  musicThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    gap: 8,
  },
  musicPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  musicPlayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.4,
  },
  musicInfo: {
    padding: 12,
    gap: 4,
  },
  musicGenre: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#C8832A',
  },
  musicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  musicArtist: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  musicDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  musicFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(141,73,58,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  musicDurationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  musicDuration: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  musicYtLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  musicYtText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  listenDivider: {
    height: 1,
    backgroundColor: 'rgba(141,73,58,0.1)',
    marginVertical: 22,
    marginHorizontal: 20,
  },
  proverbControls: {
    marginBottom: 10,
  },
  proverbFilters: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  proverbSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  sortLabelSmall: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#7A675C',
  },
  proverbGrid: {
    gap: 12,
  },
  proverbCardWrap: {
    height: 170,
  },
  proverbCard: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  proverbCardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(141,73,58,0.12)',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  proverbCardFront: {
    backgroundColor: '#FDF6EE',
    alignItems: 'center',
    gap: 8,
  },
  proverbFrontLabel: {
    position: 'absolute',
    top: 14,
  },
  proverbCardLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  proverbCardFrontText: {
    fontSize: 13.5,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 20,
    textAlign: 'center',
  },
  proverbCardHint: {
    position: 'absolute',
    bottom: 14,
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '700',
  },
  proverbReadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#34a853',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  proverbCardBack: {
    backgroundColor: colors.primaryDark,
  },
  proverbCardBackLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 10,
  },
  proverbCardBackText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    color: colors.white,
    lineHeight: 18,
    marginBottom: 8,
  },
  proverbCardMeaning: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 17,
    flex: 1,
  },
  proverbXpPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  proverbXpText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  proverbLoadMore: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(141,73,58,0.22)',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
  },
  proverbLoadMoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  audioPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: 'rgba(141,73,58,0.12)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: 'rgba(141,73,58,0.08)',
    borderRightColor: 'rgba(141,73,58,0.08)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 10,
  },
  playerThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
    maxHeight: 200,
  },
  playerThumbImg: {
    width: '100%',
    height: '100%',
  },
  playerThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141,73,58,0.1)',
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  playerNarrator: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '700',
  },
  playerControls: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141,73,58,0.1)',
  },
  playerProgress: {
    marginBottom: 12,
  },
  playerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  playerTimeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  progressBar: {
    position: 'relative',
    width: '100%',
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.primary,
    transform: [{ translateX: -5 }],
    borderWidth: 3,
    borderColor: colors.bgCard,
  },
  playerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  playerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBtnPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  playerExtra: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141,73,58,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerSpeed: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    backgroundColor: colors.bgMain,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  playerExtraIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  playerIconBtn: {
    padding: 4,
  },
  transcriptPanel: {
    padding: 14,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  transcriptHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  transcriptText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  transcriptHighlight: {
    backgroundColor: colors.primarySoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 8,
    paddingLeft: 10,
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 10,
  },
  transcriptHighlightText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 16,
  },
  transcriptTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  transcriptTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcriptTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toast: {
    position: 'absolute',
    bottom: 340,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
