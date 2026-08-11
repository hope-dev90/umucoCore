import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import riddlesData from '../data/riddles.json';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { trackActivity, fetchUserActivityItems } from '../services/gamificationService';
import { colors } from '../theme/colors';
import type { LanguageCode } from '../types';

type Riddle = {
  id: string;
  source_no: number;
  rw: string;
  en: string;
  fr: string;
  answer_rw: string;
  answer_en: string;
  answer_fr: string;
};

const INTERVAL_MS = 30000;
const PREF_KEY = 'umuco_riddle_pref';

function i18n(language: LanguageCode, en: string, fr: string, rw: string) {
  if (language === 'fr') return fr;
  if (language === 'rw') return rw;
  return en;
}

function pickNext(shownIds: Set<string>, riddles: Riddle[]) {
  const unseen = riddles.filter((r) => !shownIds.has(r.id));
  const pool = unseen.length > 0 ? unseen : riddles;
  return pool[Math.floor(Math.random() * pool.length)];
}

function isCorrect(userInput: string, riddle: Riddle) {
  const clean = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toLowerCase()
      .trim();
  const input = clean(userInput);
  const candidates = [riddle.answer_rw, riddle.answer_en, riddle.answer_fr]
    .filter(Boolean)
    .map(clean);
  return candidates.some(
    (c) => c === input || (input.length >= 4 && c.includes(input))
  );
}

