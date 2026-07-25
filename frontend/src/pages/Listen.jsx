import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import proverbsData from '../data/proverbs.json';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl, apiFetch } from '../config/api';
import FlagControl from '../components/FlagControl';
import './Listen.css';
import RuganzuImg from '../assets/listen/ruganzu.png';
import craneImg from '../assets/listen/crane-story.jpg';
import moonImg from '../assets/listen/moon-story.jpg';
import intoreImg from '../assets/home/intore.jpg';
import ubudeheImg from '../assets/home/ubudehe.jpg';
import inangaImg from '../assets/home/inanga.jpg';
import royalCourtImg from '../assets/collections/royal-court.jpg';
import drumsImg from '../assets/home/intore.jpg';
import mwamiImg from '../assets/home/kigeli.jpg';
import rainImg from '../assets/home/nyanza.jpg';
import warDrumsImg from '../assets/home/intore.jpg';
import farmingImg from '../assets/home/ubudehe.jpg';
import nyamashekeImg from '../assets/safari.jpg';
import byivugoImg from '../assets/home/intore.jpg';

// Map audio title keywords / categories to local image imports
const AUDIO_IMAGE_MAP = {
  byivugo:      byivugoImg,
  ibyivugo:     byivugoImg,
  crane:        craneImg,
  drums:        drumsImg,
  drum:         drumsImg,
  ingoma:       drumsImg,
  farming:      farmingImg,
  ubudehe:      farmingImg,
  inanga:       inangaImg,
  intore:       intoreImg,
  moon:         moonImg,
  mwami:        mwamiImg,
  nyamasheke:   nyamashekeImg,
  rain:         rainImg,
  'royal-court': royalCourtImg,
  royal:        royalCourtImg,
  court:        royalCourtImg,
  ruganzu:      RuganzuImg,
  'war-drums':  warDrumsImg,
  war:          warDrumsImg,
};

const ALL_AUDIO_IMAGES = Object.values(AUDIO_IMAGE_MAP);

const FALLBACK_AUDIO_STORIES = [
  {
    genre: { en: 'Imigani', rw: 'Imigani', fr: 'Contes' },
    title: {
      en: 'The Crane and the Drum',
      rw: "Umusambi n'Ingoma",
      fr: 'La grue et le tambour',
    },
    narrator: {
      en: "Narrated by Jean d'Amour",
      rw: "Byavuzwe na Jean d'Amour",
      fr: "Raconte par Jean d'Amour",
    },
    duration: '12:40',
    durationSec: 760,
    image: craneImg,
    audioUrl: '',
  },
  {
    genre: { en: 'Imigani', rw: 'Imigani', fr: 'Contes' },
    title: {
      en: 'The Moon That Borrowed a Cow',
      rw: "Ukwezi Kwatije Inka",
      fr: 'La lune qui emprunta une vache',
    },
    narrator: {
      en: 'Narrated by Beatrice U.',
      rw: 'Byavuzwe na Beatrice U.',
      fr: 'Raconte par Beatrice U.',
    },
    duration: '15:15',
    durationSec: 915,
    image: moonImg,
    audioUrl: '',
  },
];

function localizeAudioFallback(language) {
  return FALLBACK_AUDIO_STORIES.map((story, index) => ({
    id: `fallback-audio-${index + 1}`,
    genre: story.genre[language] || story.genre.en,
    title: story.title[language] || story.title.en,
    narrator: story.narrator[language] || story.narrator.en,
    duration: story.duration,
    durationSec: story.durationSec,
    image: story.image,
    audioUrl: story.audioUrl,
  }));
}

const PROVERB_LANG_CONFIG = {
  rw: { tag: 'rw-RW', label: 'RW', preferredVoiceHints: ['kinyarwanda', 'rwanda', 'rw'] },
  fr: { tag: 'fr-FR', label: 'FR', preferredVoiceHints: ['amelie', 'thomas', 'french'] },
  en: { tag: 'en-GB', label: 'EN', preferredVoiceHints: ['daniel', 'english'] },
};

