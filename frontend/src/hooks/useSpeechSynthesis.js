/**
 * @file useSpeechSynthesis.js
 * @description Bulletproof Text-To-Speech hook for Multilingual Healthcare NLP (Hindi, Telugu, English).
 * Ensures instant UI response (showing Pause & Stop buttons), synchronous user-activation compliance,
 * Chrome GC protection, and accurate voice routing across Indic and English languages.
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
 * Finds the best matching voice from available speech synthesis voices.
 * Returns null if no voice matches the specific target language so the browser
 * uses the correct language engine rather than forcing an English voice onto Indic text.
 */
function findBestVoice(voices, bcp, key) {
  if (!voices || voices.length === 0) return null;
  const targetPrefix = key.toLowerCase();
  const bcpLower = bcp.toLowerCase().replace('_', '-');

  // 1. Exact match on BCP-47 tag (e.g. 'hi-in', 'te-in', 'en-us')
  let match = voices.find((v) => {
    const l = (v.lang || '').toLowerCase().replace('_', '-');
    return l === bcpLower;
  });
  if (match) return match;

  // 2. Language prefix match (starts with 'hi', 'te', 'en')
  match = voices.find((v) => {
    const l = (v.lang || '').toLowerCase().replace('_', '-');
    return l.startsWith(targetPrefix);
  });
  if (match) return match;

  // 3. Name match across Latin and Native Indic script
  match = voices.find((v) => {
    const n = (v.name || '').toLowerCase();
    if (targetPrefix === 'hi') {
      return (
        n.includes('hindi') ||
        n.includes('हिन्दी') ||
        n.includes('swara') ||
        n.includes('madhur') ||
        n.includes('kalpana') ||
        n.includes('hemant') ||
        n.includes('lekha') ||
        n.includes('neerja')
      );
    }
    if (targetPrefix === 'te') {
      return (
        n.includes('telugu') ||
        n.includes('తెలుగు') ||
        n.includes('mohan') ||
        n.includes('chitra')
      );
    }
    return n.includes('english') || (v.lang && v.lang.toLowerCase().startsWith('en'));
  });
  if (match) return match;

  // Return null if no matching voice found for this language
  return null;
}

/**
 * Custom hook providing reliable speech synthesis with instant pause, resume, and stop controls.
 */
export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  // Load voices on mount and keep updated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      const loadVoices = () => {
        try {
          const list = window.speechSynthesis.getVoices() || [];
          if (list.length > 0) {
            setVoices(list);
          }
        } catch (_) {}
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  /** Keep-alive heartbeat for Chromium speech synthesis engine */
  useEffect(() => {
    let timer = null;
    if (isSpeaking && !isPaused && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      timer = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 12000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSpeaking, isPaused]);

  /** Stop speech immediately and reset UI state */
  const cancel = useCallback(() => {
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

  /** Pause active speech */
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (_) {}
    }
    setIsPaused(true);
  }, []);

  /** Resume paused speech */
  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {}
    }
    setIsPaused(false);
  }, []);

  /**
   * Speaks the given clinical text.
   * Immediately sets activeId and isSpeaking synchronously so UI instantly reflects Pause & Stop buttons.
   * @param {string} text - Text to synthesize.
   * @param {string} [lang] - Language code ('HI', 'TE', 'EN', etc.).
   * @param {string} [id] - Unique message ID for audio binding.
   */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // 1. Synchronously set active state so UI immediately renders Pause and Stop buttons
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      // Clean markdown symbols from clinical text
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key, bcp } = resolveLanguage(cleanText, lang);

      // Resume if stuck in paused state
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (_) {}

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = bcp;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Select best voice if available
      const availableVoices = window.speechSynthesis.getVoices() || voices;
      const matchedVoice = findBestVoice(availableVoices, bcp, key);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveId(null);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          return;
        }
        console.warn('[MediLingual Speech] Utterance error:', e.error);
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveId(null);
        if (onEnd) onEnd();
      };

      // Anchor reference to window to avoid Chrome V8 garbage collection bug
      window.__activeUtterance = utterance;

      // Invoke speech synthesis directly within user click gesture
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[MediLingual Speech] Speak call failed:', err);
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveId(null);
      }
    },
    [onEnd, pitch, rate, voices]
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
