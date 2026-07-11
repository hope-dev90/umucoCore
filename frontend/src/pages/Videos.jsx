import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import './Videos.css';
import IntoreImg from '../assets/listen/ruganzu.png';
import AgasekeImg from '../assets/listen/crane-story.jpg';
import ImigongoImg from '../assets/listen/moon-story.jpg';

export default function Videos() {
  const { t } = useLanguage();
  const { awardXP } = useGamificationContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback videos if backend isn't available
  const fallbackVideos = [
    {
      genre: t('videos.performance'),
      title: t('videos.intoreTitle'),
      narrator: t('videos.narratedBy') + ' Traditional Group',
      duration: '08:00',
      image: IntoreImg,
      category: 'Performance'
    },
    {
      genre: t('videos.crafts'),
      title: t('videos.agasekeTitle'),
      narrator: t('videos.narratedBy') + ' Master Weaver',
      duration: '12:00',
      image: AgasekeImg,
      category: 'Crafts'
    },
    {
      genre: t('videos.art'),
      title: t('videos.imigongoTitle'),
      narrator: t('videos.narratedBy') + ' Imigongo Artists',
      duration: '10:00',
      image: ImigongoImg,
      category: 'Art'
    }
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/video/featured');
        const data = await res.json();
        if (data.video && data.video.length > 0) {
          setVideos(data.video.map((v, i) => ({
            id: v.id,
            genre: v.category,
            title: v.title,
            narrator: v.description,
            duration: v.duration ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2, '0')}` : '00:00',
            image: v.thumbnail_url || [IntoreImg, AgasekeImg, ImigongoImg][i % 3],
            video_url: v.video_url
          })));
        } else {
          setVideos(fallbackVideos);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos(fallbackVideos);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [t]);

  const [awardedItems, setAwardedItems] = useState(new Set());

  const handleVideoClick = useCallback((video) => {
    if (!awardedItems.has(video.title)) {
      awardXP(25, `Watched video: ${video.title}`);
      setAwardedItems(prev => new Set([...prev, video.title]));
    }
  }, [awardedItems, awardXP]);

  return (
    <Layout searchPlaceholder={t('search.placeholder')}>
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
                8 min
              </span>
            </div>
            <h1>{t('videos.intoreTitle')}</h1>
            <p>{t('videos.intoreDesc')}</p>
            <div className="featured-actions">
              <button className="play-btn" onClick={() => { setIsPlaying(p => !p); handleVideoClick({ title: t('videos.intoreTitle') }); }}>
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
              <button className="library-btn">{t('videos.addToLibrary')}</button>
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
              ) : (
                videos.map((video, i) => (
                  <div key={i} className="video-card">
                    <div className="video-thumb">
                      <img src={video.image} alt={video.title} />
                      <div className="video-play-overlay" onClick={() => { setIsPlaying(p => !p); handleVideoClick(video); }}>
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
            <img src={IntoreImg} alt="Intore Dance" />
            <div className="video-play-center" onClick={() => setIsPlaying(p => !p)}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                {isPlaying
                  ? <>
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </>
                  : <polygon points="5 3 19 12 5 21 5 3" />
                }
              </svg>
            </div>
          </div>
          <div className="player-info">
            <div className="player-title">{t('videos.intoreTitle')}</div>
            <div className="player-narrator">Traditional Performance • Rwanda</div>
          </div>
          <div className="player-controls">
            <div className="player-progress">
              <div className="player-time">
                <span>02:30</span>
                <span>08:00</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '31%' }} />
              </div>
            </div>
            <div className="player-btns">
              <button className="player-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>
              <button className="player-btn play-pause" onClick={() => setIsPlaying(p => !p)}>
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
              <button className="player-btn">
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
