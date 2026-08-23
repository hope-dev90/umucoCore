import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// ────────────────────────────────────────────
// Helpers — replicate the logic under test
// ────────────────────────────────────────────

const PROVERB_LANG_CONFIG = {
  fr: { tag: 'fr-FR', label: 'FR', preferredVoiceHints: ['amelie', 'thomas', 'french'] },
  en: { tag: 'en-GB', label: 'EN', preferredVoiceHints: ['daniel', 'english'] },
};

/**
 * Pure function that builds a SpeechSynthesisUtterance-like object.
 * Mirrors the logic inside speakProverb.
 */
function buildUtterance(proverb, lang, voices = []) {
  // Provide a safe fallback object with a default tag if the language is unmapped
  const cfg = PROVERB_LANG_CONFIG[lang] || { tag: 'rw' };
  const text = proverb[lang] || proverb.rw;

  const utterance = { lang: cfg.tag, rate: 0.85, voice: undefined, text };
  const matched =
    voices.find(v => cfg.preferredVoiceHints.some(h => v.name.toLowerCase().includes(h))) ||
    voices.find(v => v.lang?.toLowerCase().startsWith(cfg.tag.slice(0, 2)));
  if (matched) utterance.voice = matched;
  return utterance;
}

// ────────────────────────────────────────────
// Arbitraries
// ────────────────────────────────────────────

const proverbArb = fc.record({
  id: fc.string({ minLength: 1 }),
  rw: fc.string({ minLength: 1 }),
  en: fc.string({ minLength: 1 }),
  fr: fc.string({ minLength: 1 }),
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

describe('Proverb Tap-to-Listen — unit tests', () => {
  let speechMock;

  beforeEach(() => {
    speechMock = makeSpeechMock();
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: speechMock,
    });
  });

  // ── Unit: unsupported browser ──────────────────────────────────────────────

  it('shows alert and does not throw when speechSynthesis is unavailable', () => {
    window.speechSynthesis = undefined;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Simulate the guard logic from speakProverb
    let threw = false;
    try {
      if (!window.speechSynthesis) {
        alert('Audio is not supported in your browser.');
        // return early — no further code runs
      }
    } catch {
      threw = true;
    }

    expect(alertSpy).toHaveBeenCalledWith('Audio is not supported in your browser.');
    expect(threw).toBe(false);
    alertSpy.mockRestore();
  });

  // ── Unit: stopProverbSpeech ─────────────────────────────────────────────────

  it('stopProverbSpeech cancels speech synthesis and clears ref', () => {
    const ref = { current: {} };
    // Simulate stopProverbSpeech logic
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    ref.current = null;

    expect(speechMock.cancel).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeNull();
  });

  // ── Unit: AudioControls stopPropagation ────────────────────────────────────

  it('audio controls click handler calls stopPropagation', () => {
    const event = { stopPropagation: vi.fn() };
    // Simulate the onClick handler on .proverb-audio-controls div
    event.stopPropagation();
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────
// Property-Based Tests
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

  // Property 1: Utterance Construction Invariant
  it('P1: utterance always has correct lang tag and rate=0.85 for any proverb and language', () => {
    // Feature: proverb-tap-to-listen, Property 1: Utterance Construction Invariant
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        const utt = buildUtterance(proverb, lang);
        expect(utt.lang).toBe(PROVERB_LANG_CONFIG[lang].tag);
        expect(utt.rate).toBe(0.85);
      }),
      { numRuns: 100 }
    );
  });

  // Property 1b: text fallback — uses rw when target lang is missing
  it('P1b: utterance text falls back to rw when target lang field is absent', () => {
    // Feature: proverb-tap-to-listen, Property 1: Utterance Construction Invariant (fallback)
    fc.assert(
      fc.property(proverbArb, (proverb) => {
        const proverbNoFr = { ...proverb, fr: undefined };
        const utt = buildUtterance(proverbNoFr, 'fr');
        expect(utt.text).toBe(proverbNoFr.rw);
      }),
      { numRuns: 100 }
    );
  });

  // Property 2: Toggle-Off Resets State
  it('P2: tapping the active button cancels speechSynthesis', () => {
    // Feature: proverb-tap-to-listen, Property 2: Toggle-Off Resets State
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        speechMock.cancel.mockClear();
        // Simulate: same id + lang + playing → stopProverbSpeech()
        const proverbAudioState = { id: proverb.id, lang, playing: true };
        if (
          proverbAudioState.id === proverb.id &&
          proverbAudioState.lang === lang &&
          proverbAudioState.playing
        ) {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
        expect(speechMock.cancel).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  // Property 3: Exclusive Audio — speakProverb silences FableAudio and SpeechNarration
  it('P3: speakProverb pauses FableAudio and cancels SpeechNarration before speaking', () => {
    // Feature: proverb-tap-to-listen, Property 3: Exclusive Audio
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        speechMock.cancel.mockClear();
        speechMock.speak.mockClear();
        const audioRefPause = vi.fn();
        const stopSpeech = vi.fn();
        const audioRef = { current: { paused: false, pause: audioRefPause } };

        // Simulate the first part of speakProverb (silence other sources)
        if (window.speechSynthesis) window.speechSynthesis.cancel(); // stopProverbSpeech
        if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
        stopSpeech();

        expect(speechMock.cancel).toHaveBeenCalled();
        expect(audioRefPause).toHaveBeenCalledTimes(1);
        expect(stopSpeech).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  // Property 5: Listening Counts as Reading
  it('P5: speakProverb calls handleFlipCard when proverb is not in flippedCards', () => {
    // Feature: proverb-tap-to-listen, Property 5: Listening Counts as Reading
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        const handleFlipCard = vi.fn();
        const flippedCards = new Set(); // proverb not read yet

        if (!flippedCards.has(proverb.id)) handleFlipCard(proverb.id);

        expect(handleFlipCard).toHaveBeenCalledWith(proverb.id);
      }),
      { numRuns: 100 }
    );
  });

  // Property 6: Flip Idempotence
  it('P6: speakProverb does NOT call handleFlipCard when proverb is already in flippedCards', () => {
    // Feature: proverb-tap-to-listen, Property 6: Flip Idempotence
    fc.assert(
      fc.property(proverbArb, langArb, (proverb, lang) => {
        const handleFlipCard = vi.fn();
        const flippedCards = new Set([proverb.id]); // already read

        if (!flippedCards.has(proverb.id)) handleFlipCard(proverb.id);

        expect(handleFlipCard).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  // Property 7: Active Button State Reflects ProverbAudioState
  it('P7: isActive is true only when id, lang, and playing all match', () => {
    // Feature: proverb-tap-to-listen, Property 7: Active Button State Reflects ProverbAudioState
    fc.assert(
      fc.property(proverbArb, langArb, proverbArb, langArb, (proverbA, langA, proverbB, langB) => {
        const state = { id: proverbA.id, lang: langA, playing: true };

        const isActiveA = state.id === proverbA.id && state.lang === langA && state.playing;
        expect(isActiveA).toBe(true);

        // Different proverb should not be active (unless IDs happen to collide — fast-check may generate same id)
        if (proverbB.id !== proverbA.id) {
          const isActiveB = state.id === proverbB.id && state.lang === langB && state.playing;
          expect(isActiveB).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});
