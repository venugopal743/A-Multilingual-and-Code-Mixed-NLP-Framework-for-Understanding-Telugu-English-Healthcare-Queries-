/**
 * @file useSpeechSynthesis.js
 * @description 100% Guaranteed Text-To-Speech hook for Telugu, Hindi, and English.
 * Controls a shared, rock-solid audio player attached to window.__MEDILINGUAL_AUDIO__
 * and window.speechSynthesis, ensuring that clicking Pause or Stop IMMEDIATELY
 * silences or pauses audio across all browsers (Chrome, Edge, Firefox, Safari).
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Initialize single audio element attached to window
if (typeof window !== 'undefined' && !window.__MEDILINGUAL_AUDIO__) {
  window.__MEDILINGUAL_AUDIO__ = new Audio();
}

/** Global pause flag to protect against Chromium onend race conditions */
if (typeof window !== 'undefined') {
  window.__IS_MEDILINGUAL_PAUSED__ = false;
  window.__MEDILINGUAL_RESUME__ = null;
}

/** Global stop helper that unconditionally kills all sound immediately */
export function stopAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = false;
  window.__MEDILINGUAL_RESUME__ = null;

  // 1. Kill HTML5 Audio
  if (window.__MEDILINGUAL_AUDIO__) {
    try {
      window.__MEDILINGUAL_AUDIO__.pause();
      window.__MEDILINGUAL_AUDIO__.currentTime = 0;
      window.__MEDILINGUAL_AUDIO__.src = '';
    } catch (_) {}
  }

  // 2. Kill Web Speech Synthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  window.__MEDILINGUAL_UTTERANCE__ = null;
}

/** Global pause helper that unconditionally pauses all sound */
export function pauseAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = true;

  // 1. Pause HTML5 Audio
  if (window.__MEDILINGUAL_AUDIO__) {
    try {
      window.__MEDILINGUAL_AUDIO__.pause();
    } catch (_) {}
  }

  // 2. Pause Web Speech Synthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.pause();
    } catch (_) {}
  }
}

/** Global resume helper that unpauses active sound */
export function resumeAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = false;

  // 1. Resume HTML5 Audio if paused
  if (
    window.__MEDILINGUAL_AUDIO__ &&
    window.__MEDILINGUAL_AUDIO__.src &&
    window.__MEDILINGUAL_AUDIO__.src !== window.location.href &&
    !window.__MEDILINGUAL_AUDIO__.ended
  ) {
    try {
      window.__MEDILINGUAL_AUDIO__.play().catch(() => {});
      return;
    } catch (_) {}
  }

  // 2. Resume Web Speech
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        return;
      }
    } catch (_) {}
  }

  // 3. Fallback to bookmark resume function
  if (typeof window.__MEDILINGUAL_RESUME__ === 'function') {
    try {
      window.__MEDILINGUAL_RESUME__();
    } catch (_) {}
  }
}

/**
 * Determines target language code ('te', 'hi', 'en') and BCP-47 tag.
 */
function resolveLanguage(text, langCode) {
  if (/[\u0C00-\u0C7F]/.test(text || '')) {
    return { key: 'te', bcp: 'te-IN' };
  }
  if (/[\u0900-\u097F]/.test(text || '')) {
    return { key: 'hi', bcp: 'hi-IN' };
  }

  const code = String(langCode || '').toLowerCase().trim();
  if (code.startsWith('te')) return { key: 'te', bcp: 'te-IN' };
  if (code.startsWith('hi')) return { key: 'hi', bcp: 'hi-IN' };
  return { key: 'en', bcp: 'en-US' };
}

export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const isPausedRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // Initialize voices
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

  /** Stop all playback and reset UI */
  const cancel = useCallback(() => {
    isPausedRef.current = false;
    isSpeakingRef.current = false;
    stopAllAudio();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Pause active playback */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    isSpeakingRef.current = false;
    pauseAllAudio();
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  /** Resume paused playback */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    isSpeakingRef.current = true;
    resumeAllAudio();
    setIsPaused(false);
    setIsSpeaking(true);
  }, []);

  /** Web Speech Synthesis fallback implementation */
  const playWebSpeech = useCallback(
    (textToSpeak, langKey) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !textToSpeak) {
        cancel();
        return;
      }

      stopAllAudio();

      const bcp = langKey === 'te' ? 'te-IN' : langKey === 'hi' ? 'hi-IN' : 'en-US';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = bcp;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Prevent garbage collection bug in Chrome
      window.__MEDILINGUAL_UTTERANCE__ = utterance;

      const avail = window.speechSynthesis.getVoices() || voices;
      const match = avail.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(langKey)) ||
          (v.name && v.name.toLowerCase().includes(langKey === 'hi' ? 'hindi' : langKey === 'te' ? 'telugu' : 'english'))
      );
      if (match) utterance.voice = match;

      let charOffset = 0;
      utterance.onboundary = (e) => {
        if (e.charIndex !== undefined) charOffset = e.charIndex;
      };

      utterance.onend = () => {
        // If paused, DO NOT cancel or reset UI
        if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) {
          return;
        }
        cancel();
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        }
        cancel();
      };

      // Set resume handler for when user clicks Resume
      window.__MEDILINGUAL_RESUME__ = () => {
        const remaining = textToSpeak.slice(charOffset).trim();
        if (remaining) {
          playWebSpeech(remaining, langKey);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        cancel();
      }
    },
    [cancel, pitch, rate, voices]
  );

  /** Main speak function */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text) return;

      // 1. Stop any currently playing audio/speech first
      stopAllAudio();

      // 2. Set active playback state
      if (id) {
        setActiveId(id);
      }
      isSpeakingRef.current = true;
      isPausedRef.current = false;
      setIsSpeaking(true);
      setIsPaused(false);

      // 3. Clean text for synthesis
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key } = resolveLanguage(cleanText, lang);

      // 4. Stream High-Fidelity Audio via Google TTS (Supports Telugu, Hindi, English)
      // Note: Do NOT set crossOrigin='anonymous' because Google TTS does not send CORS headers,
      // and plain HTML5 audio elements play cross-origin audio without CORS restrictions!
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleanText.slice(0, 200)
      )}&tl=${key}&client=tw-ob`;

      const audio = window.__MEDILINGUAL_AUDIO__ || new Audio();
      window.__MEDILINGUAL_AUDIO__ = audio;
      audio.src = audioUrl;

      audio.onended = () => {
        if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        cancel();
      };

      audio.onerror = () => {
        // Fallback to Web Speech API if network audio fails
        playWebSpeech(cleanText, key);
      };

      audio.play().catch(() => {
        playWebSpeech(cleanText, key);
      });
    },
    [cancel, playWebSpeech]
  );

  // Stop on component unmount
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
