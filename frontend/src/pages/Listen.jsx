import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Listen.css';
import CraneStory from '../assets/listen/crane-story.jpg';
import MoonStory from '../assets/listen/moon-story.jpg';
import RuganzuImg from '../assets/listen/ruganzu.png';

const fables = [
  {
    genre: 'Migani',
    title: 'Why the Crane has a Crown',
    narrator: "Narrated by Jean d'Amour",
    duration: '12:40',
    image: CraneStory,
  },
  {
    genre: 'Migani',
    title: 'The Man on the Moon',
    narrator: 'Narrated by Beatrice U.',
    duration: '15:15',
    image: MoonStory,
  },
];

const proverbs = [
  {
    text: '"Urukwavu rurinda rukuze rukonshwa n\'imbwa."',
    meta: 'Wisdom of the Elders • Commentary by Dr. Munyaeza',
    numClass: 'gold',
  },
  {
    text: '"Abari bose ntabwo ari abagabo."',
    meta: 'Social Dynamics • Commentary by Prof. Nyiranong',
    numClass: 'olive',
  },
];

export default function Listen() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <Layout searchPlaceholder="Search the archive...">
      <div className="listen-page">
        {/* LEFT: main */}
        <div>
          {/* Featured Epic */}
          <div className="featured-epic">
            <div className="featured-epic-meta">
              <span className="featured-badge"> Featured Epic</span>
              <span className="featured-duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                45 min
              </span>
            </div>
            <h1>The Song of Ruganzu II: The King's Return</h1>
            <p>
              A legendary oral recitation by Mzee Silas, depicting the mythical homecoming
              of the great King Ruganzu Ndoli. Experience the rhythmic flow of pre-colonial royal court poetry.
            </p>
            <div className="featured-actions">
              <button className="play-btn" onClick={() => setIsPlaying(p => !p)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  {isPlaying
                    ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                    : <polygon points="5 3 19 12 5 21 5 3"/>
                  }
                </svg>
                {isPlaying ? 'Pause' : 'Listen Now'}
              </button>
              <button className="library-btn">Add to Library</button>
            </div>
          </div>

          {/* Fables & Myths */}
          <div className="listen-section">
            <div className="listen-section-header">
              <span className="listen-section-title">Fables &amp; Myths</span>
              <span className="listen-view-all">View All +</span>
            </div>
            <div className="fable-cards">
              {fables.map((f, i) => (
                <div key={i} className="fable-card">
                  <div className="fable-thumb">
                    <img src={f.image} alt={f.title} />
                  </div>
                  <div className="fable-info">
                    <div className="fable-genre">{f.genre}</div>
                    <div className="fable-title">{f.title}</div>
                    <div className="fable-narrator">{f.narrator}</div>
                    <div className="fable-duration">+ {f.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="listen-divider" />

          {/* Daily Proverbs */}
          <div className="listen-section">
            <div className="listen-section-header">
              <span className="listen-section-title">Daily Proverbs (Imigani Migufi)</span>
            </div>
            <div className="proverb-list">
              {proverbs.map((p, i) => (
                <div key={i} className="proverb-item">
                  <div className={`proverb-num ${p.numClass}`}>{i + 1}</div>
                  <div className="proverb-info">
                    <div className="proverb-text">{p.text}</div>
                    <div className="proverb-meta">{p.meta}</div>
                  </div>
                  <button className="proverb-play">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Audio Player */}
        <div className="audio-panel">
          <div className="player-thumb">
        <img src={RuganzuImg} alt="Ruganzu II" />
            </div>

          <div className="player-info">
            <div className="player-title">Ruganzu II: The King's Return</div>
            <div className="player-narrator">Mzee Silas • Oral Tradition</div>
          </div>

          <div className="player-controls">
            <div className="player-progress">
              <div className="player-time">
                <span>12:45</span>
                <span>45:00</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
            </div>

            <div className="player-btns">
              {/* Rewind */}
              <button className="player-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                </svg>
              </button>

              {/* Play / Pause */}
              <button className="player-btn play-pause" onClick={() => setIsPlaying(p => !p)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {isPlaying
                    ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                    : <polygon points="5 3 19 12 5 21 5 3"/>
                  }
                </svg>
              </button>

              {/* Fast-forward */}
              <button className="player-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="player-extra">
            <span className="player-speed">⊙ 1.0x</span>
            <div className="player-extra-icons">
              <button className="player-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 010 7.07"/>
                  <path d="M19.07 4.93a10 10 0 010 14.14"/>
                </svg>
              </button>
              <button className="player-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="transcript-panel">
            <div className="transcript-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Transcript Highlighting
            </div>
            <p className="transcript-text">
              ...kuko rero Ruganzu amaze kugera mu mazi ya Nyabarongo, yari adi ko abami bamutegeeje...
            </p>
            <div className="transcript-highlight">
              "Nuko aherako ariterimbira abari aho, ijwi rye riragomira mu..."
            </div>
            <div className="transcript-tags">
              <span className="transcript-tag">Oral Tradition</span>
              <span className="transcript-tag">Poetry</span>
              <span className="transcript-tag">Historical Context</span>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
}
