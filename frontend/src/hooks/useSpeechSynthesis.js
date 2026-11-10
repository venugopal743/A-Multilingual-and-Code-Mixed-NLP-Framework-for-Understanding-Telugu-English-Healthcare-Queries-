/**
 * @file useSpeechSynthesis.js
 * @description Bulletproof Text-To-Speech hook for Telugu, Hindi, and English.
 * Supports streaming high-fidelity audio with referrerpolicy="no-referrer"
 * and immediate hardware-level pause, resume, and stop controls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Get or create persistent audio element
function getOrCreateAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!window.__MEDILINGUAL_AUDIO__) {
    const audio = document.createElement('audio');
    audio.id = 'medilingual-audio-player';
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
      window.speechSynthesis.pause();
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

/** Detect target language code */
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
    stopAllAudio();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

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

  /** Web Speech Synthesis fallback */
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
        if (e.error === 'interrupted' || e.error === 'canceled') {
          if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        }
        cancel();
      };

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

      // 1. Reset any active sound first
      stopAllAudio();

      // 2. Set active playback state
      if (id) {
        setActiveId(id);
      }
      isPausedRef.current = false;
      setIsSpeaking(true);
      setIsPaused(false);

      // 3. Clean text for natural speech synthesis
      const clean = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/[|—–-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Take first clear sentence or up to 140 chars for guaranteed crisp TTS
      let speechChunk = clean;
      const periodIdx = clean.indexOf('.');
      if (periodIdx > 25 && periodIdx < 140) {
        speechChunk = clean.slice(0, periodIdx);
      } else if (clean.length > 140) {
        speechChunk = clean.slice(0, 140);
      }

      const { key } = resolveLanguage(speechChunk, lang);

      // 4. Construct high-fidelity Google TTS Audio Stream
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        speechChunk
      )}&tl=${key}&client=tw-ob`;

      const audio = getOrCreateAudioElement();
      if (!audio) {
        playWebSpeech(speechChunk, key);
        return;
      }

      audio.referrerPolicy = 'no-referrer';
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.src = audioUrl;

      audio.onended = () => {
        if (isPausedRef.current || window.__IS_MEDILINGUAL_PAUSED__) return;
        cancel();
      };

      audio.onerror = () => {
        // Fallback to Web Speech if network stream blocked
        playWebSpeech(speechChunk, key);
      };

      // Play audio directly on user click
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play catch, trying web speech fallback:', err);
          playWebSpeech(speechChunk, key);
        });
      }
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
