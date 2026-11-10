/**
 * @file api.js
 * @description API service functions for communicating with the backend and FastAPI NLP engine.
 */

import axios from 'axios';

/** Axios instance for Node.js / Express backend (port 5000) */
export const backendAPI = axios.create({
  baseURL: (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Axios instance for FastAPI NLP engine (port 8000) */
export const nlpAPI = axios.create({
  baseURL: (import.meta.env && import.meta.env.VITE_NLP_URL) || 'http://localhost:8000/api',
  timeout: 60000,
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

  try {
    // Send directly to NLP engine endpoint
    const response = await nlpAPI.post('/chat', {
      text,
      language_preference: language,
    });
    return response.data;
  } catch (err) {
    // Fallback to backend queries endpoint
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
  const { data } = await nlpAPI.post('/detect-language', { text });
  return data;
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
    timeout: 60000,
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
