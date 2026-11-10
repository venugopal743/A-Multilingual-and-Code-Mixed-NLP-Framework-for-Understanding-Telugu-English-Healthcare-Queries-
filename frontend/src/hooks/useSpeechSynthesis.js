/**
 * @file useSpeechSynthesis.js
 * @description Robust, native Text-To-Speech hook for Multilingual Healthcare NLP (Hindi, Telugu, English).
 * Utilizes standard Web Speech API with BCP-47 language targeting and sentence chunking.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Split text into natural sentences to ensure smooth, continuous playback without browser timeouts.
 * @param {string} text - Raw input text.
 * @returns {string[]} Array of clean sentence chunks.
 */
function splitIntoSentences(text) {
  if (!text) return [];
  // Clean markdown formatting
  const cleaned = text
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 140) return [cleaned];

  // Split on Hindi danda (।), period, question mark, exclamation, or newline
  const raw = cleaned.split(/(?<=[|।?!.\n])/);
  const chunks = [];
  let current = '';

  for (const part of raw) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= 140) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      current = trimmed;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [cleaned];
}

/**
 * Determines target BCP-47 language tag.
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
 * Custom hook providing reliable speech synthesis with full pause, resume, and stop controls.
 */
export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const queueRef = useRef([]);
  const activeLangRef = useRef('en-US');
  const cancelTimeoutRef = useRef(null);

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

  /** Stop all speech immediately */
  const cancel = useCallback(() => {
    queueRef.current = [];
    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    setIsSpeaking(false);
    setIsPaused(false);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Internal sequential sentence speaker */
  const speakNextInQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) onEnd();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const sentence = queueRef.current.shift();
    const targetBcp = activeLangRef.current;

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = targetBcp;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best matching voice
    const available = window.speechSynthesis.getVoices() || voices;
    if (available && available.length > 0) {
      const targetPrefix = targetBcp.split('-')[0].toLowerCase();
      const matched = available.find((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        return (
          vLang.startsWith(targetPrefix) ||
          (targetPrefix === 'hi' && (vName.includes('hindi') || vName.includes('swara') || vName.includes('kalpana') || vName.includes('hemant'))) ||
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
      speakNextInQueue();
    };

    utterance.onerror = (e) => {
      console.warn('[MediLingual Speech] Utterance error, advancing queue:', e);
      speakNextInQueue();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[MediLingual Speech] Speak call failed:', err);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [onEnd, pitch, rate, voices]);

  /**
   * Speaks the given clinical text.
   * @param {string} text - Text to synthesize.
   * @param {string} [lang] - Language code or label ('HI', 'TE', 'EN', etc.).
   */
  const speak = useCallback(
    (text, lang) => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel previous speech first
      cancel();

      const { bcp } = resolveLanguage(text, lang);
      activeLangRef.current = bcp;

      const sentences = splitIntoSentences(text);
      if (sentences.length === 0) return;

      queueRef.current = [...sentences];
      setIsSpeaking(true);
      setIsPaused(false);

      // Brief tick to avoid Chrome's cancel/speak lockup
      cancelTimeoutRef.current = setTimeout(() => {
        // Resume if browser speech engine is stuck in paused state
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (_) {}

        speakNextInQueue();
      }, 50);
    },
    [cancel, speakNextInQueue]
  );

  /** Pause active speech */
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (_) {}
    }
  }, []);

  /** Resume paused speech */
  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
