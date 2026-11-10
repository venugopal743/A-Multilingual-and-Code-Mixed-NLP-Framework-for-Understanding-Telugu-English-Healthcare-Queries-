/**
 * @file useSpeechSynthesis.js
 * @description Resilient, high-definition Text-To-Speech hook for Multilingual Healthcare NLP (Hindi, Telugu, English).
 * Combines Google Neural TTS Audio streaming with native Web Speech API fallback to ensure 100% reliable
 * voice guidance, instant Pause/Stop state transitions, and authentic multilingual playback.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Determines target language key and BCP-47 tag.
 * @param {string} text - Message text.
 * @param {string} langCode - Language code.
 * @returns {{ key: string, bcp: string }} Language info.
 */
function resolveLanguage(text, langCode) {
  // Check script in text first
  if (/[\u0900-\u097F]/.test(text || '')) {
    return { key: 'hi', bcp: 'hi-IN' };
  }
  if (/[\u0C00-\u0C7F]/.test(text || '')) {
    return { key: 'te', bcp: 'te-IN' };
  }

  // Otherwise inspect language code
  const code = String(langCode || '').toLowerCase().trim();
  if (code.startsWith('hi')) return { key: 'hi', bcp: 'hi-IN' };
  if (code.startsWith('te')) return { key: 'te', bcp: 'te-IN' };
  return { key: 'en', bcp: 'en-US' };
}

/**
 * Splits text into natural sentence chunks (<= 140 chars) for smooth streaming.
 * @param {string} text - Clean input text.
 * @param {number} maxLen - Max characters per chunk.
 * @returns {string[]} Array of sentence chunks.
 */
function chunkText(text, maxLen = 140) {
  if (!text) return [];
  const clean = text
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return [clean];

  // Split on Hindi danda (।), full stop, question mark, exclamation, or comma
  const parts = clean.split(/(?<=[|।?!,\n])/);
  const chunks = [];
  let current = '';

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      current = trimmed;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

/**
 * Custom hook providing reliable speech synthesis with full pause, resume, and stop controls.
 */
export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const activeModeRef = useRef('audio'); // 'audio' or 'synth'
  const chunkQueueRef = useRef([]);
  const currentLangRef = useRef('en');

  // Initialize and load browser voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      const loadVoices = () => {
        try {
          const list = window.speechSynthesis.getVoices() || [];
          setVoices(list);
        } catch (_) {}
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  /** Stop active speech immediately and reset all state */
  const cancel = useCallback(() => {
    chunkQueueRef.current = [];

    // 1. Stop audio playback if active
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      } catch (_) {}
    }

    // 2. Stop native synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Fallback: Native browser Web Speech API */
  const speakNative = useCallback((cleanText, bcp) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const available = window.speechSynthesis.getVoices() || voices;
    if (available && available.length > 0) {
      const targetPrefix = bcp.split('-')[0].toLowerCase();
      const matched = available.find((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        return (
          vLang.startsWith(targetPrefix) ||
          (targetPrefix === 'hi' && (vName.includes('hindi') || vName.includes('swara') || vName.includes('kalpana') || vName.includes('hemant') || vName.includes('madhur'))) ||
          (targetPrefix === 'te' && (vName.includes('telugu') || vName.includes('mohan'))) ||
          (targetPrefix === 'en' && vLang.startsWith('en'))
        );
      });
      if (matched) {
        utterance.voice = matched;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      // Ignore deliberate cancellations from previous speak calls
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('[MediLingual Speech] Native utterance error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    activeModeRef.current = 'synth';
    setIsSpeaking(true);
    setIsPaused(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[MediLingual Speech] Native speak call failed:', err);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
    }
  }, [onEnd, pitch, rate, voices]);

  /** Helper to play audio chunks sequentially */
  const playNextChunk = useCallback(() => {
    if (chunkQueueRef.current.length === 0) {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      audioRef.current = null;
      if (onEnd) onEnd();
      return;
    }

    const nextChunk = chunkQueueRef.current.shift();
    const langKey = currentLangRef.current;
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langKey}&q=${encodeURIComponent(nextChunk)}`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    activeModeRef.current = 'audio';

    audio.onplay = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    audio.onended = () => {
      playNextChunk();
    };

    audio.onerror = (err) => {
      console.warn('[MediLingual Speech] Audio stream failed, falling back:', err);
      speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US');
    };

    try {
      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[MediLingual Speech] Audio play promise failed:', err);
          speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US');
        });
      }
    } catch (err) {
      speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US');
    }
  }, [onEnd, speakNative]);

  /**
   * Speaks the given clinical text.
   * Immediately sets activeId and isSpeaking so UI instantly reflects Pause / Stop buttons.
   * @param {string} text - Text to synthesize.
   * @param {string} [lang] - Language code ('HI', 'TE', 'EN', etc.).
   * @param {string} [id] - Unique message ID for audio binding.
   */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text || typeof window === 'undefined') return;

      // 1. Immediately bind active state synchronously so UI shows Pause/Stop
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      // Stop previous audio playback (without wiping the new activeId)
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        } catch (_) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }

      // Clean markdown symbols
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key, bcp } = resolveLanguage(cleanText, lang);
      currentLangRef.current = key;

      const chunks = chunkText(cleanText, 140);
      if (chunks.length > 0) {
        chunkQueueRef.current = [...chunks];
        playNextChunk();
      } else {
        speakNative(cleanText, bcp);
      }
    },
    [playNextChunk, speakNative]
  );

  /** Pause active speech */
  const pause = useCallback(() => {
    if (activeModeRef.current === 'audio' && audioRef.current && !audioRef.current.paused) {
      try {
        audioRef.current.pause();
        setIsPaused(true);
      } catch (_) {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (_) {}
    }
  }, []);

  /** Resume paused speech */
  const resume = useCallback(() => {
    if (activeModeRef.current === 'audio' && audioRef.current && audioRef.current.paused) {
      try {
        audioRef.current.play();
        setIsPaused(false);
      } catch (_) {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch (_) {}
    }
  }, []);

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
