/**
 * @file useSpeechSynthesis.js
 * @description Ultra-responsive, zero-latency Text-To-Speech hook for Telugu, Hindi, and English.
 * Uses native Web Speech API for instant (<15ms) English & supported Indic voices,
 * and high-speed preloaded audio streaming with referrerpolicy="no-referrer" for others.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Persistent in-memory audio element
function getOrCreateAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!window.__MEDILINGUAL_AUDIO__) {
    const audio = document.createElement('audio');
    audio.id = 'medilingual-audio-player';
    audio.preload = 'auto';
    audio.referrerPolicy = 'no-referrer';
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.style.display = 'none';
    if (document.body) {
      document.body.appendChild(audio);
    }
    window.__MEDILINGUAL_AUDIO__ = audio;
  }
  return window.__MEDILINGUAL_AUDIO__;
}

if (typeof window !== 'undefined') {
  window.__IS_MEDILINGUAL_PAUSED__ = false;
  window.__MEDILINGUAL_RESUME__ = null;
  window.__AUDIO_PRELOAD_CACHE__ = new Map();
}

/** Global stop helper that unconditionally silences all sound */
export function stopAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = false;
  window.__MEDILINGUAL_RESUME__ = null;

  // 1. Kill HTML5 Audio
  const audio = window.__MEDILINGUAL_AUDIO__;
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    } catch (_) {}
  }

  // 2. Kill Web Speech Synthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  window.__MEDILINGUAL_UTTERANCE__ = null;
}

/** Global pause helper that freezes sound */
export function pauseAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = true;

  const audio = window.__MEDILINGUAL_AUDIO__;
  if (audio && !audio.paused) {
    try {
      audio.pause();
    } catch (_) {}
  }

  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    try {
      window.speechSynthesis.pause();
    } catch (_) {}
  }
}

/** Global resume helper */
export function resumeAllAudio() {
  if (typeof window === 'undefined') return;

  window.__IS_MEDILINGUAL_PAUSED__ = false;

  const audio = window.__MEDILINGUAL_AUDIO__;
  if (audio && audio.src && audio.src !== window.location.href && !audio.ended) {
    try {
      audio.play().catch(() => {});
      return;
    } catch (_) {}
  }

  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    try {
      window.speechSynthesis.resume();
      return;
    } catch (_) {}
  }

  if (typeof window.__MEDILINGUAL_RESUME__ === 'function') {
    try {
      window.__MEDILINGUAL_RESUME__();
    } catch (_) {}
  }
}

/** Detect language key and BCP-47 tag */
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

/** Extract concise, natural speech chunk for instant synthesis */
function cleanForSpeech(text) {
  if (!text) return '';
  const clean = text
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/[|—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract first clear clinical sentence (up to ~90 chars) for ultra-fast audio response
  const firstPeriod = clean.indexOf('.');
  if (firstPeriod > 20 && firstPeriod <= 100) {
    return clean.slice(0, firstPeriod + 1).trim();
  }
  if (clean.length > 95) {
    return clean.slice(0, 95).trim();
  }
  return clean;
}

/** Preload audio URL into browser cache */
export function preloadAudio(text, lang) {
  if (typeof window === 'undefined' || !text) return;
  const chunk = cleanForSpeech(text);
  const { key } = resolveLanguage(chunk, lang);

  // English uses instant local Web Speech, no preload needed
  if (key === 'en') return;

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    chunk
  )}&tl=${key}&client=tw-ob`;

  if (!window.__AUDIO_PRELOAD_CACHE__.has(url)) {
    const preloader = new Audio();
    preloader.preload = 'auto';
    preloader.referrerPolicy = 'no-referrer';
    preloader.src = url;
    window.__AUDIO_PRELOAD_CACHE__.set(url, preloader);
  }
}

export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const isPausedRef = useRef(false);

  // Keep the latest onEnd in a ref so `cancel` stays stable across renders.
  // (An inline onEnd from the parent used to recreate `cancel` on every render,
  // which re-ran the unmount effect below and killed speech ~1ms after it started.)
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // Initialize browser speech voices
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
    stopAllAudio();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEndRef.current) onEndRef.current();
  }, []);

  /** Pause active playback */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    pauseAllAudio();
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  /** Resume paused playback */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    resumeAllAudio();
    setIsPaused(false);
    setIsSpeaking(true);
  }, []);

  /** Native Web Speech Synthesis: Instant <15ms response */
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
        if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        cancel();
      };

      utterance.onerror = (e) => {
        // 'interrupted' / 'canceled' only happen when we stopped speech ourselves
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        cancel();
      };

      window.__MEDILINGUAL_RESUME__ = () => {
        const remaining = textToSpeak.slice(charOffset).trim();
        if (remaining) {
          playWebSpeech(remaining, langKey);
        }
      };

      try {
        // Chrome can be left in a paused state by an earlier pause(); un-stick it
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
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

      // 1. Immediately reset active sound
      stopAllAudio();

      // 2. Set active playback state
      if (id) {
        setActiveId(id);
      }
      isPausedRef.current = false;
      setIsSpeaking(true);
      setIsPaused(false);

      const chunk = cleanForSpeech(text);
      const { key } = resolveLanguage(chunk, lang);

      // Check if browser has a native voice for this language
      const avail = (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.getVoices()) || voices;
      const hasVoice = avail.some(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(key)) ||
          (v.name && v.name.toLowerCase().includes(key === 'hi' ? 'hindi' : key === 'te' ? 'telugu' : 'english'))
      );

      // FAST PATH: English OR any language with a native browser voice starts speaking in <15ms!
      if (key === 'en' || hasVoice) {
        playWebSpeech(chunk, key);
        return;
      }

      // STREAMING PATH: Telugu / Hindi without local SAPI voice
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${key}&client=tw-ob`;

      const audio = getOrCreateAudioElement();
      if (!audio) {
        playWebSpeech(chunk, key);
        return;
      }

      audio.referrerPolicy = 'no-referrer';
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.preload = 'auto';
      audio.src = audioUrl;

      audio.onended = () => {
        if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        cancel();
      };

      audio.onerror = () => {
        playWebSpeech(chunk, key);
      };

      // Play audio immediately on user click
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play catch, switching to web speech:', err);
          playWebSpeech(chunk, key);
        });
      }
    },
    [cancel, playWebSpeech, voices]
  );

  // Stop on component unmount ONLY (empty deps — must not re-run on re-render)
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

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
    preload: preloadAudio,
  };
}

export default useSpeechSynthesis;
