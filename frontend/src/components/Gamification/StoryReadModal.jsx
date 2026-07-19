import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingProgress } from './ReadingProgress';
import { useGamificationContext } from '../../contexts/GamificationContext';
import { ReadingCompletePopup } from './ReadingCompletePopup';
import { StoryQuiz } from './StoryQuiz';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { localizeStory } from '../../utils/storyLocalization';

/**
 * StoryReadModal
 * A floating overlay that expands a heritage / story card into a readable view.
 * Tracks reading progress and fires gamification events as the user reads.
 *
 * Props:
 *  - story   : { id, title, desc|description, image, image_url, category, location, content, quiz }
 *  - onClose : () => void
 *  - onComplete : (story) => void
 */
export function StoryReadModal({ story, onClose, onComplete }) {
  const scrollRef = useRef(null);
  const { awardXP, refresh, xp, level, leaderboard, getCurrentLevelData, getNextLevelData } = useGamificationContext();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const localizedStory = localizeStory(story, language);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const awardedRef = useRef(false); // prevent double XP award
  const completionNotifiedRef = useRef(false);

  // Estimate word count from available text
  const bodyText = localizedStory?.content || localizedStory?.desc || localizedStory?.description || '';
  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length || 200;
  const xpReward = story?.xpReward ?? 50;

  const triggerCompletion = useCallback(() => {
    if (!awardedRef.current) {
      awardedRef.current = true;
      awardXP(xpReward, 'story_completed').catch(() => {});
      setSessionXP(prev => prev + xpReward);
      refresh().catch(() => {});
    }

    if (localizedStory?.quiz && localizedStory.quiz.length > 0) {
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

  // Called by "Finish Reading" button
  const handleFinishReading = useCallback(() => triggerCompletion(), [triggerCompletion]);

  const handleDismissCompletion = useCallback(() => {
    setShowCompletion(false);
    onClose();
    refresh().catch(() => {});
  }, [onClose, refresh]);

  const levelData     = getCurrentLevelData?.() || {};
  const nextLevelData = getNextLevelData?.()    || {};
  const currentXP     = xp || 0;
  const requiredXP    = nextLevelData?.requiredXP ?? levelData?.requiredXP ?? 1000;

  const image = localizedStory?.image_url || localizedStory?.image;
  const title = localizedStory?.title     || t('gamification.story');
  const desc  = localizedStory?.desc      || localizedStory?.description || '';
  const category = localizedStory?.category || '';
  const location = localizedStory?.location || '';

  // Generate rich placeholder content when no content field exists
  const readableContent = localizedStory?.content || generatePlaceholderContent(title, desc, category);

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="story-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(44,26,20,0.65)', backdropFilter: 'blur(6px)',
          }}
        />

        <motion.div
          key="story-modal-panel"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1,    transition: { type: 'spring', stiffness: 320, damping: 30 } }}
          exit={{    opacity: 0, y: 60, scale: 0.97, transition: { duration: 0.2 } }}
          style={{
            position: 'fixed', top: '3vh', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: 720, maxHeight: '94vh',
            zIndex: 501, display: 'flex', flexDirection: 'column',
            background: '#FDFBF7', borderRadius: 20,
            boxShadow: '0 32px 80px rgba(44,26,20,0.35)',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {showQuiz ? (
            <StoryQuiz quizData={localizedStory.quiz} onComplete={handleQuizComplete} />
          ) : (
            <>
              {/* Reading progress bar — sticky at top */}
              <ReadingProgress
                totalWords={wordCount}
                scrollContainerRef={scrollRef}
                xpReward={xpReward}
              />

              {/* Scrollable body */}
              <div
                ref={scrollRef}
                style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}
              >
                {/* Hero image */}
                {image && (
                  <div style={{ height: 260, overflow: 'hidden', margin: '0.75rem 1.25rem 0', borderRadius: 12 }}>
                    <img
                      src={image} alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {category && (
                      <span style={{
                        background: 'rgba(44,26,20,0.08)', color: '#8D493A',
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 999,
                      }}>
                        {category}
                      </span>
                    )}
                    {location && (
                      <span style={{ fontSize: '0.72rem', color: '#6F5B55' }}>📍 {location}</span>
                    )}
                    <span style={{
                      marginLeft: 'auto', background: '#FEF3C7', color: '#92400E',
                      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    }}>
                      +{xpReward} XP
                    </span>
                  </div>

                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#2C1A14', lineHeight: 1.3 }}>
                    {title}
                  </h2>
                </div>

                {/* Body text */}
                <div style={{ padding: '1rem 1.5rem 2rem' }}>
                  {readableContent.split('\n\n').map((paragraph, i) => (
                    <p key={i} style={{
                      margin: '0 0 1rem', fontSize: '0.95rem', lineHeight: 1.75,
                      color: '#3B2A24',
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Sticky footer — Back + Finish Reading always visible */}
              <div style={{
                padding: '0.75rem 1.25rem 1rem',
                borderTop: '1px solid #EADBC8',
                background: '#FDFBF7',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none', border: '1px solid #D9C6BC', cursor: 'pointer',
                    color: '#6F5B55', fontWeight: 600, fontSize: '0.82rem',
                    padding: '0.6rem 1rem', borderRadius: 10, flexShrink: 0,
                  }}
                >
                  {t('gamification.back')}
                </button>
                <button
                  onClick={handleFinishReading}
                  style={{
                    flex: 1, background: '#8D493A', color: '#fff',
                    border: 'none', borderRadius: 10, padding: '0.7rem',
                    fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('gamification.finishReading')}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reward popup */}
      <AnimatePresence>
        {showCompletion && (
          <ReadingCompletePopup
            sessionXP={sessionXP}
            xp={xp}
            level={level}
            requiredXP={nextLevelData?.requiredXP ?? 1000}
            leaderboard={leaderboard}
            currentUserId={user?.id}
            storyTitle={title}
            onDismiss={handleDismissCompletion}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Generates multi-paragraph placeholder reading content from a title + description
 * when no dedicated `content` field exists on the story object.
 */
function generatePlaceholderContent(title, desc, category) {
  const intro = desc || `Discover the rich history and cultural significance of ${title}.`;
  return [
    intro,
    `${title} is one of the most significant aspects of Rwandan cultural heritage. For generations, this tradition has been passed down through storytelling, art, and daily practice. The knowledge carried within it speaks to the resilience and creativity of the Rwandan people.`,
    `Historians and community elders describe ${title} as a living testament to the values that have shaped society for centuries. Each element tells a story — from the materials used to the rituals performed and the songs sung during gatherings.`,
    `The cultural depth embedded in ${title} extends beyond its physical or artistic form. It represents a philosophy of community, a way of understanding the world, and a bridge between the ancestors and the living.`,
    `Today, efforts to preserve and celebrate ${title} continue through cultural festivals, educational programs, and community initiatives. Young Rwandans are encouraged to learn, engage with, and carry forward these traditions into the modern era.`,
    `As you explore this piece of heritage, consider the countless hands that shaped it, the voices that sang about it, and the generations that protected it so that it could reach you today.`,
  ].join('\n\n');
}
