import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import proverbsData from '../data/proverbs.json';
import audioData from '../data/audio.json';
import { gihangaStory } from '../data/stories/gihanga';
import { nyirarucyabaStory } from '../data/stories/nyirarucyaba';
import { ruganzuStory } from '../data/stories/ruganzu';
import { kigeliStory } from '../data/stories/kigeli';
import { inangaStory } from '../data/stories/inanga';
import { ryangombeStory } from '../data/stories/ryangombe';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl, apiFetch } from '../config/api';
import FlagControl from '../components/FlagControl';
import './Listen.css';
import './ListenDs.css';
import { Bookmark, Clock, EllipsisVertical, Languages, Pause, Play, RotateCcw, Share2, SkipBack, SkipForward } from 'lucide-react';
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
  byivugo:       byivugoImg,
  ibyivugo:      byivugoImg,
  crane:         craneImg,
  drums:         drumsImg,
  drum:          drumsImg,
  ingoma:        drumsImg,
  farming:       farmingImg,
  ubudehe:       farmingImg,
  inanga:        inangaImg,
  intore:        intoreImg,
  moon:          moonImg,
  mwami:         mwamiImg,
  nyamasheke:    nyamashekeImg,
  rain:          rainImg,
  'royal-court': royalCourtImg,
  royal:         royalCourtImg,
  court:         royalCourtImg,
  ruganzu:       RuganzuImg,
  'war-drums':   warDrumsImg,
  war:           warDrumsImg,
  mama:          ubudeheImg,
  karahanyuze:   inangaImg,
  arihehe:       intoreImg,
  kantengwa:     RuganzuImg,
  ganyobwe:      nyamashekeImg,
  umurage:       royalCourtImg,
};

// Map imageKey field in audio.json to local image imports
const IMAGE_KEY_MAP = {
  ruganzu:       RuganzuImg,
  crane:         craneImg,
  moon:          moonImg,
  intore:        intoreImg,
  ubudehe:       ubudeheImg,
  inanga:        inangaImg,
  royal:         royalCourtImg,
  drums:         drumsImg,
  ingoma:        drumsImg,
  mwami:         mwamiImg,
  rain:          rainImg,
  nyamasheke:    nyamashekeImg,
  byivugo:       byivugoImg,
  farming:       farmingImg,
  mama:          ubudeheImg,
  nyirarucyaba:  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2t6RGCok9oMiWrMdhmU2IgyTm6YGvCdZNzjAeOOPsiQ&s=10',
  umuganura:     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2t6RGCok9oMiWrMdhmU2IgyTm6YGvCdZNzjAeOOPsiQ&s=10',
};

const ALL_AUDIO_IMAGES = Object.values(AUDIO_IMAGE_MAP);

function localizeAudioFallback(language) {
  return audioData.map((song) => ({
    id: song.id,
    genre: song.genre[language] || song.genre.en,
    title: song.title[language] || song.title.en,
    narrator: song.narrator[language] || song.narrator.en,
    description: song.description ? (song.description[language] || song.description.en) : '',
    duration: song.duration,
    durationSec: song.durationSec,
    image: IMAGE_KEY_MAP[song.imageKey] || ALL_AUDIO_IMAGES[0],
    audioUrl: song.audioUrl || '',
    youtubeRef: song.youtubeRef || '',
    storyId: song.storyId || '',       // ← pass through so narration can find content
    content: song.content || '',       // ← pass full content directly from audio.json
  }));
}

// Map story IDs to local story files for full content
const STORY_CONTENT_MAP = {
  'gihanga-ngomijana': gihangaStory,
  'nyirarucyaba': nyirarucyabaStory,
  'ruganzu-ii-ndoli': ruganzuStory,
  'kigeli-iv-rwabugiri': kigeliStory,
  'inanga-mazimpaka': inangaStory,   // ← was missing
  'ryangombe': ryangombeStory,       // ← was missing
};

// Map database IDs to story IDs (based on seed order)
const DB_ID_TO_STORY_ID = {
  1: 'gihanga-ngomijana',
  2: 'nyirarucyaba',
  3: 'ruganzu-ii-ndoli',
  4: 'kigeli-iv-rwabugiri',
};

