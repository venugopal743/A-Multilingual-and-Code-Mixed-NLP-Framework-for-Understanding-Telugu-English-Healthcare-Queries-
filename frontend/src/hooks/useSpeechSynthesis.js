/**
 * @file useSpeechSynthesis.js
 * @description Bulletproof Text-To-Speech hook for Multilingual Healthcare NLP (Telugu, Hindi, English).
 * Uses a robust audio stream controller with instant Pause, Resume, and Stop controls,
 * backed by Web Speech Synthesis fallback.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/** Global audio instance for guaranteed single-point playback control */
let globalAudio = null;
let chunkQueue = [];
let currentChunkIndex = 0;
let currentLanguage = 'en';
let playbackMode = null; // 'audio' or 'speech'

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

/**
 * Splits clinical text into speakable sentence chunks (< 170 chars each).
 */
function splitIntoChunks(text, maxLen = 170) {
  if (!text) return [];
  const sentences = text.match(/[^.!?\n;]+[.!?\n;]+|[^.!?\n;]+$/g) || [text];
  const chunks = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      const words = trimmed.split(/\s+/);
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length <= maxLen) {
          current = (current + ' ' + word).trim();
        } else {
          if (current) chunks.push(current);
          current = word;
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

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

  /** Stop all audio and reset state */
  const cancel = useCallback(() => {
    // 1. Halt HTML5 Audio
    if (globalAudio) {
      try {
        globalAudio.pause();
        globalAudio.onended = null;
        globalAudio.onerror = null;
        globalAudio.src = '';
        globalAudio = null;
      } catch (_) {}
    }
    chunkQueue = [];
    currentChunkIndex = 0;

    // 2. Halt Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    playbackMode = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Pause active playback */
  const pause = useCallback(() => {
    // Pause HTML5 Audio
    if (globalAudio) {
      try {
        globalAudio.pause();
      } catch (_) {}
    }
    // Pause Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (_) {}
    }
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  /** Resume paused playback */
  const resume = useCallback(() => {
    // Resume HTML5 Audio
    if (globalAudio) {
      try {
        globalAudio.play();
      } catch (_) {}
    }
    // Resume Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {}
    }
    setIsPaused(false);
    setIsSpeaking(true);
  }, []);

  /** Play next sentence chunk in queue */
  const playNext = useCallback(() => {
    if (currentChunkIndex >= chunkQueue.length) {
      cancel();
      return;
    }

    const chunk = chunkQueue[currentChunkIndex];
    const lang = currentLanguage;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      chunk
    )}&tl=${lang}&client=tw-ob`;

    const audio = new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    globalAudio = audio;
    playbackMode = 'audio';

    audio.onended = () => {
      currentChunkIndex += 1;
      playNext();
    };

    audio.onerror = () => {
      // Fallback to browser Web Speech API
      fallbackSpeech(chunk, lang);
    };

    audio.play().catch(() => {
      fallbackSpeech(chunk, lang);
    });
  }, [cancel]);

  /** Fallback to browser SpeechSynthesis */
  const fallbackSpeech = useCallback(
    (text, langKey) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        cancel();
        return;
      }

      playbackMode = 'speech';
      const bcp = langKey === 'te' ? 'te-IN' : langKey === 'hi' ? 'hi-IN' : 'en-US';
      const utterance = new SpeechSynthesisUtterance(text);
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

      utterance.onend = () => {
        cancel();
      };
      utterance.onerror = () => {
        cancel();
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

      // Stop previous playback
      cancel();

      // Set active playback state
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key } = resolveLanguage(cleanText, lang);
      currentLanguage = key;

      chunkQueue = splitIntoChunks(cleanText);
      currentChunkIndex = 0;

      playNext();
    },
    [cancel, playNext]
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
