/**
 * @file useSpeechSynthesis.js
 * @description Custom hook for text-to-speech output using the Web Speech Synthesis API.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook providing text-to-speech functionality.
 * @param {Object} options
 * @param {string} options.language - BCP-47 language code for synthesis.
 * @param {number} options.rate - Speech rate (0.1–10, default 1).
 * @param {number} options.pitch - Speech pitch (0–2, default 1).
 * @returns {Object} Speech synthesis state and controls.
 */
export function useSpeechSynthesis({ language = 'en-US', rate = 1, pitch = 1 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  /** Map internal language codes to BCP-47 */
  const langMap = {
    en: 'en-US',
    hi: 'hi-IN',
    te: 'te-IN',
    auto: 'en-US',
  };

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  /**
   * Speaks the given text.
   * @param {string} text - Text to speak.
   * @param {string} [lang] - Override language code.
   */
  const speak = useCallback(
    (text, lang) => {
      if (!('speechSynthesis' in window) || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = langMap[lang || language] || lang || language;
      utterance.lang = targetLang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Try to find a voice for the language
      const matchingVoice = voices.find(
        (v) => v.lang.startsWith(targetLang.split('-')[0])
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language, rate, pitch, voices]
  );

  /** Pauses current speech. */
  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  /** Resumes paused speech. */
  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  /** Cancels all speech. */
  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
