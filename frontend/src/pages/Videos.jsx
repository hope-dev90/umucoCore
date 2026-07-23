import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import './Videos.css';
import IntoreImg from '../assets/home/intore.jpg';
import AgasekeImg from '../assets/explore/weaving_agaseke.jpg';
import ImigongoImg from '../assets/explore/imigongo.jpg';

const fallbackImages = [IntoreImg, AgasekeImg, ImigongoImg];

export default function Videos() {
  const { t } = useLanguage();
  const { awardXP } = useGamificationContext();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const [awardedItems, setAwardedItems] = useState(new Set());
  const [savingVideoId, setSavingVideoId] = useState(null);
  const [topbarSearch, setTopbarSearch] = useState("");

  const filteredVideos = videos.filter(video => {
    const query = topbarSearch.toLowerCase();
    return (video.title || "").toLowerCase().includes(query) ||
           (video.narrator || "").toLowerCase().includes(query) ||
           (video.genre || "").toLowerCase().includes(query);
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/video');
        const data = await res.json();
        if (data.video && data.video.length > 0) {
          const mapped = data.video.map((v, i) => ({
            id: v.id,
            genre: v.category,
            title: v.title,
            narrator: v.description,
            duration: v.duration ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2, '0')}` : '00:00',
            durationSec: v.duration || 0,
            image: v.thumbnail_url || fallbackImages[i % fallbackImages.length],
            videoUrl: v.video_url || '',
          }));
          setVideos(mapped);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [t]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingVideoPlay');
    if (!pending || videos.length === 0) return;
    try {
      const payload = JSON.parse(pending);
      localStorage.removeItem('pendingVideoPlay');
      const video = videos.find(v => String(v.id) === String(payload.itemId));
      if (video) playVideo(video);
    } catch {
      localStorage.removeItem('pendingVideoPlay');
    }
  }, [videos]);

  const playVideo = useCallback((video) => {
    if (!video.videoUrl) {
      alert("No video file available for this item yet.");
      return;
    }
    setCurrentVideo(video);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.src = video.videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current || !currentVideo) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(p => !p);
  }, [isPlaying, currentVideo]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleVideoClick = useCallback((video) => {
    playVideo(video);
    if (!awardedItems.has(video.title)) {
      awardXP(25, `Watched video: ${video.title}`);
      setAwardedItems(prev => new Set([...prev, video.title]));
    }
  }, [awardedItems, awardXP, playVideo]);

  const handleAddToLibrary = useCallback(async (video) => {
    if (!user) {
      alert("Please sign in to save to your library.");
      return;
    }
    if (!video.videoUrl) {
      alert("No video file available for this item yet.");
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
          itemType: "video",
          itemId: Number(video.id),
          itemTitle: video.title,
          itemSubtitle: video.narrator,
          itemImage: video.image || "",
          itemMeta: { duration: video.duration, videoUrl: video.videoUrl },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to save (${res.status})`);
      }
      setSavingVideoId(video.id);
      setTimeout(() => setSavingVideoId(null), 1500);
    } catch (err) {
      console.error("Save to library failed:", err);
      alert(err.message || "Failed to add to library.");
    }
  }, [user]);

  const formatTime = (secs) => {
    if (!secs || !Number.isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Layout searchPlaceholder={t('search.placeholder')} searchQuery={topbarSearch} onSearchChange={setTopbarSearch}>
      <div className="videos-page">
        <div>
          <div className="featured-video">
            <div className="featured-video-meta">
              <span className="featured-badge">{t('videos.featured')}</span>
              <span className="featured-duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {currentVideo ? formatTime(duration) : "8 min"}
              </span>
            </div>
            <h1>{currentVideo ? currentVideo.title : t('videos.intoreTitle')}</h1>
            <p>{currentVideo ? currentVideo.narrator : t('videos.intoreDesc')}</p>
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
                {isPlaying ? t('videos.pause') : t('videos.watchNow')}
              </button>
              <button
                className="library-btn"
                onClick={() => currentVideo && handleAddToLibrary(currentVideo)}
                disabled={savingVideoId === currentVideo?.id}
                style={{ opacity: currentVideo ? 1 : 0.6, cursor: currentVideo ? 'pointer' : 'not-allowed' }}
              >
                {savingVideoId === currentVideo?.id ? 'Saved ✓' : t('videos.addToLibrary')}
              </button>
            </div>
          </div>

          <div className="videos-section">
            <div className="videos-section-header">
              <span className="videos-section-title">{t('videos.traditionalPerformances')}</span>
              <span className="videos-view-all">{t('videos.viewAll')}</span>
            </div>
            <div className="video-cards">
              {loading ? (
                <p>Loading videos...</p>
              ) : filteredVideos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No videos match your search.</p>
              ) : (
                filteredVideos.map((video, i) => (
                  <div key={i} className="video-card" onClick={() => handleVideoClick(video)} style={{ cursor: 'pointer' }}>
                    <div className="video-thumb">
                      <img src={video.image} alt={video.title} />
                      <div className="video-play-overlay" onClick={(e) => { e.stopPropagation(); handleVideoClick(video); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    <div className="video-info">
                      <div className="video-genre">{video.genre}</div>
                      <div className="video-title">{video.title}</div>
                      <div className="video-narrator">{video.narrator}</div>
                      <div className="video-duration">{video.duration}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="video-panel">
          <div className="video-player">
            {currentVideo ? (
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
              />
            ) : (
              <img src={IntoreImg} alt="Intore Dance" />
            )}
          </div>
          <div className="player-info">
            <div className="player-title">{currentVideo ? currentVideo.title : t('videos.intoreTitle')}</div>
            <div className="player-narrator">{currentVideo ? (currentVideo.narrator || currentVideo.genre) : "Traditional Performance • Rwanda"}</div>
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
              <button className="player-btn" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }}>
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
              <button className="player-btn" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }}>
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
        </div>
      </div>
    </Layout>
  );
}
