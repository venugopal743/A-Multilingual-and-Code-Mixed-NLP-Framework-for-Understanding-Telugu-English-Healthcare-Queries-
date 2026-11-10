/**
 * @file useSpeechSynthesis.js
 * @description Resilient, high-definition Text-To-Speech hook for Multilingual Healthcare NLP (Hindi, Telugu, English).
 * Combines Google Neural TTS Audio streaming with native Web Speech API fallback to ensure 100% reliable
 * voice guidance on all browsers and operating systems, even when regional Indic OS language packs are missing.
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
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const activeModeRef = useRef('audio'); // 'audio' or 'synth'

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

  /** Stop active speech immediately */
  const cancel = useCallback(() => {
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
  }, []);

  /**
   * Internal helper to play chunks sequentially using Neural Audio Stream.
   */
  const playAudioChunks = useCallback((chunks, langKey, onComplete, onFallback) => {
    if (!chunks || chunks.length === 0) {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onComplete) onComplete();
      return;
    }

    const currentChunk = chunks[0];
    const remainingChunks = chunks.slice(1);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langKey}&q=${encodeURIComponent(currentChunk)}`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    activeModeRef.current = 'audio';

    audio.onplay = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    audio.onended = () => {
      if (remainingChunks.length > 0) {
        playAudioChunks(remainingChunks, langKey, onComplete, onFallback);
      } else {
        audioRef.current = null;
        setIsSpeaking(false);
        setIsPaused(false);
        if (onComplete) onComplete();
      }
    };

    audio.onerror = (err) => {
      console.warn('[MediLingual Speech] Audio stream failed, falling back to Web Speech:', err);
      audioRef.current = null;
      if (onFallback) onFallback();
    };

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[MediLingual Speech] Audio play promise rejected:', err);
          audioRef.current = null;
          if (onFallback) onFallback();
        });
      }
    } catch (err) {
      console.warn('[MediLingual Speech] Audio invocation failed:', err);
      if (onFallback) onFallback();
    }
  }, []);

  /**
   * Fallback: Native browser Web Speech API
   */
  const speakNative = useCallback((cleanText, bcp) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

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
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[MediLingual Speech] Native utterance error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
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
    }
  }, [onEnd, pitch, rate, voices]);

  /**
   * Speaks the given clinical text.
   * Prioritizes high-fidelity Neural TTS Audio for Hindi & Telugu (ensuring 100% functionality on all OS),
   * with seamless Web Speech API integration.
   * @param {string} text - Text to synthesize.
   * @param {string} [lang] - Language code or label ('HI', 'TE', 'EN', etc.).
   */
  const speak = useCallback(
    (text, lang) => {
      if (!text || typeof window === 'undefined') return;

      // Stop previous playback
      cancel();

      // Clean markdown symbols
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key, bcp } = resolveLanguage(cleanText, lang);

      // Check if browser has a native voice installed for this language
      const available = (typeof window !== 'undefined' && 'speechSynthesis' in window)
        ? (window.speechSynthesis.getVoices() || voices)
        : [];
      
      const hasNativeVoice = available.some((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        if (key === 'hi') {
          return vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('swara') || vName.includes('madhur') || vName.includes('kalpana') || vName.includes('hemant');
        }
        if (key === 'te') {
          return vLang.startsWith('te') || vName.includes('telugu') || vName.includes('mohan');
        }
        return vLang.startsWith('en');
      });

      // For Hindi and Telugu: Google Neural Audio Streamer provides 100% reliable pronunciation
      // without requiring users to download Windows language packs.
      if (key === 'hi' || key === 'te' || !hasNativeVoice) {
        const chunks = chunkText(cleanText, 140);
        setIsSpeaking(true);
        setIsPaused(false);
        playAudioChunks(
          chunks,
          key,
          () => {
            setIsSpeaking(false);
            setIsPaused(false);
            if (onEnd) onEnd();
          },
          () => speakNative(cleanText, bcp)
        );
      } else {
        // For English with installed native voices
        speakNative(cleanText, bcp);
      }
    },
    [cancel, onEnd, playAudioChunks, speakNative, voices]
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
    voices,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
  };
}

export default useSpeechSynthesis;
