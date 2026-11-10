/**
 * @file useSpeechSynthesis.js
 * @description Resilient Text-To-Speech hook for Multilingual Healthcare NLP (Hindi, Telugu, English).
 * Utilizes native Web Speech API for English and installed Indic voices, with neural audio fallback
 * for Indic languages when local OS voice packs are missing.
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
 * Finds the best matching voice from the browser's available speech synthesis voices.
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

  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Splits text into natural sentence chunks (<= 140 chars) for smooth streaming.
 */
function chunkText(text, maxLen = 140) {
  if (!text) return [];
  const clean = text
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return [clean];

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
 * Custom hook providing reliable speech synthesis with instant pause, resume, and stop controls.
 */
export function useSpeechSynthesis({ rate = 0.95, pitch = 1, onEnd } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const activeModeRef = useRef('synth'); // 'synth' or 'audio'
  const isCancellingRef = useRef(false);
  const chunkQueueRef = useRef([]);
  const currentLangRef = useRef('en');

  // Load voices on mount and on voiceschanged event
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

  /** Stop active speech immediately */
  const cancel = useCallback(() => {
    isCancellingRef.current = true;
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

    setTimeout(() => {
      isCancellingRef.current = false;
    }, 100);
  }, [onEnd]);

  /** Speaks via native Web Speech API */
  const speakNative = useCallback((cleanText, bcp, key) => {
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
      isCancellingRef.current = true;
      window.speechSynthesis.cancel();
    } catch (_) {}

    setTimeout(() => {
      isCancellingRef.current = false;
    }, 50);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp;
    utterance.rate = rate;
    utterance.pitch = pitch;

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
      if (isCancellingRef.current) return;
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (isCancellingRef.current || e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('[MediLingual Speech] Utterance error:', e.error);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    activeModeRef.current = 'synth';

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[MediLingual Speech] Native speak call failed:', err);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveId(null);
    }
  }, [onEnd, pitch, rate, voices]);

  /** Plays audio chunks sequentially for Indic fallback */
  const playNextAudioChunk = useCallback(() => {
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

    const audio = new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.src = audioUrl;
    audioRef.current = audio;
    activeModeRef.current = 'audio';

    audio.onplay = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    audio.onpause = () => {
      setIsPaused(true);
    };

    audio.onended = () => {
      playNextAudioChunk();
    };

    audio.onerror = (err) => {
      console.warn('[MediLingual Speech] Audio stream failed, falling back to native:', err);
      speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US', langKey);
    };

    try {
      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[MediLingual Speech] Audio play promise failed:', err);
          speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US', langKey);
        });
      }
    } catch (err) {
      speakNative(nextChunk, langKey === 'hi' ? 'hi-IN' : langKey === 'te' ? 'te-IN' : 'en-US', langKey);
    }
  }, [onEnd, speakNative]);

  /**
   * Speaks the given clinical text.
   * Immediately sets activeId and isSpeaking so UI instantly displays Pause and Stop buttons.
   * @param {string} text - Text to synthesize.
   * @param {string} [lang] - Language code ('HI', 'TE', 'EN', etc.).
   * @param {string} [id] - Unique message ID for audio binding.
   */
  const speak = useCallback(
    (text, lang, id) => {
      if (!text || typeof window === 'undefined') return;

      // 1. Immediately bind active state synchronously so UI displays Pause & Stop buttons
      if (id) {
        setActiveId(id);
      }
      setIsSpeaking(true);
      setIsPaused(false);

      // Clean markdown symbols
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const { key, bcp } = resolveLanguage(cleanText, lang);
      currentLangRef.current = key;

      // Check if browser has an installed native voice for this language
      const availableVoices = (typeof window !== 'undefined' && 'speechSynthesis' in window)
        ? (window.speechSynthesis.getVoices() || voices)
        : [];
      
      const hasSpecificVoice = availableVoices.some((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        if (key === 'hi') {
          return (
            vLang.startsWith('hi') ||
            vName.includes('hindi') ||
            vName.includes('हिन्दी') ||
            vName.includes('swara') ||
            vName.includes('madhur')
          );
        }
        if (key === 'te') {
          return (
            vLang.startsWith('te') ||
            vName.includes('telugu') ||
            vName.includes('తెలుగు') ||
            vName.includes('mohan')
          );
        }
        return vLang.startsWith('en');
      });

      // For English OR when a native voice exists: use native Web Speech API
      if (key === 'en' || hasSpecificVoice) {
        speakNative(cleanText, bcp, key);
      } else {
        // For Indic languages without local OS voice packs: stream via neural audio
        const chunks = chunkText(cleanText, 140);
        if (chunks.length > 0) {
          chunkQueueRef.current = [...chunks];
          playNextAudioChunk();
        } else {
          speakNative(cleanText, bcp, key);
        }
      }
    },
    [playNextAudioChunk, speakNative, voices]
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
