import { useState, useEffect, useCallback, useRef } from 'react';
import riddlesData from '../data/riddles.json';
import { useLanguage } from '../contexts/LanguageContext';
import { useGamificationContext } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import './RiddlePopup.css';

const INTERVAL_MS = 30000;

function pickNext(shownIds, riddles) {
  const unseen = riddles.filter(r => !shownIds.has(r.id));
  const pool   = unseen.length > 0 ? unseen : riddles;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Fuzzy answer check — strips accents, punctuation, lowercases both sides
function isCorrect(userInput, riddle) {
  const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().trim();
  const input = clean(userInput);
  const candidates = [riddle.answer_rw, riddle.answer_en, riddle.answer_fr]
    .filter(Boolean).map(clean);
  // Accept if input matches any candidate or is a substring of any candidate (at least 4 chars)
  return candidates.some(c => c === input || (input.length >= 4 && c.includes(input)));
}

// i18n helper
function i18n(language, en, fr, rw) {
  if (language === 'fr') return fr;
  if (language === 'rw') return rw;
  return en;
}

export default function RiddlePopup() {
  const { language } = useLanguage();
  const { trackActivity, fetchUserActivityItems } = useGamificationContext();
  const { user } = useAuth();
  const riddles = riddlesData.ibisakuzo;

  // 'ask' = preference prompt | 'riddle' = showing a riddle | 'hidden' = user said no
  const [phase, setPhase]     = useState('hidden');
  const [pref, setPref]       = useState(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [current, setCurrent] = useState(null);

  // riddle interaction states
  const [userAnswer, setUserAnswer] = useState('');
  const [verdict, setVerdict]       = useState(null); // null | 'correct' | 'wrong' | 'idk'
  const [revealed, setRevealed]     = useState(false); // for 'maybe' mode

  const timerRef        = useRef(null);
  const shownRef        = useRef(new Set());
  const showNextRef     = useRef(null); // filled after showNext is defined
  const scheduleNextRef = useRef(null); // filled after scheduleNext is defined
  const [paused, setPaused] = useState(false);

  const stopTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(timerRef.current);
  }, []);

  // Self-rescheduling timeout instead of setInterval: every time a riddle
  // changes — whether the timer fired or the user clicked next/resume —
  // this restarts the full INTERVAL_MS countdown from scratch, so riddles
  // never fire early just because the user also advanced manually.
  const scheduleNext = useCallback(() => {
    stopTimer();
    timerRef.current = setTimeout(() => {
      showNextRef.current?.();
      scheduleNextRef.current?.();
    }, INTERVAL_MS);
  }, [stopTimer]);

  useEffect(() => { scheduleNextRef.current = scheduleNext; }, [scheduleNext]);

  const open = useCallback((newPhase) => {
    setAnimating(true);
    setPhase(newPhase);
    setVisible(true);
    setTimeout(() => setAnimating(false), 5000);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const showNext = useCallback(() => {
    const next = pickNext(shownRef.current, riddles);
    shownRef.current = new Set([...shownRef.current, next.id]);
    setCurrent(next);
    setUserAnswer('');
    setVerdict(null);
    setRevealed(false);
    open('riddle');
  }, [riddles, open]);

  // Keep ref in sync so interval callbacks always call latest version
  useEffect(() => { showNextRef.current = showNext; }, [showNext]);

  // Load shown riddles from backend when user changes
  useEffect(() => {
    if (!user?.id) return;
    const loadShownRiddles = async () => {
      const items = await fetchUserActivityItems('riddle');
      shownRef.current = new Set(items);
    };
    loadShownRiddles();
  }, [user?.id, fetchUserActivityItems]);

  // Boot: ask preference after 4s
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => open('ask'), 4000);
    return () => { clearTimeout(timerRef.current); clearInterval(timerRef.current); };
  }, [open, paused]);

  const handlePrefYes = () => {
    setPref('yes');
    dismiss();
    setTimeout(() => {
      showNext();
      scheduleNext();
    }, 400);
  };

  const handlePrefNo = () => {
    setPaused(true);
    stopTimer();
    dismiss();
  };

  const handlePrefMaybe = () => {
    setPref('maybe');
    dismiss();
    setTimeout(() => {
      showNext();
      scheduleNext();
    }, 400);
  };

  const handlePause = () => {
    setPaused(true);
    stopTimer();
    dismiss();
  };

  const handleResume = () => {
    setPaused(false);
    showNext();
    scheduleNext();
  };

  // Answer submission
  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    const correct = isCorrect(userAnswer, current);
    setVerdict(correct ? 'correct' : 'wrong');
    if (correct) {
      trackActivity?.('riddle', current.id, { correct: true });
    }
  };

  const handleNext = () => {
    dismiss();
    setTimeout(() => {
      showNext();
      if (pref === 'yes' || pref === 'maybe') scheduleNext();
    }, 400);
  };

  const handleIdk = () => {
    setVerdict('idk');
    trackActivity?.('riddle', current.id, { revealed: true });
  };

  // ── Labels ──
  const L = {
    badge:       i18n(language, 'Riddle', 'Devinette', 'Igissakuzo'),
    askTitle:    i18n(language, 'Riddles await you!', 'Des devinettes vous attendent !', 'Ibisakuzo biraguteye !'),
    askSub:      i18n(language, 'Are you in the mood for some Rwandan riddles?', 'Êtes-vous prêt pour des devinettes rwandaises ?', 'Urashaka gukina ibisakuzo byo mu Rwanda?'),
    yes:         i18n(language, "Yes, let's go!", 'Oui, allons-y !', 'Yego, twagiye!'),
    no:          i18n(language, 'Not now', 'Pas maintenant', 'Oya, nta byonshaka'),
    maybe:       i18n(language, "I'm not sure — show me", "Je ne sais pas — montrez-moi", 'Simbizi — mbwira'),
    yourAnswer:  i18n(language, 'Your answer…', 'Votre réponse…', 'Igisubizo cyawe…'),
    submit:      i18n(language, 'Submit', 'Envoyer', 'Ohereza'),
    hooray:      i18n(language, '🎉 Hooray! Correct!', '🎉 Bravo ! Bonne réponse !', '🎉 Yegoooo!'),
    oops:        i18n(language, 'Oops! The answer is:', 'Oups ! La réponse est :', 'Igisubizo ni:'),
    // Fixed label — "Ngicyo" is shown as-is in every language, with a translated
    // tooltip/aria-label so screen readers and non-Kinyarwanda speakers still get the meaning.
    idkLabel:    'Ngicyo',
    idkTitle:    i18n(language, "I don't know", 'Je ne sais pas', 'Ngicyo'),
    adventure:   i18n(language, 'Continue adventuring →', 'Continuer l\'aventure →', 'Komeza urugendo →'),
    reveal:      i18n(language, 'Show me the answer', 'Me montrer la réponse', 'Mbwira igisubizo'),
    answer:      i18n(language, 'Answer', 'Réponse', 'Igisubizo'),
    close:       i18n(language, 'Dismiss', 'Fermer', 'Funga'),
    pause:       i18n(language, 'Pause riddles', 'Mettre en pause', 'Hagarika ibisakuzo'),
    resume:      i18n(language, '▶ Resume riddles', '▶ Reprendre les devinettes', '▶ Subira mu bisakuzo'),
    paused:      i18n(language, 'Riddles paused', 'Devinettes en pause', 'Ibisakuzo byahagaritswe'),
    next:        i18n(language, 'Next riddle', 'Devinette suivante', 'Igisakuzo gikurikira'),
    source:      `#${current?.source_no}`,
  };

  if (phase === 'hidden' && !visible && !paused) return null;

  const riddleText = current ? i18n(language, current.en, current.fr, current.rw) : '';
  const answerText = current ? i18n(language, current.answer_en, current.answer_fr, current.answer_rw) : '';
  return (
    <>
      <div
        className={`riddle-popup-backdrop${visible ? ' riddle-popup-backdrop--visible' : ''}`}
        onClick={dismiss}
        aria-hidden="true"
      />
      <div
        className={`riddle-popup${visible ? ' riddle-popup--visible' : ''}${animating ? ' riddle-popup--enter' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={L.badge}
      >
        {/* ── PREFERENCE PHASE ── */}
        {phase === 'ask' && (
          <>
            <div className="riddle-popup__header">
              <span className="riddle-popup__badge">{L.badge}</span>
              <button className="riddle-popup__close" onClick={dismiss} aria-label={L.close}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="riddle-popup__ask">
              <div className="riddle-popup__ask-icon">🎭</div>
              <p className="riddle-popup__ask-title">{L.askTitle}</p>
              <p className="riddle-popup__ask-sub">{L.askSub}</p>
              <div className="riddle-popup__ask-btns">
                <button className="riddle-popup__btn riddle-popup__btn--yes" onClick={handlePrefYes}>{L.yes}</button>
                <button className="riddle-popup__btn riddle-popup__btn--maybe" onClick={handlePrefMaybe}>{L.maybe}</button>
                <button className="riddle-popup__btn riddle-popup__btn--no" onClick={handlePrefNo}>{L.no}</button>
              </div>
            </div>
          </>
        )}

        {/* ── RIDDLE PHASE ── */}
        {phase === 'riddle' && current && (
          <>
            <div className="riddle-popup__header">
              <span className="riddle-popup__badge">{L.badge}</span>
              <button className="riddle-popup__close" onClick={dismiss} aria-label={L.close}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="riddle-popup__body">
              <p className="riddle-popup__rw">{current.rw}</p>
              {language !== 'rw' && <p className="riddle-popup__gloss">"{riddleText}"</p>}
            </div>

            {/* YES mode — type your answer, or click Ngicyo if you don't know */}
            {pref === 'yes' && !verdict && (
              <>
                <div className="riddle-popup__input-row">
                  <input
                    className="riddle-popup__input"
                    type="text"
                    placeholder={L.yourAnswer}
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                  <button className="riddle-popup__submit" onClick={handleSubmit}>{L.submit}</button>
                </div>
                <button
                  className="riddle-popup__idk-btn"
                  onClick={handleIdk}
                  title={L.idkTitle}
                  aria-label={L.idkTitle}
                >
                  {L.idkLabel}
                </button>
              </>
            )}

            {/* YES mode — verdict */}
            {pref === 'yes' && verdict === 'correct' && (
              <div className="riddle-popup__verdict riddle-popup__verdict--correct">
                <p className="riddle-popup__verdict-msg">{L.hooray}</p>
                <p className="riddle-popup__verdict-answer">{current.answer_rw}</p>
                {language !== 'rw' && <p className="riddle-popup__verdict-gloss">{answerText}</p>}
                <button className="riddle-popup__btn riddle-popup__btn--yes" onClick={handleNext}>{L.adventure}</button>
              </div>
            )}

            {pref === 'yes' && (verdict === 'wrong' || verdict === 'idk') && (
              <div className="riddle-popup__verdict riddle-popup__verdict--wrong">
                <p className="riddle-popup__verdict-msg">{verdict === 'idk' ? L.oops : L.oops}</p>
                <p className="riddle-popup__verdict-answer">{current.answer_rw}</p>
                {language !== 'rw' && <p className="riddle-popup__verdict-gloss">{answerText}</p>}
                <button className="riddle-popup__btn riddle-popup__btn--maybe" onClick={() => {
                  if (verdict === 'wrong') {
                    trackActivity?.('riddle', current.id, { correct: false, revealed: true });
                  }
                  handleNext();
                }}>{L.adventure}</button>
              </div>
            )}

            {/* MAYBE mode — reveal button or shown answer */}
            {pref === 'maybe' && !revealed && (
              <button className="riddle-popup__reveal" onClick={() => {
                setRevealed(true);
                trackActivity?.('riddle', current.id, { revealed: true });
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {L.reveal}
              </button>
            )}

            {pref === 'maybe' && revealed && (
              <div className="riddle-popup__answer">
                <span className="riddle-popup__answer-label">{L.answer}</span>
                <p className="riddle-popup__answer-rw">{current.answer_rw}</p>
                {language !== 'rw' && <p className="riddle-popup__answer-gloss">{answerText}</p>}
              </div>
            )}

            <div className="riddle-popup__footer">
              <span className="riddle-popup__source">{L.source}</span>
              <div className="riddle-popup__footer-actions">
                <button
                  className="riddle-popup__pause-btn"
                  onClick={handlePause}
                  title={L.pause}
                  aria-label={L.pause}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                </button>
                <button className="riddle-popup__next" onClick={handleNext} title={L.next}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Resume pill — shown when paused, not when popup is open */}
      {paused && !visible && (
        <button className="riddle-resume-pill" onClick={handleResume} aria-label={L.resume}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {L.paused}
        </button>
      )}
    </>
  );
}