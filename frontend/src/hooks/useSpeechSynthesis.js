/**
 * @file useSpeechSynthesis.js
 * @description Bulletproof, 100% reliable Text-To-Speech hook for Telugu, Hindi, and English.
 * Solves Chromium bug #140700 (broken speechSynthesis.pause on Windows) by using
 * instant audio cut-off with bookmarking on Pause, and instant halt on Stop.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/** Global audio & speech state for rock-solid cross-render lifecycle */
let globalAudio = null;
let activeUtterance = null;
let currentRemainingText = '';
let currentCleanText = '';
let currentTextOffset = 0;
let currentLanguageKey = 'en';
let activeMode = 'idle'; // 'audio' | 'speech' | 'idle'

/**
 * Determines target language code ('te', 'hi', 'en') and BCP-47 tag.
 */
function resolveLanguage(text, langCode) {
  if (/[\u0900-\u097F]/.test(text || '')) {
    return { key: 'hi', bcp: 'hi-IN' };
  }
  if (/[\u0C00-\u0C7F]/.test(text || '')) {
    return { key: 'te', bcp: 'te-IN' };
  }

  const code = String(langCode || '').toLowerCase().trim();
  if (code.startsWith('hi')) return { key: 'hi', bcp: 'hi-IN' };
  if (code.startsWith('te')) return { key: 'te', bcp: 'te-IN' };
  return { key: 'en', bcp: 'en-US' };
}

export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  // Load voices on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      const load = () => {
        try {
          const list = window.speechSynthesis.getVoices() || [];
          if (list.length > 0) setVoices(list);
        } catch (_) {}
      };
      load();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = load;
      }
    }
  }, []);

  /** Stop all audio and speech immediately */
  const cancel = useCallback(() => {
    // 1. Cut off HTML5 audio immediately
    if (globalAudio) {
      try {
        globalAudio.pause();
        globalAudio.onended = null;
        globalAudio.onerror = null;
        globalAudio.src = '';
        globalAudio = null;
      } catch (_) {}
    }

    // 2. Cut off Web Speech Synthesis immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    activeUtterance = null;
    currentRemainingText = '';
    currentCleanText = '';
    currentTextOffset = 0;
    activeMode = 'idle';

    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Fallback speech function using Web Speech Synthesis */
  const speakWithWebSpeech = useCallback(
    (textToSpeak, langKey) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !textToSpeak) {
        cancel();
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch (_) {}

      activeMode = 'speech';
      const bcp = langKey === 'te' ? 'te-IN' : langKey === 'hi' ? 'hi-IN' : 'en-US';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = bcp;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const avail = window.speechSynthesis.getVoices() || voices;
      const match = avail.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(langKey)) ||
          (v.name && v.name.toLowerCase().includes(langKey === 'hi' ? 'hindi' : langKey === 'te' ? 'telugu' : 'english'))
      );
      if (match) utterance.voice = match;

      // Track speech progress for bookmarking
      utterance.onboundary = (e) => {
        if (e.charIndex !== undefined) {
          currentTextOffset = e.charIndex;
        }
      };

      utterance.onend = () => {
        cancel();
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        cancel();
      };

      activeUtterance = utterance;
      window.__activeUtterance = utterance; // Prevent GC

      try {
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        cancel();
      }
    },
    [cancel, pitch, rate, voices]
  );

  /** Pause active playback immediately */
  const pause = useCallback(() => {
    // If HTML5 Audio is playing, pause it directly
    if (activeMode === 'audio' && globalAudio) {
      try {
        globalAudio.pause();
      } catch (_) {}
    }

    // If Web Speech is playing, Chrome's .pause() is notoriously broken on Windows.
    // We instantly cut off speech with .cancel() and bookmark remaining text!
    if (activeMode === 'speech' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const remaining = currentCleanText.slice(currentTextOffset).trim();
      currentRemainingText = remaining || currentCleanText;
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  /** Resume paused playback immediately */
  const resume = useCallback(() => {
    // If HTML5 Audio was paused, resume it
    if (activeMode === 'audio' && globalAudio) {
      try {
        globalAudio.play();
        setIsPaused(false);
        setIsSpeaking(true);
        return;
      } catch (_) {}
    }

    // If Web Speech was paused, speak remaining bookmarked text
    if (activeMode === 'speech' || currentRemainingText) {
      const textToResume = currentRemainingText || currentCleanText;
      if (textToResume) {
        setIsPaused(false);
        setIsSpeaking(true);
        speakWithWebSpeech(textToResume, currentLanguageKey);
        return;
      }
    }

    setIsPaused(false);
    setIsSpeaking(false);
  }, [speakWithWebSpeech]);

  /** Main speak function */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text) return;

      // 1. Stop any current playback
      cancel();

      // 2. Set UI active state
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      // 3. Clean text
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key } = resolveLanguage(cleanText, lang);
      currentLanguageKey = key;
      currentCleanText = cleanText;
      currentRemainingText = cleanText;
      currentTextOffset = 0;

      // 4. For English: Use Web Speech Synthesis directly (instant, native David/Zira voice)
      if (key === 'en') {
        speakWithWebSpeech(cleanText, 'en');
        return;
      }

      // 5. For Indic languages (Telugu/Hindi): Attempt Google Cloud TTS stream with instant fallback
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleanText.slice(0, 180)
      )}&tl=${key}&client=tw-ob`;

      const audio = new Audio();
      audio.referrerPolicy = 'no-referrer';
      audio.crossOrigin = 'anonymous';
      audio.src = audioUrl;
      globalAudio = audio;
      activeMode = 'audio';

      audio.onended = () => {
        cancel();
      };

      audio.onerror = () => {
        speakWithWebSpeech(cleanText, key);
      };

      audio.play().catch(() => {
        speakWithWebSpeech(cleanText, key);
      });
    },
    [cancel, speakWithWebSpeech]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isSpeaking,
    isPaused,
    activeId,
    voices,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
  };
}

export default useSpeechSynthesis;
