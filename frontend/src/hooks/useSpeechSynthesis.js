/**
 * @file useSpeechSynthesis.js
 * @description Robust, cross-platform Text-To-Speech hook for Multilingual Healthcare NLP (Telugu, Hindi, English).
 * Provides seamless playback for Telugu and Hindi (which lack native Windows SAPI voices)
 * via Google Cloud TTS stream with instant fallback to Web Speech Synthesis.
 * Guarantees immediate UI update (showing Pause & Stop buttons) and full playback control.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

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
 * Splits clinical text into speakable sentence chunks (< 180 chars each)
 * for smooth continuous audio streaming.
 */
function splitIntoChunks(text, maxLen = 170) {
  if (!text) return [];
  // Split on sentence boundaries
  const sentences = text.match(/[^.!?\n;]+[.!?\n;]+|[^.!?\n;]+$/g) || [text];
  const chunks = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Split by words
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

  // References for playback management
  const currentAudioRef = useRef(null);
  const chunkQueueRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const currentLangRef = useRef('en');
  const activeModeRef = useRef(null); // 'audio' or 'speech'

  // Load browser speech synthesis voices if available
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

  /** Stop all playback and reset state */
  const cancel = useCallback(() => {
    // 1. Stop HTML5 audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      } catch (_) {}
    }
    chunkQueueRef.current = [];
    currentChunkIndexRef.current = 0;

    // 2. Stop Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    activeModeRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
    if (onEnd) onEnd();
  }, [onEnd]);

  /** Pause active playback */
  const pause = useCallback(() => {
    if (activeModeRef.current === 'audio' && currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
      } catch (_) {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (_) {}
    }
    setIsPaused(true);
  }, []);

  /** Resume paused playback */
  const resume = useCallback(() => {
    if (activeModeRef.current === 'audio' && currentAudioRef.current) {
      try {
        currentAudioRef.current.play();
      } catch (_) {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {}
    }
    setIsPaused(false);
  }, []);

  /**
   * Play next chunk in queue using HTML5 Audio
   */
  const playNextChunk = useCallback(() => {
    const queue = chunkQueueRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= queue.length) {
      // Finished all chunks
      cancel();
      return;
    }

    const chunk = queue[index];
    const lang = currentLangRef.current;
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      chunk
    )}&tl=${lang}&client=tw-ob`;

    const audio = new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.crossOrigin = 'anonymous';
    audio.src = audioUrl;
    currentAudioRef.current = audio;

    audio.onended = () => {
      currentChunkIndexRef.current += 1;
      playNextChunk();
    };

    audio.onerror = () => {
      // If audio fails for this chunk, attempt browser synthesis fallback
      fallbackToWebSpeech(chunk, lang);
    };

    audio.play().catch(() => {
      // Autoplay or network issue, fallback to Web Speech
      fallbackToWebSpeech(chunk, lang);
    });
  }, [cancel]);

  /**
   * Fallback to Web Speech Synthesis API
   */
  const fallbackToWebSpeech = useCallback(
    (text, langKey) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        cancel();
        return;
      }

      activeModeRef.current = 'speech';
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

  /**
   * Speaks the clinical text.
   * Immediately updates UI state so Pause & Stop buttons show up synchronously on click.
   */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text) return;

      // Stop any existing playback first
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        } catch (_) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }

      // Synchronously set UI state so Pause & Stop show immediately
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      // Clean markdown characters from clinical guidance text
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key } = resolveLanguage(cleanText, lang);
      currentLangRef.current = key;

      const chunks = splitIntoChunks(cleanText);
      chunkQueueRef.current = chunks;
      currentChunkIndexRef.current = 0;
      activeModeRef.current = 'audio';

      // Start playing
      playNextChunk();
    },
    [playNextChunk]
  );

  // Clean up on component unmount
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
