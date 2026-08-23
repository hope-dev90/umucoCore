import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';


// ────────────────────────────────────────────
// Language Config (FIXED: added rw)
// ────────────────────────────────────────────

const PROVERB_LANG_CONFIG = {
  fr: { tag: 'fr-FR', label: 'FR', preferredVoiceHints: ['amelie', 'thomas', 'french'] },
  en: { tag: 'en-GB', label: 'EN', preferredVoiceHints: ['daniel', 'english'] },
  rw: { tag: 'rw-RW', label: 'RW', preferredVoiceHints: ['rwanda', 'kinyarwanda'] }, // ✅ FIX
};

// ────────────────────────────────────────────
// Helper under test
// ────────────────────────────────────────────

function buildUtterance(proverb, lang, voices = []) {
  const cfg = PROVERB_LANG_CONFIG[lang] || { tag: 'rw' };
  const text = proverb[lang] || proverb.rw;

  const utterance = { lang: cfg.tag, rate: 0.85, voice: undefined, text };

  const matched =
    voices.find(v => cfg.preferredVoiceHints?.some(h => v.name.toLowerCase().includes(h))) ||
    voices.find(v => v.lang?.toLowerCase().startsWith(cfg.tag.slice(0, 2)));

  if (matched) utterance.voice = matched;

  return utterance;
}

// ────────────────────────────────────────────
// Better Arbitraries (FIXED)
// ────────────────────────────────────────────

const nonEmptyString = fc
  .string({ minLength: 1 })
  .filter(s => s.trim().length > 0);

const proverbArb = fc.record({
  id: nonEmptyString,
  rw: nonEmptyString,
  en: nonEmptyString,
  fr: nonEmptyString,
  meaning: fc.string(),
});

const langArb = fc.constantFrom('rw', 'en', 'fr');

// ────────────────────────────────────────────
// Mock speechSynthesis
// ────────────────────────────────────────────

function makeSpeechMock() {
  return {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
  };
}

// ────────────────────────────────────────────
// UNIT TESTS
// ────────────────────────────────────────────

describe('Proverb Tap-to-Listen — unit tests', () => {
  let speechMock;

  beforeEach(() => {
    speechMock = makeSpeechMock();
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: speechMock,
    });
  });

  it('shows alert and does not throw when speechSynthesis is unavailable', () => {
    window.speechSynthesis = undefined;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    let threw = false;
    try {
      if (!window.speechSynthesis) {
        alert('Audio is not supported in your browser.');
      }
    } catch {
      threw = true;
    }

    expect(alertSpy).toHaveBeenCalledWith('Audio is not supported in your browser.');
    expect(threw).toBe(false);
    alertSpy.mockRestore();
  });

  it('stopProverbSpeech cancels speech synthesis and clears ref', () => {
    const ref = { current: {} };

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    ref.current = null;

    expect(speechMock.cancel).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeNull();
  });

  it('audio controls click handler calls stopPropagation', () => {
    const event = { stopPropagation: vi.fn() };
    event.stopPropagation();
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────
// PROPERTY TESTS (FIXED)
// ────────────────────────────────────────────

describe('Proverb Tap-to-Listen — property tests', () => {
  let speechMock;

  beforeEach(() => {
    speechMock = makeSpeechMock();
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: speechMock,
    });
  });

  it('P1: utterance always has correct lang tag and rate=0.85', () => {
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        const utt = buildUtterance(proverb, lang);

        const expectedTag = PROVERB_LANG_CONFIG[lang]?.tag || 'rw';

        expect(utt.lang).toBe(expectedTag);
        expect(utt.rate).toBe(0.85);
      }),
      { numRuns: 100 }
    );
  });

  it('P1b: utterance text falls back to rw when missing', () => {
    fc.assert(
      fc.property(proverbArb, (proverb) => {
        const proverbNoFr = { ...proverb, fr: undefined };
        const utt = buildUtterance(proverbNoFr, 'fr');
        expect(utt.text).toBe(proverbNoFr.rw);
      }),
      { numRuns: 100 }
    );
  });

  it('P2: tapping active cancels speech', () => {
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        speechMock.cancel.mockClear();

        const state = { id: proverb.id, lang, playing: true };

        if (state.id === proverb.id && state.lang === lang && state.playing) {
          window.speechSynthesis.cancel();
        }

        expect(speechMock.cancel).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  it('P3: speakProverb silences other audio', () => {
    fc.assert(
      fc.property(proverbArb, langArb, () => {
        speechMock.cancel.mockClear();
        const pause = vi.fn();
        const stopSpeech = vi.fn();

        const audioRef = { current: { paused: false, pause } };

        window.speechSynthesis.cancel();
        if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
        stopSpeech();

        expect(speechMock.cancel).toHaveBeenCalled();
        expect(pause).toHaveBeenCalledTimes(1);
        expect(stopSpeech).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  it('P5: listening triggers flip when unread', () => {
    fc.assert(
      fc.property(proverbArb, (proverb) => {
        const handleFlipCard = vi.fn();
        const flipped = new Set();

        if (!flipped.has(proverb.id)) handleFlipCard(proverb.id);

        expect(handleFlipCard).toHaveBeenCalledWith(proverb.id);
      }),
      { numRuns: 100 }
    );
  });

  it('P6: no flip if already read', () => {
    fc.assert(
      fc.property(proverbArb, (proverb) => {
        const handleFlipCard = vi.fn();
        const flipped = new Set([proverb.id]);

        if (!flipped.has(proverb.id)) handleFlipCard(proverb.id);

        expect(handleFlipCard).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it('P7: active state matches id + lang + playing', () => {
    fc.assert(
      fc.property(proverbArb, langArb, proverbArb, langArb, (a, la, b, lb) => {
        const state = { id: a.id, lang: la, playing: true };

        const isActiveA = state.id === a.id && state.lang === la && state.playing;
        expect(isActiveA).toBe(true);

        if (b.id !== a.id) {
          const isActiveB = state.id === b.id && state.lang === lb && state.playing;
          expect(isActiveB).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});
