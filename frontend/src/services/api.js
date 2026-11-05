/**
 * @file api.js
 * @description Axios instance and API service functions for communicating
 *              with the Flask backend and FastAPI NLP engine.
 */

import axios from 'axios';

/** Axios instance for the Flask backend (port 5000) */
const backendAPI = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Axios instance for the FastAPI NLP engine (port 8000) */
const nlpAPI = axios.create({
  baseURL: '/nlp',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/** Request interceptor — attach auth token if available */
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('medilingual_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Response interceptor — normalize errors */
const errorHandler = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'An unexpected error occurred';
  return Promise.reject(new Error(message));
};

backendAPI.interceptors.response.use((res) => res, errorHandler);
nlpAPI.interceptors.response.use((res) => res, errorHandler);

/**
 * Sends a healthcare query to the NLP pipeline.
 * @param {Object} params
 * @param {string} params.query - The user's query text.
 * @param {string} params.language - Language code (en, hi, te, auto).
 * @param {boolean} params.codeMixed - Whether code-mixing mode is active.
 * @returns {Promise<Object>} API response with analysis and generated answer.
 */
export async function sendQuery({ query, language = 'auto', codeMixed = false }) {
  const { data } = await nlpAPI.post('/analyze', { query, language, code_mixed: codeMixed });
  return data;
}

/**
 * Retrieves the chat history for the current session.
 * @param {string} sessionId - Session identifier.
 * @returns {Promise<Array>} Array of chat message objects.
 */
export async function getHistory(sessionId) {
  const { data } = await backendAPI.get(`/chat/history/${sessionId}`);
  return data;
}

/**
 * Detects the language of a given text.
 * @param {string} text - Text to detect language for.
 * @returns {Promise<Object>} Detected language info with confidence.
 */
export async function detectLanguage(text) {
  const { data } = await nlpAPI.post('/detect-language', { text });
  return data;
}

/**
 * Gets autocomplete/suggestion queries based on partial input.
 * @param {string} prefix - Partial query text.
 * @param {string} language - Language code.
 * @returns {Promise<Array<string>>} Suggested query completions.
 */
export async function getSuggestions(prefix, language = 'en') {
  const { data } = await backendAPI.get('/suggestions', {
    params: { prefix, language },
  });
  return data;
}

/**
 * Submits voice audio for Whisper transcription.
 * @param {Blob} audioBlob - Recorded audio blob.
 * @param {string} language - Expected language code.
 * @returns {Promise<Object>} Transcription result.
 */
export async function transcribeAudio(audioBlob, language = 'auto') {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('language', language);
  const { data } = await nlpAPI.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export { backendAPI, nlpAPI };
