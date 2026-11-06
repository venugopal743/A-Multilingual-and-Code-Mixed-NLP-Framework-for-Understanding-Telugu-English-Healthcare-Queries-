/**
 * @file useVoiceInput.js
 * @description Robust Web Speech API voice input hook supporting Telugu, Hindi, English,
 *              with real-time transcription, error recovery, and transcript controls.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useVoiceInput({ language = 'auto', onResult, onInterim } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  /** Map internal language codes to BCP-47 for speech recognition */
  const getBCP47Language = (langCode) => {
    switch (langCode) {
      case 'te':
      case 'te-en':
        return 'te-IN'; // Telugu (India)
      case 'hi':
      case 'hi-en':
        return 'hi-IN'; // Hindi (India)
      case 'en':
      case 'auto':
      default:
        return 'en-IN'; // English (India)
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  /** Reset current transcript */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Starts voice recognition.
   * @param {string} [langOverride] - Optional language code override
   */
  const startListening = useCallback((langOverride) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const targetLang = langOverride || language;
    const recognition = new SpeechRecognition();
    recognition.lang = getBCP47Language(targetLang);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success(`Microphone active (${recognition.lang}). Speak now...`, { id: 'voice-toast' });
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript;
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (interimStr) {
        setInterimTranscript(interimStr);
        onInterim?.(interimStr);
      }

      if (finalStr) {
        setTranscript(finalStr);
        setInterimTranscript('');
        onResult?.(finalStr);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      let userMsg = `Voice recognition error: ${event.error}`;
      if (event.error === 'not-allowed') {
        userMsg = 'Microphone permission blocked. Please allow microphone access in your browser address bar.';
      } else if (event.error === 'no-speech') {
        userMsg = 'No speech detected. Please try speaking closer to your microphone.';
      } else if (event.error === 'audio-capture') {
        userMsg = 'No microphone was found. Please ensure a microphone is connected.';
      } else if (event.error === 'network') {
        userMsg = 'Speech recognition network error. Please check your internet connection.';
      }
      setError(userMsg);
      toast.error(userMsg, { id: 'voice-toast' });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      setIsListening(false);
    }
  }, [language, onResult, onInterim]);

  /** Stops voice recognition */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /** Toggle listening */
  const toggleListening = useCallback((langOverride) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(langOverride);
    }
  }, [isListening, startListening, stopListening]);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

export default useVoiceInput;
