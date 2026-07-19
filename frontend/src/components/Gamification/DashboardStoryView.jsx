import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationContext } from '../../contexts/GamificationContext';
import { ReadingCompletePopup } from './ReadingCompletePopup';
import { StoryQuiz } from './StoryQuiz';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { localizeStory } from '../../utils/storyLocalization';
import './Gamification.css';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';

export function DashboardStoryView({ story, onClose, onComplete }) {
  const { awardXP, refresh, xp, level, leaderboard, getCurrentLevelData, getNextLevelData } = useGamificationContext();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const localizedStory = useMemo(() => localizeStory(story, language), [story, language]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const awardedRef = useRef(false);
  const completionNotifiedRef = useRef(false);
  const containerRef = useRef(null);
  const paragraphRefs = useRef([]);

  const bodyText = localizedStory?.content || localizedStory?.desc || localizedStory?.description || '';
  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length || 200;
  const xpReward = story?.xpReward ?? 50;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveParagraph(0);
    setShowQuiz(false);
    setShowCompletion(false);
    setSessionXP(0);
    awardedRef.current = false;
    completionNotifiedRef.current = false;
  }, [story?.id]);

  const triggerCompletion = useCallback(() => {
    if (!awardedRef.current) {
      awardedRef.current = true;
      awardXP(xpReward, 'story_completed').catch(() => {});
      setSessionXP(prev => prev + xpReward);
      refresh().catch(() => {});
    }

    if (localizedStory?.quiz?.length) {
      setShowQuiz(true);
    } else {
      if (!completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onComplete?.(localizedStory);
      }
      setShowCompletion(true);
    }
  }, [awardXP, localizedStory, onComplete, refresh, xpReward]);

  const handleQuizComplete = useCallback((bonusXP) => {
    if (bonusXP > 0) {
      awardXP(bonusXP, 'quiz_completed').catch(() => {});
      setSessionXP(prev => prev + bonusXP);
      refresh().catch(() => {});
    }
    setShowQuiz(false);
    if (!completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.(localizedStory);
    }
    setShowCompletion(true);
  }, [awardXP, localizedStory, onComplete, refresh]);

  const handleDismissCompletion = useCallback(() => {
    setShowCompletion(false);
    onClose();
    refresh().catch(() => {});
  }, [onClose, refresh]);

  const levelData = getCurrentLevelData?.() || {};
  const nextLevelData = getNextLevelData?.() || {};
  const requiredXP = nextLevelData?.requiredXP ?? levelData?.requiredXP ?? 1000;

  const image = localizedStory?.image_url || localizedStory?.image;
  const title = localizedStory?.title || t('gamification.story');
  const desc = localizedStory?.desc || localizedStory?.description || '';
  const category = localizedStory?.category || '';
  const location = localizedStory?.location || '';
  const readableContent = localizedStory?.content || desc || 'This heritage note is ready to explore in the archive.';
  const contentParagraphs = useMemo(
    () => readableContent.split('\n\n').map(paragraph => paragraph.trim()).filter(Boolean),
    [readableContent]
  );
  const checkpointCount = Math.max(contentParagraphs.length, 1);
  const progressPercent = Math.round(((activeParagraph + 1) / checkpointCount) * 100);
  const hasQuiz = Boolean(localizedStory?.quiz?.length);
  const isLastCheckpoint = activeParagraph >= checkpointCount - 1;

  const handleFinishReading = useCallback(() => triggerCompletion(), [triggerCompletion]);

  const handleNextCheckpoint = useCallback(() => {
    const next = Math.min(activeParagraph + 1, contentParagraphs.length - 1);
    setActiveParagraph(next);
    paragraphRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeParagraph, contentParagraphs.length]);

  const handleParagraphClick = useCallback((index) => {
    setActiveParagraph(index);
  }, []);

  useEffect(() => {
    if (showQuiz || !contentParagraphs.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.checkpoint) {
          setActiveParagraph(Number(visible.target.dataset.checkpoint));
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.25, 0.5, 0.75],
      }
    );

    paragraphRefs.current.forEach(node => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [contentParagraphs.length, showQuiz]);

  const decreaseFont = useCallback(() => {
    setFontScale(prev => Math.max(0.9, Number((prev - 0.1).toFixed(1))));
  }, []);

  const increaseFont = useCallback(() => {
    setFontScale(prev => Math.min(1.2, Number((prev + 0.1).toFixed(1))));
  }, []);

  return (
    <div className="dashboard-story-shell" ref={containerRef}>
      <div className="dashboard-story-nav">
        <button type="button" onClick={onClose} className="dashboard-story-back">
          <ArrowLeft size={16} />
          {t('reader.backToDashboard')}
        </button>

        {!showQuiz && (
          <div className="dashboard-story-controls" aria-label={t('reader.readingControls')}>
            <button type="button" onClick={decreaseFont} aria-label="Decrease reading text size">
              <Minus size={15} />
            </button>
            <span>{Math.round(fontScale * 100)}%</span>
            <button type="button" onClick={increaseFont} aria-label={t('reader.increaseText')}>
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>

      {showQuiz ? (
        <div className="dashboard-story-quiz">
          <StoryQuiz quizData={localizedStory.quiz} onComplete={handleQuizComplete} />
        </div>
      ) : (
        <div className="dashboard-story-reader">
          <article className="dashboard-story-article" style={{ '--reader-scale': fontScale }}>
            <header className="dashboard-story-title-block">
              <div className="dashboard-story-meta">
                {category && <span>{category}</span>}
                {location && (
                  <span>
                    <MapPin size={14} />
                    {location}
                  </span>
                )}
                <span>
                  <Sparkles size={14} />
                  +{xpReward} XP
                </span>
              </div>
              <h1>{title}</h1>
              {desc && <p>{desc}</p>}
              {image && (
                <img className="dashboard-story-cover" src={image} alt={title} />
              )}
            </header>

            <div className="dashboard-story-progressline" aria-label={t('reader.checkpointProgress')}>
              <span>{t('reader.checkpointOf').replace('{current}', activeParagraph + 1).replace('{total}', checkpointCount)}</span>
              <strong>{progressPercent}%</strong>
              <div aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="dashboard-story-copy">
              {contentParagraphs.map((paragraph, i) => (
                <motion.section
                  key={`${story?.id || title}-${i}`}
                  ref={(node) => { paragraphRefs.current[i] = node; }}
                  data-checkpoint={i}
                  className={`story-paragraph-card ${i === activeParagraph ? 'is-active' : ''} ${i < activeParagraph ? 'is-read' : ''}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.24) }}
                >
                  <span className="story-paragraph-number">
                    {i < activeParagraph ? <CheckCircle2 size={14} /> : t('reader.checkpoint').replace('{number}', i + 1)}
                  </span>
                  <p>{paragraph}</p>
                </motion.section>
              ))}
            </div>

            <footer className="dashboard-story-footer">
            <div>
              <span>{t('reader.sessionXp')}</span>
              <strong>+{sessionXP}</strong>
            </div>
            <div className="dashboard-story-footer-actions">
              {!isLastCheckpoint && (
                <button type="button" className="btn-outline story-action-btn" onClick={handleNextCheckpoint}>
                  {t('reader.nextCheckpoint')}
                  <ChevronRight size={16} />
                </button>
              )}
              <button type="button" onClick={handleFinishReading} className="btn-primary story-action-btn">
                {hasQuiz ? t('reader.startQuiz') : t('gamification.finishReading')}
                <ChevronRight size={16} />
              </button>
            </div>
            </footer>
          </article>
        </div>
      )}

      <AnimatePresence>
        {showCompletion && (
          <ReadingCompletePopup
            sessionXP={sessionXP}
            xp={xp}
            level={level}
            requiredXP={requiredXP}
            leaderboard={leaderboard}
            currentUserId={user?.id}
            storyTitle={title}
            onDismiss={handleDismissCompletion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
