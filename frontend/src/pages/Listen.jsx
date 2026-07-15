import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import './Listen.css';
import RuganzuImg from '../assets/listen/ruganzu.png';

// Map audio title keywords / categories to public image paths
const AUDIO_IMAGE_MAP = {
  byivugo:      '/images/audio/byivugo.jpg',
  ibyivugo:     '/images/audio/ibyivugo.jpg',
  crane:        '/images/audio/crane.jpg',
  drums:        '/images/audio/drums.jpg',
  drum:         '/images/audio/drums.jpg',
  ingoma:       '/images/audio/drums.jpg',
  farming:      '/images/audio/farming.jpg',
  ubudehe:      '/images/audio/farming.jpg',
  inanga:       '/images/audio/inanga.jpg',
  intore:       '/images/audio/intore.jpg',
  moon:         '/images/audio/moon.jpg',
  mwami:        '/images/audio/mwami.jpg',
  nyamasheke:   '/images/audio/nyamasheke.jpg',
  rain:         '/images/audio/rain.jpg',
  'royal-court':'/images/audio/royal-court.jpg',
  royal:        '/images/audio/royal-court.jpg',
  court:        '/images/audio/royal-court.jpg',
  ruganzu:      '/images/audio/ruganzu.png',
  'war-drums':  '/images/audio/war-drums.jpg',
  war:          '/images/audio/war-drums.jpg',
};

const ALL_AUDIO_IMAGES = Object.values(AUDIO_IMAGE_MAP);

function resolveAudioImage(item, index) {
  const key = `${item.title} ${item.category}`.toLowerCase();
  for (const [word, path] of Object.entries(AUDIO_IMAGE_MAP)) {
    if (key.includes(word)) return path;
  }
  return ALL_AUDIO_IMAGES[index % ALL_AUDIO_IMAGES.length];
}

export default function Listen() {
  const { t } = useLanguage();
  const { awardXP } = useGamificationContext();
  const { user } = useAuth();
  const [fables, setFables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const [awardedItems, setAwardedItems] = useState(new Set());
  const [proverbs, setProverbs] = useState([]);
  const [savingTrackId, setSavingTrackId] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/audio");
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
          setFables([
            {
              genre: t("listen.migani"),
              title: t("listen.craneStory"),
              narrator: t("listen.narratedBy") + " Jean d'Amour",
              duration: "12:40",
              durationSec: 760,
              image: '/images/audio/crane.jpg',
              audioUrl: '',
            },
            {
              genre: t("listen.migani"),
              title: t("listen.moonStory"),
              narrator: t("listen.narratedBy") + " Beatrice U.",
              duration: "15:15",
              durationSec: 915,
              image: '/images/audio/moon.jpg',
              audioUrl: '',
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching audio data:", err);
        setFables([
          {
            genre: t("listen.migani"),
            title: t("listen.craneStory"),
            narrator: t("listen.narratedBy") + " Jean d'Amour",
            duration: "12:40",
            durationSec: 760,
            image: '/images/audio/crane.jpg',
            audioUrl: '',
          },
          {
            genre: t("listen.migani"),
            title: t("listen.moonStory"),
            narrator: t("listen.narratedBy") + " Beatrice U.",
            duration: "15:15",
            durationSec: 915,
            image: '/images/audio/moon.jpg',
            audioUrl: '',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchProverbs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/proverbs/featured?limit=6");
        const data = await res.json();
        if (data.proverbs && data.proverbs.length > 0) {
          setProverbs(
            data.proverbs.map((p, i) => ({
              id: p.id,
              text: p.text,
              translation: p.translation || p.text,
              meta: p.source || "Rwandan oral tradition",
              numClass: i % 2 === 0 ? "gold" : "olive",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching proverbs:", err);
      }
    };

    fetchAudio();
    fetchProverbs();
  }, [t]);

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
    if (!track.audioUrl) {
      alert("No audio file available for this track yet.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please sign in to save to your library.");
        return;
      }
      const res = await fetch("http://localhost:5000/api/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemType: "audio",
          itemId: Number(track.id),
          itemTitle: track.title,
          itemSubtitle: track.narrator,
          itemImage: track.image || "",
          itemMeta: { duration: track.duration, audioUrl: track.audioUrl },
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

  const playTrack = useCallback((track) => {
    if (!track.audioUrl) {
      alert("No audio file available for this track yet.");
      return;
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(p => !p);
  }, [isPlaying, currentTrack]);

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
  }, []);

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
            <div className="proverb-list">
              {proverbs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No proverbs available yet.</p>
              ) : (
                proverbs.map((proverb, i) => (
                  <div key={proverb.id || i} className="proverb-item">
                    <div className={`proverb-num ${proverb.numClass}`}>{i + 1}</div>
                    <div className="proverb-info">
                      <div className="proverb-text">{proverb.text}</div>
                      <div className="proverb-meta">{proverb.meta}</div>
                    </div>
                    <button className="proverb-play">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
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
              <button className="player-btn" onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10); }}>
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
              <button className="player-btn" onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>
          </div>
          <div className="player-extra">
            <span className="player-speed">⊙ 1.0x</span>
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
    </Layout>
  );
}
