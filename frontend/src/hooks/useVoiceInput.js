/**
 * @file useVoiceInput.js
 * @description Custom hook for Web Speech API voice input with recording state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook providing voice-to-text functionality using the Web Speech API.
 * @param {Object} options
 * @param {string} options.language - BCP-47 language code for recognition.
 * @param {function} options.onResult - Callback fired with the final transcript.
 * @param {function} options.onInterim - Callback fired with interim results.
 * @returns {Object} Voice input state and controls.
 */
export function useVoiceInput({ language = 'en-US', onResult, onInterim } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  /** Map internal language codes to BCP-47 */
  const langMap = {
    en: 'en-US',
    hi: 'hi-IN',
    te: 'te-IN',
    auto: 'en-US',
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  /**
   * Starts voice recognition.
   */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || language;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        onInterim?.(interimText);
      }

      if (finalText) {
        setTranscript(finalText);
        setInterimTranscript('');
        onResult?.(finalText);
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onResult, onInterim]);

  /**
   * Stops voice recognition.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /**
   * Toggles voice recognition on/off.
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
  };
}

export default useVoiceInput;
