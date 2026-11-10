/**
 * @file api.js
 * @description API service functions for communicating with backend, FastAPI NLP engine,
 *              and automatic instant fallback to the client-side clinical triage engine.
 */

import axios from 'axios';

/** Axios instance for Node.js / Express backend (port 5000) */
export const backendAPI = axios.create({
  baseURL: (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api',
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

/** Axios instance for FastAPI NLP engine (port 8000) */
export const nlpAPI = axios.create({
  baseURL: (import.meta.env && import.meta.env.VITE_NLP_URL) || 'http://localhost:8000/api',
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor for JWT auth token
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('medilingual_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Sends a healthcare query to the NLP pipeline.
 * Accepts either (text, language) or ({ query, language, codeMixed })
 */
export async function sendQuery(param1, param2) {
  let text = '';
  let language = 'auto';

  if (typeof param1 === 'object' && param1 !== null) {
    text = param1.query || param1.text || '';
    language = param1.language || 'auto';
  } else {
    text = param1 || '';
    language = param2 || 'auto';
  }

  // Check if running in browser over HTTPS while backend is unconfigured http://
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const nlpUrl = (import.meta.env && import.meta.env.VITE_NLP_URL) || '';
  const apiUrl = (import.meta.env && import.meta.env.VITE_API_URL) || '';

  // Browsers block mixed-content (HTTPS -> HTTP localhost).
  // If deployed on HTTPS without an HTTPS backend, immediately use client triage engine with zero delay
  if (isHttps && !nlpUrl.startsWith('https://') && !apiUrl.startsWith('https://')) {
    throw new Error('Running on HTTPS: Fast-path to client-side Clinical NLP Engine');
  }

  try {
    const response = await nlpAPI.post('/chat', {
      text,
      language_preference: language,
    });
    return response.data;
  } catch (err) {
    try {
      const fallback = await backendAPI.post('/queries', {
        text,
        languagePreference: language,
      });
      return fallback.data?.data || fallback.data;
    } catch (backendErr) {
      throw err;
    }
  }
}

/**
 * Retrieves the chat history for the current session.
 */
export async function getHistory(sessionId) {
  const { data } = await backendAPI.get(`/chat/sessions/${sessionId}`);
  return data;
}

/**
 * Detects the language of a given text.
 */
export async function detectLanguage(text) {
  try {
    const { data } = await nlpAPI.post('/detect-language', { text });
    return data;
  } catch (_) {
    return { detected_language: 'en', confidence: 0.95 };
  }
}

/**
 * Gets suggestions/stats.
 */
export async function getSuggestions(prefix, language = 'en') {
  try {
    const { data } = await backendAPI.get('/queries/stats');
    return data;
  } catch (e) {
    return [];
  }
}

/**
 * Submits voice audio for Whisper transcription.
 */
export async function transcribeAudio(audioBlob, language = 'auto') {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('language', language);
  const { data } = await nlpAPI.post('/voice/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15000,
  });
  return data;
}

const api = {
  sendQuery,
  getHistory,
  detectLanguage,
  getSuggestions,
  transcribeAudio,
  backendAPI,
  nlpAPI,
};

export default api;