const PROVERB_LANG_CONFIG = {
  fr: { tag: 'fr-FR', label: 'FR', preferredVoiceHints: ['amelie', 'thomas', 'french'] },
  rw: { tag: 'rw-RW', label: 'RW', preferredVoiceHints: ['rwanda', 'kinyarwanda', 'ikinyarwanda'] },
  en: { tag: 'en-GB', label: 'EN', preferredVoiceHints: ['daniel', 'english'] },
};

function resolveAudioImage(item, index) {
  const key = `${item.title} ${item.category}`.toLowerCase();
  for (const [word, path] of Object.entries(AUDIO_IMAGE_MAP)) {
    if (key.includes(word)) return path;
  }
  return ALL_AUDIO_IMAGES[index % ALL_AUDIO_IMAGES.length];
}

// ── RWANDAN TRADITIONAL SONGS ────────────────────────────────────────────────
// Each entry links to a real YouTube search query for that song/artist.
// Clicking "Play" opens the YouTube search so the user always finds real videos.
const TRADITIONAL_SONGS = [
  {
    id: 'music-inanga-gakondo',
    youtubeSearch: 'Ihorere+Mwana+w%27Ibuhoro+Rwanda+inanga+Gakondo',
    title: "Ihorere Mwana w'Ibuhoro",
    artist: 'Jean Marie Muyango / Gakondo Tradition',
    genre: 'gakondo',
    description: "A classic Gakondo piece featuring inanga and vocal harmonies. Popularised by Jean Marie Muyango in the 1990s and still performed across Rwanda today.",
    duration: '~4 min',
    imageKey: 'inanga',
  },
  {
    id: 'music-intore',
    youtubeSearch: 'Rwanda+Intore+dance+traditional+warriors+UNESCO',
    title: 'Intore — Dance of Heroes',
    artist: 'Rwanda Traditional Performers',
    genre: 'intore',
    description: 'The Intore (Dance of Heroes) — inscribed by UNESCO as Intangible Cultural Heritage in 2024. Warriors leap and strike to the beat of ingoma drums.',
    duration: '~5 min',
    imageKey: 'intore',
  },
  {
    id: 'music-ingoma',
    youtubeSearch: 'Rwanda+ingoma+royal+drums+traditional+ceremony',
    title: 'Ingoma — Royal Drum Ceremony',
    artist: 'Rwanda Cultural Heritage',
    genre: 'ingoma',
    description: 'The sacred royal drums of Rwanda — ingoma were at the heart of every royal ceremony and are still played at national celebrations today.',
    duration: '~6 min',
    imageKey: 'drums',
  },
  {
    id: 'music-imvyino',
    youtubeSearch: 'Rwanda+imvyino+traditional+celebration+songs+Amasimbi',
    title: "Imvyino — Celebration Songs",
    artist: "Amasimbi n'Amakombe",
    genre: 'imvyino',
    description: "Imvyino are joyful group songs for celebrations, weddings, and community gatherings. Amasimbi n'Amakombe was one of Rwanda's most celebrated cultural groups.",
    duration: '~4 min',
    imageKey: 'royal',
  },
  {
    id: 'music-sophie-inanga',
    youtubeSearch: 'Sophie+Nzayisenga+inanga+Rwanda+traditional',
    title: 'Inanga — Solo Performance',
    artist: 'Sophie Nzayisenga',
    genre: 'inanga',
    description: "Sophie Nzayisenga is one of Rwanda's most celebrated inanga players, continuing the legacy of her father Thomas Kirusu. A rare and beautiful solo performance.",
    duration: '~7 min',
    imageKey: 'inanga',
  },
  {
    id: 'music-ikinimba',
    youtubeSearch: 'Rwanda+ikinimba+traditional+dance+kings+epic',
    title: 'Ikinimba — Epic Dance of Kings',
    artist: 'Rwanda Ballet National',
    genre: 'ikinimba',
    description: "Ikinimba is Rwanda's most revered dance tradition — it tells the stories of kings and heroes through movement, accompanied by ngoma, ikembe, and inanga.",
    duration: '~8 min',
    imageKey: 'mwami',
  },
];