function resolveAudioImage(item, index) {
  const key = `${item.title} ${item.category}`.toLowerCase();
  for (const [word, path] of Object.entries(AUDIO_IMAGE_MAP)) {
    if (key.includes(word)) return path;
  }
  return ALL_AUDIO_IMAGES[index % ALL_AUDIO_IMAGES.length];
}

export default function Listen() {
  const { t, language } = useLanguage();
  const { awardXP, trackActivity } = useGamificationContext();
  const { user } = useAuth();
  const [fables, setFables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const speechRef = useRef(null);
  const speechTimerRef = useRef(null);
  const proverbUtteranceRef = useRef(null);
  const [proverbAudioState, setProverbAudioState] = useState({ id: null, lang: null, playing: false });
  const [awardedItems, setAwardedItems] = useState(new Set());
  const [proverbs, setProverbs] = useState(() => proverbsData.proverbs);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [proverbPage, setProverbPage] = useState(1);
  const PROVERBS_PER_PAGE = 6;
  const [proverbFilter, setProverbFilter] = useState('all'); // 'all', 'read', 'unread'
  const [proverbSort, setProverbSort] = useState('default'); // 'default', 'alphabetical'
  const [savingTrackId, setSavingTrackId] = useState(null);
  const [playbackMode, setPlaybackMode] = useState('audio');
  const [speechNarration, setSpeechNarration] = useState(null);
  const [reportMessage, setReportMessage] = useState('');

  const getSelectedVoice = useCallback(() => Number(user?.accessibility?.voice ?? 0), [user]);

  const clearSpeechTimer = useCallback(() => {
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    clearSpeechTimer();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speechRef.current = null;
  }, [clearSpeechTimer]);

  // stopProverbSpeech must be declared before the cleanup effect below,
  // since the effect references it (const/useCallback bindings are not hoisted).
  const stopProverbSpeech = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    proverbUtteranceRef.current = null;
    setProverbAudioState({ id: null, lang: null, playing: false });
  }, []);

  useEffect(() => () => { stopSpeech(); stopProverbSpeech(); }, [stopSpeech, stopProverbSpeech]);

  const chooseBrowserVoice = useCallback((profile) => {
    if (!window.speechSynthesis || !profile) return null;
    const browserVoices = window.speechSynthesis.getVoices();
    const hints = profile.preferredVoiceHints || [];
    return browserVoices.find((voice) => hints.some((hint) => voice.name.toLowerCase().includes(hint.toLowerCase()))) ||
      browserVoices.find((voice) => voice.lang?.toLowerCase().startsWith(profile.lang?.toLowerCase().slice(0, 2))) ||
      null;
  }, []);

  const startSpeechProgress = useCallback((estimatedDuration) => {
    clearSpeechTimer();
    speechTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = Math.min(prev + 1, estimatedDuration);
        if (next >= estimatedDuration) clearSpeechTimer();
        return next;
      });
    }, 1000);
  }, [clearSpeechTimer]);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const res = await fetch(apiUrl('/api/audio'));
        const data = await res.json();
        if (data.audio && data.audio.length > 0) {
          const mapped = data.audio.map((item, i) => ({
            id: item.id,
            genre: item.category,
            title: item.title,
            narrator: item.description,
            duration: item.duration
              ? `${Math.floor(item.duration / 60)}:${String(
                  item.duration % 60
                ).padStart(2, "0")}`
              : "0:00",
            durationSec: item.duration || 0,
            image: item.thumbnail_url || resolveAudioImage(item, i),
            audioUrl: item.audio_url || '',
          }));
          setFables(mapped);
        } else {
          setFables(localizeAudioFallback(language));
        }
      } catch (err) {
        console.error("Error fetching audio data:", err);
        setFables(localizeAudioFallback(language));
      } finally {
        setLoading(false);
      }
    };

    const fetchProverbs = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(apiUrl('/api/proverbs'), {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.proverbs && data.proverbs.length > 0) {
          const apiProverbs = data.proverbs.map((p) => ({
              id: p.id || `api-${Math.random().toString(36).slice(2, 9)}`,
              rw: p.text || p.rw || '',
              en: p.translation || p.en || p.text || '',
              fr: p.fr || p.translation || p.text || '',
              meaning: p.meaning || '',
              meaningRw: p.meaningRw || p.meaning_rw || '',
              meaningFr: p.meaningFr || p.meaning_fr || '',
              source: p.source || "Rwandan oral tradition",
            }));
          setProverbs(apiProverbs);
          return;
        }
      } catch {
        // keep local proverbs already in state
      } finally {
        clearTimeout(timeout);
      }
    };

    fetchAudio();
    fetchProverbs();
  }, [t, language]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingAudioPlay');
    if (!pending || fables.length === 0) return;
    try {
      const payload = JSON.parse(pending);
      localStorage.removeItem('pendingAudioPlay');
      const track = fables.find(f => String(f.id) === String(payload.itemId));
      if (track) playTrack(track);
    } catch {
      localStorage.removeItem('pendingAudioPlay');
    }
  }, [fables]);

  const handleAddToLibrary = useCallback(async (track) => {
    if (!user) {
      alert("Please sign in to save to your library.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please sign in to save to your library.");
        return;
      }
      const res = await apiFetch('/api/saved', {
        method: "POST",
        body: JSON.stringify({
          itemType: "audio",
          itemId: Number(track.id),
          itemTitle: track.title,
          itemSubtitle: track.narrator,
          itemImage: track.image || "",
          itemMeta: { duration: track.duration, audioUrl: track.audioUrl, playback: track.audioUrl ? "audio" : "ai-voice" },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to save (${res.status})`);
      }
      setSavingTrackId(track.id);
      setTimeout(() => setSavingTrackId(null), 1500);
    } catch (err) {
      console.error("Save to library failed:", err);
      alert(err.message || "Failed to add to library.");
    }
  }, [user]);

  const getLocalNarration = useCallback((track) => {
    const selectedVoice = getSelectedVoice();
    return {
      mode: 'speech-synthesis',
      title: track.title,
      text: `${track.title}. ${track.narrator || track.genre || 'A story from Rwanda cultural heritage.'}`,
      estimatedDuration: Math.max(20, Math.round(`${track.title} ${track.narrator || ''}`.split(/\s+/).length / 2.4)),
      voice: {
        id: selectedVoice,
        name: selectedVoice === 1 ? 'Kamanzi' : selectedVoice === 2 ? 'Ineza' : 'Umutoni',
        preferredVoiceHints: selectedVoice === 1 ? ['male', 'daniel', 'david'] : ['female', 'samantha', 'zira'],
        rate: selectedVoice === 1 ? 0.88 : selectedVoice === 2 ? 1 : 0.92,
        pitch: selectedVoice === 1 ? 0.82 : selectedVoice === 2 ? 1 : 1.08,
        lang: 'en-GB',
      },
    };
  }, [getSelectedVoice]);

  const fetchNarration = useCallback(async (track) => {
    if (!track.id) return getLocalNarration(track);
    try {
      const response = await fetch(apiUrl(`/api/audio/${track.id}/narration?voice=${getSelectedVoice()}`));
      if (response.status === 404) return getLocalNarration(track);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return getLocalNarration(track);
      return data;
    } catch {
      return getLocalNarration(track);
    }
  }, [getLocalNarration, getSelectedVoice]);

  const speakNarration = useCallback((narration) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support AI voice narration.");
      return;
    }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(narration.text);
    const browserVoice = chooseBrowserVoice(narration.voice);
    if (browserVoice) utterance.voice = browserVoice;
    utterance.lang = narration.voice?.lang || 'en-GB';
    utterance.rate = narration.voice?.rate || 0.95;
    utterance.pitch = narration.voice?.pitch || 1;
    utterance.onend = () => {
      clearSpeechTimer();
      setIsPlaying(false);
      setCurrentTime(narration.estimatedDuration || 0);
    };
    utterance.onerror = () => {
      clearSpeechTimer();
      setIsPlaying(false);
    };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    startSpeechProgress(narration.estimatedDuration || 30);
  }, [chooseBrowserVoice, clearSpeechTimer, startSpeechProgress, stopSpeech]);

  const playTrack = useCallback(async (track) => {
    stopProverbSpeech();
    stopSpeech();
    if (audioRef.current) audioRef.current.pause();
    setCurrentTrack(track);
    setCurrentTime(0);

    try {
      const narration = await fetchNarration(track);
      if (narration.mode === 'audio') {
        setPlaybackMode('audio');
        setSpeechNarration(null);
        if (audioRef.current) {
          audioRef.current.src = narration.audioUrl || track.audioUrl;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
        }
        return;
      }

      setPlaybackMode('speech-synthesis');
      setSpeechNarration(narration);
      setDuration(narration.estimatedDuration || 30);
      setIsPlaying(true);
      speakNarration(narration);
    } catch (err) {
      console.error("Playback failed:", err);
      alert(err.message || "Playback failed.");
    }
  }, [fetchNarration, speakNarration, stopProverbSpeech, stopSpeech]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) {
      const ruganzuTrack = fables.find(f => f.title.includes("Ruganzu")) || fables[0];
      if (ruganzuTrack) playTrack(ruganzuTrack);
      return;
    }

    if (playbackMode === 'speech-synthesis') {
      if (!window.speechSynthesis) return;
      if (isPlaying) {
        window.speechSynthesis.pause();
        clearSpeechTimer();
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        startSpeechProgress(duration || speechNarration?.estimatedDuration || 30);
      } else if (speechNarration) {
        speakNarration(speechNarration);
      }
      setIsPlaying(p => !p);
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(p => !p);
  }, [clearSpeechTimer, currentTrack, duration, fables, isPlaying, playTrack, playbackMode, speakNarration, speechNarration, startSpeechProgress]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    clearSpeechTimer();
  }, [clearSpeechTimer]);

  const handleFableClick = useCallback((fable) => {
    playTrack(fable);
    if (!awardedItems.has(fable.title)) {
      awardXP(15, `Listened to story: ${fable.title}`);
      setAwardedItems(prev => new Set([...prev, fable.title]));
    }
  }, [awardedItems, awardXP, playTrack]);

  const handleRuganzuClick = useCallback(() => {
    const ruganzuTrack = fables.find(f => f.title.includes("Ruganzu")) || fables[0];
    if (ruganzuTrack) {
      playTrack(ruganzuTrack);
    }
    if (!awardedItems.has('Ruganzu Epic')) {
      awardXP(30, 'Listened to Ruganzu Epic');
      setAwardedItems(prev => new Set([...prev, 'Ruganzu Epic']));
    }
  }, [fables, awardedItems, awardXP, playTrack]);

  // Persist read proverbs to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readProverbs');
    if (stored) {
      try { setFlippedCards(new Set(JSON.parse(stored))); } catch { /* ignore */ }
    }
  }, []);

  const handleFlipCard = useCallback((proverbId) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(proverbId)) {
        next.delete(proverbId);
      } else {
        next.add(proverbId);
        trackActivity?.('proverb', String(proverbId), {});
      }
      localStorage.setItem('readProverbs', JSON.stringify([...next]));
      return next;
    });
  }, [trackActivity]);

  const speakProverb = useCallback((proverb, lang) => {
    if (!window.speechSynthesis) {
      alert('Audio is not supported in your browser.');
      return;
    }
    const { id } = proverb;
    const isActiveToggle =
      proverbAudioState.id === id &&
      proverbAudioState.lang === lang &&
      proverbAudioState.playing;

    if (isActiveToggle) { stopProverbSpeech(); return; }

    // Silence everything else
    stopProverbSpeech();
    if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
    stopSpeech();

    // Flip + XP if not already read
    if (!flippedCards.has(id)) handleFlipCard(id);

    const cfg = PROVERB_LANG_CONFIG[lang];
    const text = proverb[lang] || proverb.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = cfg.tag;
    utterance.rate = 0.85;

    // Voice selection
    const voices = window.speechSynthesis.getVoices();
    const matched =
      voices.find(v => cfg.preferredVoiceHints.some(h => v.name.toLowerCase().includes(h))) ||
      voices.find(v => v.lang?.toLowerCase().startsWith(cfg.tag.slice(0, 2)));
    if (matched) utterance.voice = matched;

    utterance.onend = () => setProverbAudioState({ id: null, lang: null, playing: false });
    utterance.onerror = () => setProverbAudioState({ id: null, lang: null, playing: false });

    proverbUtteranceRef.current = utterance;
    setProverbAudioState({ id, lang, playing: true });
    window.speechSynthesis.speak(utterance);
  }, [proverbAudioState, stopProverbSpeech, audioRef, stopSpeech, flippedCards, handleFlipCard]);

  // Reset to page 1 when filter or sort changes
  useEffect(() => { setProverbPage(1); }, [proverbFilter, proverbSort]);

  const visibleProverbs = useMemo(() => {
    let result = [...proverbs];
    // Filter
    if (proverbFilter === 'read')   result = result.filter(p => flippedCards.has(p.id));
    if (proverbFilter === 'unread') result = result.filter(p => !flippedCards.has(p.id));
    // Sort
    if (proverbSort === 'alphabetical') result.sort((a, b) => a.rw.localeCompare(b.rw));
    if (proverbSort === 'read-first')   result.sort((a, b) => (flippedCards.has(b.id) ? 1 : 0) - (flippedCards.has(a.id) ? 1 : 0));
    if (proverbSort === 'unread-first') result.sort((a, b) => (flippedCards.has(a.id) ? 1 : 0) - (flippedCards.has(b.id) ? 1 : 0));
    return result.slice(0, proverbPage * PROVERBS_PER_PAGE);
  }, [proverbs, proverbPage, proverbFilter, proverbSort, flippedCards]);

  const filteredProverbCount = useMemo(() => {
    if (proverbFilter === 'read')   return proverbs.filter(p => flippedCards.has(p.id)).length;
    if (proverbFilter === 'unread') return proverbs.filter(p => !flippedCards.has(p.id)).length;
    return proverbs.length;
  }, [proverbs, proverbFilter, flippedCards]);

  const getProverbMeaning = useCallback((proverb) => {
    if (language === 'rw') return proverb.meaningRw || proverb.meaning;
    if (language === 'fr') return proverb.meaningFr || proverb.meaning;
    return proverb.meaning;
  }, [language]);

  const formatTime = (secs) => {
    if (!secs || !Number.isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Layout searchPlaceholder={t('search.placeholder')}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <div className="listen-page">
        <div>
          <div className="featured-epic">
            <div className="featured-epic-meta">
              <span className="featured-badge">{t('listen.featured')}</span>
              <span className="featured-duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {currentTrack ? formatTime(duration) : "45 min"}
              </span>
            </div>
            <h1>{currentTrack ? currentTrack.title : t('listen.ruganzuTitle')}</h1>
            <p>{currentTrack ? currentTrack.narrator : t('listen.ruganzuDesc')}</p>
            <div className="featured-actions">
              <button className="play-btn" onClick={togglePlayPause}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  {isPlaying
                    ? <>
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </>
                    : <polygon points="5 3 19 12 5 21 5 3" />
                  }
                </svg>
                {isPlaying ? t('listen.pause') : (currentTrack ? t('listen.listenNow') : t('listen.listenNow'))}
              </button>
              <button
                className="library-btn"
                onClick={() => currentTrack && handleAddToLibrary(currentTrack)}
                disabled={savingTrackId === currentTrack?.id}
                style={{ opacity: currentTrack ? 1 : 0.6, cursor: currentTrack ? 'pointer' : 'not-allowed' }}
              >
                {savingTrackId === currentTrack?.id ? 'Saved ✓' : t('listen.addToLibrary')}
              </button>
              {currentTrack && (
                <FlagControl
                  type="audio"
                  itemId={currentTrack.id}
                  title={currentTrack.title}
                  onToast={(text) => { setReportMessage(text); setTimeout(() => setReportMessage(''), 3000); }}
                />
              )}
            </div>
          </div>

          <div className="listen-section">
            <div className="listen-section-header">
              <span className="listen-section-title">{t('listen.fablesAndMyths')}</span>
              <span className="listen-view-all">{t('listen.viewAll')}</span>
            </div>
            <div className="fable-cards">
              {fables.map((fable, i) => (
                <div key={i} className="fable-card" onClick={() => handleFableClick(fable)} style={{ cursor: 'pointer' }}>
                  <div className="fable-thumb">
                    <img src={fable.image} alt={fable.title} />
                  </div>
                  <div className="fable-info">
                    <div className="fable-genre">{fable.genre}</div>
                    <div className="fable-title">{fable.title}</div>
                    <div className="fable-narrator">{fable.narrator}</div>
                    <div className="fable-duration">+ {fable.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="listen-divider" />

          <div className="listen-section">
            <div className="listen-section-header">
              <span className="listen-section-title">{t('listen.dailyProverbs')}</span>
            </div>
            <div className="proverb-controls">
              <div className="proverb-filter-group">
                <button
                  className={`proverb-filter-btn${proverbFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setProverbFilter('all')}
                >{t('listen.filterAll') || 'All'}</button>
                <button
                  className={`proverb-filter-btn${proverbFilter === 'unread' ? ' active' : ''}`}
                  onClick={() => setProverbFilter('unread')}
                >{t('listen.filterUnread') || 'Unread'}</button>
                <button
                  className={`proverb-filter-btn${proverbFilter === 'read' ? ' active' : ''}`}
                  onClick={() => setProverbFilter('read')}
                >{t('listen.filterRead') || 'Read'} {flippedCards.size > 0 && <span className="proverb-read-count">{flippedCards.size}</span>}</button>
              </div>
              <select
                className="proverb-sort-select"
                value={proverbSort}
                onChange={e => setProverbSort(e.target.value)}
              >
                <option value="default">{t('listen.sortDefault') || 'Default'}</option>
                <option value="unread-first">{t('listen.sortUnreadFirst') || 'Unread first'}</option>
                <option value="read-first">{t('listen.sortReadFirst') || 'Read first'}</option>
                <option value="alphabetical">{t('listen.sortAlpha') || 'A–Z'}</option>
              </select>
            </div>
            <div className="proverb-cards-grid">
              {visibleProverbs.map((proverb) => {
                const isFlipped = flippedCards.has(proverb.id);
                let frontText, backText;
                if (language === 'rw') {
                  frontText = proverb.rw;
                  backText  = proverb.en;
                } else if (language === 'fr') {
                  frontText = proverb.fr ?? proverb.en;
                  backText  = proverb.rw;
                } else {
                  frontText = proverb.en;
                  backText  = proverb.rw;
                }
                return (
                  <div
                    key={proverb.id}
                    className={`proverb-flip-card${isFlipped ? ' flipped' : ''}`}
                    onClick={() => handleFlipCard(proverb.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={isFlipped ? backText : t('listen.tapToReveal')}
                    onKeyDown={e => e.key === 'Enter' && handleFlipCard(proverb.id)}
                  >
                    <div className="proverb-flip-inner">
                      {/* Front */}
                      <div className="proverb-flip-front">
                        <div className="proverb-audio-controls">
                          {['rw', 'fr', 'en'].map(lang => {
                            const cfg = PROVERB_LANG_CONFIG[lang];
                            const isActive =
                              proverbAudioState.id === proverb.id &&
                              proverbAudioState.lang === lang &&
                              proverbAudioState.playing;
                            return (
                              <button
                                key={lang}
                                type="button"
                                className={`proverb-lang-btn${isActive ? ' active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); speakProverb(proverb, lang); }}
                                aria-label={`${isActive ? 'Stop' : 'Play'} proverb in ${cfg.label}`}
                                title={`${isActive ? 'Stop' : 'Play'} in ${cfg.label}`}
                              >
                                {isActive
                                  ? <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                  : <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                }
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="proverb-card-label">{t('listen.proverbOf')}</div>
                        <p className="proverb-card-rw">"{frontText}"</p>
                        <span className="proverb-card-hint">{t('listen.tapToReveal')}</span>
                        <FlagControl
                          type="proverb"
                          itemId={proverb.id}
                          title={frontText}
                          onToast={(text) => { setReportMessage(text); setTimeout(() => setReportMessage(''), 3000); }}
                        />
                      </div>
                      {/* Back: translation + meaning */}
                      <div className="proverb-flip-back">
                        {isFlipped && <span className="proverb-read-badge">✓</span>}
                        <div className="proverb-card-label">{t('listen.meaning')}</div>
                        <p className="proverb-card-en">"{backText}"</p>
                        <p className="proverb-card-meaning">{getProverbMeaning(proverb)}</p>
                        <span className="proverb-card-xp">{t('listen.xpEarned')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {visibleProverbs.length === 0 && (
              <p className="proverb-empty-state">{t('listen.noProverbsMatch') || 'No proverbs match this filter.'}</p>
            )}
            {visibleProverbs.length < filteredProverbCount && (
              <button
                className="proverb-load-more"
                onClick={() => setProverbPage(p => p + 1)}
              >
                {t('listen.loadMore')}
              </button>
            )}
          </div>
        </div>

        <div className="audio-panel">
          <div className="player-thumb">
            <img src={currentTrack ? (currentTrack.image || RuganzuImg) : RuganzuImg} alt={currentTrack ? currentTrack.title : "Ruganzu II"} />
          </div>
          <div className="player-info">
            <div className="player-title">{currentTrack ? currentTrack.title : t('listen.ruganzuTitle')}</div>
            <div className="player-narrator">{currentTrack ? (currentTrack.narrator || currentTrack.genre) : "Mzee Silas • Oral Tradition"}</div>
          </div>
          <div className="player-controls">
            <div className="player-progress">
              <div className="player-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="player-btns">
              <button className="player-btn" onClick={() => { if (playbackMode === 'audio' && audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>
              <button className="player-btn play-pause" onClick={togglePlayPause}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {isPlaying
                    ? <>
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </>
                    : <polygon points="5 3 19 12 5 21 5 3" />
                  }
                </svg>
              </button>
              <button className="player-btn" onClick={() => { if (playbackMode === 'audio' && audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>
          </div>
          <div className="player-extra">
            <span className="player-speed">{playbackMode === 'speech-synthesis' ? 'AI voice' : '1.0x'}</span>
            <div className="player-extra-icons">
              <button className="player-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" />
                  <path d="M19.07 4.93a10 10 0 010 14.14" />
                </svg>
              </button>
              <button className="player-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>
          <div className="transcript-panel">
            <div className="transcript-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {t('listen.transcriptHighlighting')}
            </div>
            <p className="transcript-text">
              ...kuko rero Ruganzu amaze kugera mu mazi ya Nyabarongo, yari adi ko abami bamutegeeje...
            </p>
            <div className="transcript-highlight">
              "Nuko aherako ariterimbira abari aho, ijwi rye riragomira mu..."
            </div>
            <div className="transcript-tags">
              <span className="transcript-tag">{t('listen.transcriptTag1')}</span>
              <span className="transcript-tag">{t('listen.transcriptTag2')}</span>
              <span className="transcript-tag">{t('listen.transcriptTag3')}</span>
            </div>
          </div>
        </div>
      </div>
      {reportMessage && <div className="contribute-toast">{reportMessage}</div>}
    </Layout>
  );
}