/** RN equivalent of frontend RiddlePopup.jsx (ibisakuzo). */
export default function RiddlePopup() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const riddles = riddlesData.ibisakuzo as Riddle[];

  const [phase, setPhase] = useState<'ask' | 'riddle' | 'hidden'>('hidden');
  const [pref, setPref] = useState<'yes' | 'maybe' | null>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Riddle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | 'idk' | null>(null);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownRef = useRef(new Set<string>());
  const showNextRef = useRef<(() => void) | null>(null);
  const scheduleNextRef = useRef<(() => void) | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const open = useCallback((newPhase: 'ask' | 'riddle') => {
    setPhase(newPhase);
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const scheduleNext = useCallback(() => {
    stopTimer();
    timerRef.current = setTimeout(() => {
      showNextRef.current?.();
      scheduleNextRef.current?.();
    }, INTERVAL_MS);
  }, [stopTimer]);

  useEffect(() => {
    scheduleNextRef.current = scheduleNext;
  }, [scheduleNext]);

  const showNext = useCallback(() => {
    const next = pickNext(shownRef.current, riddles);
    shownRef.current = new Set([...shownRef.current, next.id]);
    setCurrent(next);
    setUserAnswer('');
    setVerdict(null);
    open('riddle');
  }, [riddles, open]);

  useEffect(() => {
    showNextRef.current = showNext;
  }, [showNext]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const items = await fetchUserActivityItems('riddle');
      shownRef.current = new Set(items);
      const stored = await AsyncStorage.getItem(PREF_KEY);
      if (stored === 'no') setPaused(true);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => open('ask'), 4000);
    return () => stopTimer();
  }, [open, paused, stopTimer]);

  const handlePrefYes = async () => {
    setPref('yes');
    await AsyncStorage.setItem(PREF_KEY, 'yes');
    dismiss();
    setTimeout(() => {
      showNext();
      scheduleNext();
    }, 400);
  };

  const handlePrefNo = async () => {
    setPaused(true);
    await AsyncStorage.setItem(PREF_KEY, 'no');
    stopTimer();
    dismiss();
  };

  const handlePrefMaybe = async () => {
    setPref('maybe');
    await AsyncStorage.setItem(PREF_KEY, 'maybe');
    dismiss();
    setTimeout(() => {
      showNext();
      scheduleNext();
    }, 400);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim() || !current) return;
    const correct = isCorrect(userAnswer, current);
    setVerdict(correct ? 'correct' : 'wrong');
    if (correct) trackActivity('riddle', current.id);
  };

  const handleIdk = () => {
    if (!current) return;
    setVerdict('idk');
    trackActivity('riddle', current.id);
  };

  const handleNext = () => {
    dismiss();
    setTimeout(() => {
      showNext();
      if (pref === 'yes' || pref === 'maybe') scheduleNext();
    }, 400);
  };

  const L = {
    badge: i18n(language, 'Riddle', 'Devinette', 'Igissakuzo'),
    askTitle: i18n(language, 'Riddles await you!', 'Des devinettes vous attendent !', 'Ibisakuzo biraguteye !'),
    askSub: i18n(
      language,
      'Are you in the mood for some Rwandan riddles?',
      'Êtes-vous prêt pour des devinettes rwandaises ?',
      'Urashaka gukina ibisakuzo byo mu Rwanda?'
    ),
    yes: i18n(language, "Yes, let's go!", 'Oui, allons-y !', 'Yego, twagiye!'),
    no: i18n(language, 'Not now', 'Pas maintenant', 'Oya, nta byonshaka'),
    maybe: i18n(language, "I'm not sure — show me", 'Je ne sais pas — montrez-moi', 'Simbizi — mbwira'),
    yourAnswer: i18n(language, 'Your answer…', 'Votre réponse…', 'Igisubizo cyawe…'),
    submit: i18n(language, 'Submit', 'Envoyer', 'Ohereza'),
    hooray: i18n(language, 'Hooray! Correct!', 'Bravo ! Bonne réponse !', 'Yegoooo!'),
    oops: i18n(language, 'Oops! The answer is:', 'Oups ! La réponse est :', 'Igisubizo ni:'),
    idkLabel: 'Ngicyo',
    adventure: i18n(language, 'Continue adventuring →', "Continuer l'aventure →", 'Komeza urugendo →'),
    next: i18n(language, 'Next riddle', 'Devinette suivante', 'Igisakuzo gikurikira'),
  };

  if (!visible && phase === 'hidden') return null;

  const riddleText = current
    ? i18n(language, current.en, current.fr, current.rw)
    : '';
  const answerText = current
    ? i18n(language, current.answer_en, current.answer_fr, current.answer_rw)
    : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.badge}>{L.badge}</Text>

          {phase === 'ask' && (
            <>
              <Text style={styles.title}>{L.askTitle}</Text>
              <Text style={styles.sub}>{L.askSub}</Text>
              <Pressable style={styles.primaryBtn} onPress={handlePrefYes}>
                <Text style={styles.primaryBtnText}>{L.yes}</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={handlePrefMaybe}>
                <Text style={styles.secondaryBtnText}>{L.maybe}</Text>
              </Pressable>
              <Pressable onPress={handlePrefNo}>
                <Text style={styles.link}>{L.no}</Text>
              </Pressable>
            </>
          )}

          {phase === 'riddle' && current && (
            <>
              <Text style={styles.source}>#{current.source_no}</Text>
              <Text style={styles.riddle}>{riddleText}</Text>

              {verdict == null && (
                <>
                  <TextInput
                    style={styles.input}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder={L.yourAnswer}
                    placeholderTextColor={colors.textMuted}
                  />
                  <Pressable style={styles.primaryBtn} onPress={handleSubmit}>
                    <Text style={styles.primaryBtnText}>{L.submit}</Text>
                  </Pressable>
                  <Pressable onPress={handleIdk}>
                    <Text style={styles.link}>{L.idkLabel}</Text>
                  </Pressable>
                </>
              )}

              {verdict === 'correct' && (
                <>
                  <Text style={styles.success}>{L.hooray}</Text>
                  <Pressable style={styles.primaryBtn} onPress={handleNext}>
                    <Text style={styles.primaryBtnText}>{L.adventure}</Text>
                  </Pressable>
                </>
              )}

              {(verdict === 'wrong' || verdict === 'idk') && (
                <>
                  <Text style={styles.oops}>
                    {L.oops} {answerText}
                  </Text>
                  <Pressable style={styles.primaryBtn} onPress={handleNext}>
                    <Text style={styles.primaryBtnText}>{L.next}</Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,26,20,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.primaryDark },
  sub: { color: colors.textSecondary, lineHeight: 20 },
  source: { color: colors.textMuted, fontSize: 12 },
  riddle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, lineHeight: 24 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    backgroundColor: colors.bgMain,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '800' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.primaryDark, fontWeight: '700' },
  link: { textAlign: 'center', color: colors.textMuted, fontWeight: '600', paddingVertical: 6 },
  success: { color: colors.success, fontWeight: '800', fontSize: 16 },
  oops: { color: colors.textSecondary, lineHeight: 20 },
});