export default function Listen() {
  const { t, language } = useLanguage();
  const { awardXP, trackActivity } = useGamificationContext();
  const { user } = useAuth();
  const [fables, setFables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oralFilter, setOralFilter] = useState('all'); // all | fables | music | poetry | inanga
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
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

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
          const mapped = data.audio.map((item, i) => {
            // Match API items with local story files based on title
            // item.title may be a plain string (DB) or a {en,fr,rw} object — resolve first
            const titleStr = typeof item.title === 'object' && item.title !== null
              ? (item.title.en || item.title.rw || item.title.fr || '')
              : (item.title || '');
            let storyId = null;
            if (titleStr.includes('Gihanga')) storyId = 'gihanga-ngomijana';
            else if (titleStr.includes('Nyirarucyaba')) storyId = 'nyirarucyaba';
            else if (titleStr.includes('Ruganzu')) storyId = 'ruganzu-ii-ndoli';
            else if (titleStr.includes('Kigeli')) storyId = 'kigeli-iv-rwabugiri';
            else if (titleStr.toLowerCase().includes('inanga')) storyId = 'inanga-mazimpaka';
            else if (titleStr.toLowerCase().includes('ryangombe')) storyId = 'ryangombe';
            
            const categoryStr = typeof item.category === 'object' && item.category !== null
              ? (item.category.en || item.category.rw || item.category.fr || '')
              : (item.category || '');
            const descStr = typeof item.description === 'object' && item.description !== null
              ? (item.description.en || item.description.rw || item.description.fr || '')
              : (item.description || '');

            return {
              id: item.id,
              genre: categoryStr,
              title: titleStr,
              narrator: descStr,
              duration: item.duration
                ? `${Math.floor(item.duration / 60)}:${String(
                    item.duration % 60
                  ).padStart(2, "0")}`
                : "0:00",
              durationSec: item.duration || 0,
              image: item.thumbnail_url || resolveAudioImage(item, i),
              audioUrl: item.audio_url || '',
              storyId: storyId, // Link to local story file
            };
          });
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
    // item_id in the DB is an integer — validate before sending
    const itemId = Number(track?.id);
    if (!track?.id || !Number.isFinite(itemId) || itemId <= 0) {
      alert("This track cannot be saved yet — it has no archive entry.");
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
          itemId,
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
    
    // Try to get story content - first by storyId, then by database ID mapping
    let story = STORY_CONTENT_MAP[track.storyId];
    if (!story && track.id) {
      const storyIdFromDb = DB_ID_TO_STORY_ID[Number(track.id)];
      if (storyIdFromDb) story = STORY_CONTENT_MAP[storyIdFromDb];
    }
    
    let narrationText;
    
    if (story && story.content) {
      // Use full story content from local story file
      // Handle language-specific content objects (e.g., { en: [...], rw: [...], fr: [...] })
      let storyText;
      if (typeof story.content === 'object' && !Array.isArray(story.content)) {
        // Language-specific content object
        storyText = story.content[language] || story.content.en || Object.values(story.content)[0];
        if (Array.isArray(storyText)) {
          storyText = storyText.join(' ');
        }
      } else {
        // Legacy string or array content
        storyText = Array.isArray(story.content) ? story.content.join(' ') : story.content;
      }
      narrationText = `${track.title}. ${storyText}`;
    } else if (track.content) {
      // Fall back to content string baked directly into the track (from audio.json)
      narrationText = `${track.title}. ${track.content}`;
    } else {
      // Last resort: title + short description
      narrationText = `${track.title}. ${track.narrator || track.genre || 'A story from Rwanda cultural heritage.'}`;
    }
    
    const wordCount = narrationText.split(/\s+/).length;
    const estimatedDuration = Math.max(30, Math.round(wordCount / 2.5)); // ~150 words per minute
    
    // Voice configuration based on selected language
    const voiceConfig = {
      en: {
        id: selectedVoice,
        name: selectedVoice === 1 ? 'Kamanzi' : selectedVoice === 2 ? 'Ineza' : 'Umutoni',
        preferredVoiceHints: selectedVoice === 1 ? ['male', 'daniel', 'david'] : ['female', 'samantha', 'zira'],
        rate: selectedVoice === 1 ? 0.88 : selectedVoice === 2 ? 1 : 0.92,
        pitch: selectedVoice === 1 ? 0.82 : selectedVoice === 2 ? 1 : 1.08,
        lang: 'en-GB',
      },
      fr: {
        id: selectedVoice,
        name: selectedVoice === 1 ? 'Kamanzi' : selectedVoice === 2 ? 'Ineza' : 'Umutoni',
        // Always use French voice hints when language is French
        preferredVoiceHints: selectedVoice === 1
          ? ['thomas', 'nicolas', 'french', 'fr-fr', 'fr_fr']
          : ['amelie', 'thomas', 'french', 'fr-fr', 'fr_fr'],
        rate: selectedVoice === 1 ? 0.88 : selectedVoice === 2 ? 1 : 0.92,
        pitch: selectedVoice === 1 ? 0.82 : selectedVoice === 2 ? 1 : 1.08,
        lang: 'fr-FR',
      },
      rw: {
        id: selectedVoice,
        name: selectedVoice === 1 ? 'Kamanzi' : selectedVoice === 2 ? 'Ineza' : 'Umutoni',
        preferredVoiceHints: selectedVoice === 1 ? ['male', 'daniel', 'david'] : ['female', 'samantha', 'zira', 'rwanda', 'kinyarwanda'],
        rate: selectedVoice === 1 ? 0.88 : selectedVoice === 2 ? 1 : 0.92,
        pitch: selectedVoice === 1 ? 0.82 : selectedVoice === 2 ? 1 : 1.08,
        lang: 'rw-RW',
      },
    };
    
    return {
      mode: 'speech-synthesis',
      title: track.title,
      text: narrationText,
      estimatedDuration: estimatedDuration,
      voice: voiceConfig[language] || voiceConfig.en,
    };
  }, [getSelectedVoice, language]);

  const fetchNarration = useCallback(async (track) => {
    // Skip API call for non-numeric IDs (audio.json items use string IDs like "story-gihanga")
    // These don't exist in the database, so use local narration directly
    const numericId = Number(track.id);
    if (!track.id || !Number.isFinite(numericId) || numericId <= 0 || String(track.id).startsWith('fallback-')) {
      return getLocalNarration(track);
    }
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
      
      if (isPlaying && !isSpeechPaused) {
        // Pause the speech
        window.speechSynthesis.pause();
        clearSpeechTimer();
        setIsSpeechPaused(true);
      } else if (isPlaying && isSpeechPaused) {
        // Resume the speech
        window.speechSynthesis.resume();
        startSpeechProgress(duration || speechNarration?.estimatedDuration || 30);
        setIsSpeechPaused(false);
      } else if (!isPlaying && speechNarration) {
        // Start new speech
        speakNarration(speechNarration);
        setIsSpeechPaused(false);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(p => !p);
  }, [clearSpeechTimer, currentTrack, duration, isPlaying, isSpeechPaused, playbackMode, speakNarration, speechNarration, startSpeechProgress]);

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

  // ── Doomshield layout data ─────────────────────────────────────────────────
  const ORAL_FILTERS = [
    { id: 'all',    label: t('listen.allOralWorks') },
    { id: 'fables', label: t('listen.fablesAndMyths') },
    { id: 'music',  label: t('listen.traditionalMusic') },
    { id: 'poetry', label: t('listen.royalPoetry') },
    { id: 'inanga', label: t('listen.fluteInanga') },
  ];

  const oralRows = useMemo(() => {
    const fableRows = fables.map((fable, i) => ({
      key: `fable-${fable.id ?? i}`,
      kind: 'fable',
      title: fable.title,
      tag: fable.genre,
      desc: fable.narrator,
      duration: fable.duration,
      fable,
      isCurrent: currentTrack && (currentTrack.id === fable.id || currentTrack.title === fable.title),
    }));
    const songRows = TRADITIONAL_SONGS.map((song) => ({
      key: `song-${song.id}`,
      kind: 'song',
      title: song.title,
      tag: t(`listen.musicGenre.${song.genre}`) || song.genre,
      genre: song.genre,
      desc: song.description,
      duration: song.duration,
      song,
      href: `https://www.youtube.com/results?search_query=${song.youtubeSearch}`,
    }));
    const text = (r) => `${r.title} ${r.tag} ${r.desc} ${r.genre || ''}`.toLowerCase();
    switch (oralFilter) {
      case 'fables': return fableRows;
      case 'music':  return songRows;
      case 'poetry': return [...fableRows, ...songRows].filter((r) => /poet|ibyivugo|royal|ubwami|praise|king|umwami/.test(text(r)));
      case 'inanga': return [...fableRows, ...songRows].filter((r) => /inanga|flute|umwirongi|zither/.test(text(r)));
      default:       return [...fableRows, ...songRows];
    }
  }, [fables, oralFilter, currentTrack, t]);

  const PROVERB_FILTERS = [
    { id: 'all',    label: t('listen.filterAll') || 'All' },
    { id: 'unread', label: t('listen.filterUnread') || 'Unread' },
    { id: 'read',   label: t('listen.filterRead') || 'Read' },
  ];

  // Transcript: paragraphs of the current story; the active one follows playback progress.
  const transcriptLines = useMemo(() => {
    const track = currentTrack;
    let story = track ? STORY_CONTENT_MAP[track.storyId] : ruganzuStory;
    if (!story && track?.id) {
      const sid = DB_ID_TO_STORY_ID[Number(track.id)];
      if (sid) story = STORY_CONTENT_MAP[sid];
    }
    if (!story?.content) return [];
    let text = story.content;
    if (typeof text === 'object' && !Array.isArray(text)) text = text[language] || text.en || Object.values(text)[0];
    if (Array.isArray(text)) text = text.join('\n\n');
    return String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }, [currentTrack, language]);

  const activeLine = transcriptLines.length && duration > 0
    ? Math.min(transcriptLines.length - 1, Math.floor((currentTime / duration) * transcriptLines.length))
    : -1;

  const featuredTitle = currentTrack ? currentTrack.title : t('listen.ruganzuTitle');
  const featuredDesc = currentTrack ? currentTrack.narrator : t('listen.ruganzuDesc');
  const playerImage = currentTrack ? (currentTrack.image || RuganzuImg) : RuganzuImg;
  const canSaveCurrent = currentTrack && Number.isFinite(Number(currentTrack.id)) && Number(currentTrack.id) > 0;

  const shareFeatured = async () => {
    const text = `${featuredTitle} — Umuco-core`;
    try {
      if (navigator.share) await navigator.share({ title: featuredTitle, text, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setReportMessage(t('dashboard.linkCopied')); setTimeout(() => setReportMessage(''), 2500); }
    } catch { /* cancelled */ }
  };

  const seekBy = (secs) => {
    if (playbackMode === 'audio' && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration || 0, currentTime + secs));
    }
  };

  const PlayIcon = ({ playing, size = 14 }) => (playing ? <Pause size={size} fill="currentColor" /> : <Play size={size} fill="currentColor" />);

  return (
    <Layout searchPlaceholder={t('ui.searchArchive')}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <div className="lsn">
        <div className="lsn-main">
          {/* Featured */}
          <section className="lsn-hero">
            <div className="lsn-hero-wave" aria-hidden="true">
              {[38, 64, 30, 96, 72, 120, 58, 88, 46, 104, 66, 40].map((h, i) => <i key={i} style={{ height: h }} />)}
            </div>
            <div className="lsn-hero-top">
              <span className="ds-pill">{t('listen.featured')}</span>
              <span className="ds-pill ds-pill--muted"><Clock size={11} /> {currentTrack ? formatTime(duration) : '45 min'}</span>
              <span className="lsn-hero-icons">
                {canSaveCurrent && (
                  <button type="button" className="ds-icon-btn" onClick={() => handleAddToLibrary(currentTrack)} aria-label={t('listen.addToLibrary')} disabled={savingTrackId === currentTrack?.id}>
                    <Bookmark size={15} fill={savingTrackId === currentTrack?.id ? 'currentColor' : 'none'} />
                  </button>
                )}
                <button type="button" className="ds-icon-btn" onClick={shareFeatured} aria-label={t('home.share')}>
                  <Share2 size={15} />
                </button>
                {currentTrack && (
                  <FlagControl
                    type="audio"
                    itemId={currentTrack.id}
                    title={currentTrack.title}
                    onToast={(text) => { setReportMessage(text); setTimeout(() => setReportMessage(''), 3000); }}
                  />
                )}
              </span>
            </div>
            <span className="lsn-hero-kicker">{currentTrack ? currentTrack.genre : t('listen.featuredKicker')}</span>
            <h1>{featuredTitle}</h1>
            <p>{featuredDesc}</p>
            <button type="button" className="ds-btn lsn-hero-play" onClick={togglePlayPause}>
              <PlayIcon playing={isPlaying} size={11} />
              {isPlaying ? t('listen.pause') : t('listen.listenNow')}
            </button>
          </section>

          {/* Orals */}
          <div className="ds-section">
            <span className="ds-section-label">{t('listen.orals')}</span>
            <div className="ds-chips">
              {ORAL_FILTERS.map((f) => (
                <button key={f.id} type="button" className={`ds-chip ${oralFilter === f.id ? 'active' : ''}`} onClick={() => setOralFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lsn-list">
            {loading && (oralFilter === 'all' || oralFilter === 'fables') && Array.from({ length: 3 }).map((_, i) => (
              <div key={`sk-${i}`} className="lsn-row lsn-row--skeleton" aria-hidden="true">
                <span className="lsn-row-play" />
                <span className="lsn-row-text"><i /><i /></span>
              </div>
            ))}
            {!loading && oralRows.length === 0 && <p className="ds-empty">{t('listen.noOrals')}</p>}
            {oralRows.map((row) => {
              const playing = row.isCurrent && isPlaying;
              const onPlay = () => {
                if (row.kind === 'fable') {
                  if (row.isCurrent) togglePlayPause(); else handleFableClick(row.fable);
                } else {
                  awardXP(10, `Opened traditional song: ${row.title}`);
                  window.open(row.href, '_blank', 'noopener,noreferrer');
                }
              };
              return (
                <div key={row.key} className={`lsn-row ${row.isCurrent ? 'is-current' : ''}`}>
                  <button type="button" className="lsn-row-play" onClick={onPlay} aria-label={`${playing ? t('listen.pause') : t('listen.listenNow')}: ${row.title}`}>
                    <PlayIcon playing={playing} size={12} />
                  </button>
                  <button type="button" className="lsn-row-text" onClick={onPlay}>
                    <span className="lsn-row-title">
                      {row.title}
                      {row.tag && <span className="ds-pill ds-pill--muted">{row.tag}</span>}
                    </span>
                    <span className="lsn-row-desc">{row.desc}</span>
                  </button>
                  <span className="lsn-row-duration">
                    {row.kind === 'song' ? t('listen.onYoutube') : row.duration}
                  </span>
                  {row.kind === 'fable' && Number(row.fable?.id) > 0 ? (
                    <button type="button" className="ds-icon-btn" onClick={() => handleAddToLibrary(row.fable)} aria-label={t('listen.addToLibrary')}>
                      {savingTrackId === row.fable.id ? <Bookmark size={14} fill="currentColor" /> : <EllipsisVertical size={15} />}
                    </button>
                  ) : <span className="lsn-row-spacer" />}
                </div>
              );
            })}
          </div>

          {/* Proverbs */}
          <div className="ds-section">
            <span className="ds-section-label">{t('listen.proverbs')}</span>
            <div className="lsn-proverb-tools">
              <div className="ds-chips">
                {PROVERB_FILTERS.map((f) => (
                  <button key={f.id} type="button" className={`ds-chip ${proverbFilter === f.id ? 'active' : ''}`} onClick={() => setProverbFilter(f.id)}>
                    {f.label}{f.id === 'read' && flippedCards.size > 0 ? ` · ${flippedCards.size}` : ''}
                  </button>
                ))}
              </div>
              <select className="lsn-sort" value={proverbSort} onChange={(e) => setProverbSort(e.target.value)} aria-label={t('listen.sortDefault')}>
                <option value="default">{t('listen.sortDefault') || 'Default'}</option>
                <option value="unread-first">{t('listen.sortUnreadFirst') || 'Unread first'}</option>
                <option value="read-first">{t('listen.sortReadFirst') || 'Read first'}</option>
                <option value="alphabetical">{t('listen.sortAlpha') || 'A–Z'}</option>
              </select>
            </div>
          </div>

          <div className="proverb-cards-grid lsn-proverbs">
            {visibleProverbs.map((proverb) => {
              const isFlipped = flippedCards.has(proverb.id);
              let frontText, backText;
              if (language === 'rw') { frontText = proverb.rw; backText = proverb.en; }
              else if (language === 'fr') { frontText = proverb.fr ?? proverb.en; backText = proverb.rw; }
              else { frontText = proverb.en; backText = proverb.rw; }
              return (
                <div
                  key={proverb.id}
                  className={`proverb-flip-card${isFlipped ? ' flipped' : ''}`}
                  onClick={() => handleFlipCard(proverb.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={isFlipped ? backText : t('listen.tapToReveal')}
                  onKeyDown={(e) => e.key === 'Enter' && handleFlipCard(proverb.id)}
                >
                  <div className="proverb-flip-inner">
                    <div className="proverb-flip-front">
                      <div className="proverb-audio-controls">
                        {['en', 'fr'].map((lang) => {
                          const cfg = PROVERB_LANG_CONFIG[lang];
                          const isActive = proverbAudioState.id === proverb.id && proverbAudioState.lang === lang && proverbAudioState.playing;
                          return (
                            <button
                              key={lang}
                              type="button"
                              className={`proverb-lang-btn${isActive ? ' active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); speakProverb(proverb, lang); }}
                              aria-label={`${isActive ? 'Stop' : 'Play'} proverb in ${cfg.label}`}
                            >
                              {isActive ? <Pause size={8} fill="currentColor" /> : <Play size={8} fill="currentColor" />}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="proverb-card-label">{t('listen.proverbLabel')}</div>
                      <p className="proverb-card-rw">&lsquo;{frontText}&rsquo;</p>
                      <span className="proverb-card-hint">{t('listen.tapToReveal')}</span>
                      <FlagControl
                        type="proverb"
                        itemId={proverb.id}
                        title={frontText}
                        onToast={(text) => { setReportMessage(text); setTimeout(() => setReportMessage(''), 3000); }}
                      />
                    </div>
                    <div className="proverb-flip-back">
                      {isFlipped && <span className="proverb-read-badge">✓</span>}
                      <div className="proverb-card-label">{t('listen.meaning')}</div>
                      <p className="proverb-card-en">&ldquo;{backText}&rdquo;</p>
                      <p className="proverb-card-meaning">{getProverbMeaning(proverb)}</p>
                      <span className="proverb-card-xp">{t('listen.xpEarned')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visibleProverbs.length === 0 && (
            <p className="ds-empty">{t('listen.noProverbsMatch') || 'No proverbs match this filter.'}</p>
          )}
          {visibleProverbs.length < filteredProverbCount && (
            <button type="button" className="ds-btn ds-btn--soft lsn-more" onClick={() => setProverbPage((p) => p + 1)}>
              {t('listen.loadMore')}
            </button>
          )}
        </div>

        {/* Playback panel */}
        <aside className="lsn-panel">
          <div className="lsn-panel-head">
            <span>{t('listen.playback')}</span>
            <i className={isPlaying ? 'live' : ''} aria-hidden="true" />
          </div>
          <div className="lsn-cover">
            <img src={playerImage} alt="" />
            <div className="lsn-cover-text">
              <strong>{featuredTitle}</strong>
              <small>{currentTrack ? (currentTrack.genre || t('listen.oralArchive')) : t('listen.oralArchive')}</small>
            </div>
          </div>
          <div className="lsn-progress" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="lsn-times">
            <span>{formatTime(currentTime)}</span>
            <span>{playbackMode === 'speech-synthesis' ? t('listen.aiVoice') : formatTime(duration)}</span>
          </div>
          <div className="lsn-controls">
            <button type="button" className="ds-icon-btn" onClick={() => seekBy(-10)} aria-label={t('listen.back10')}><RotateCcw size={16} /></button>
            <button type="button" className="ds-icon-btn" onClick={() => seekBy(-30)} aria-label={t('listen.back30')}><SkipBack size={16} /></button>
            <button type="button" className="lsn-play" onClick={togglePlayPause} aria-label={isPlaying ? t('listen.pause') : t('listen.listenNow')}>
              <PlayIcon playing={isPlaying} size={18} />
            </button>
            <button type="button" className="ds-icon-btn" onClick={() => seekBy(30)} aria-label={t('listen.forward30')}><SkipForward size={16} /></button>
            <button type="button" className="ds-icon-btn" onClick={shareFeatured} aria-label={t('home.share')}><Share2 size={15} /></button>
          </div>

          <div className="lsn-transcript-head">
            <span>{t('listen.transcript')}</span>
            <span className="lsn-transcript-lang"><Languages size={12} /> {language === 'rw' ? 'Kinyarwanda' : language === 'fr' ? 'Français' : 'English'}</span>
          </div>
          <div className="lsn-transcript">
            {transcriptLines.length === 0 && <p className="lsn-transcript-empty">{t('listen.noTranscript')}</p>}
            {transcriptLines.map((line, i) => (
              <p key={i} className={i === activeLine ? 'active' : ''}>
                {duration > 0 && <span>[{formatTime((duration / transcriptLines.length) * i)}]</span>} {line}
              </p>
            ))}
          </div>
        </aside>
      </div>
      {reportMessage && <div className="contribute-toast">{reportMessage}</div>}
    </Layout>
  );
}
