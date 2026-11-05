/**
 * @file helpers.js
 * @description Utility functions for text formatting, language detection,
 *              timestamp handling, and general helpers.
 */

/**
 * Formats a timestamp into a human-readable time string.
 * @param {Date|string|number} timestamp - The timestamp to format.
 * @returns {string} Formatted time string (e.g., "2:30 PM").
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a timestamp into a relative time string.
 * @param {Date|string|number} timestamp - The timestamp to format.
 * @returns {string} Relative time string (e.g., "2 minutes ago").
 */
export function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Detects the primary script used in a text string.
 * @param {string} text - Text to analyze.
 * @returns {'telugu'|'devanagari'|'latin'|'mixed'} Detected script type.
 */
export function detectScript(text) {
  if (!text) return 'latin';

  const teluguPattern = /[\u0C00-\u0C7F]/;
  const devanagariPattern = /[\u0900-\u097F]/;
  const latinPattern = /[a-zA-Z]/;

  const hasTelugu = teluguPattern.test(text);
  const hasDevanagari = devanagariPattern.test(text);
  const hasLatin = latinPattern.test(text);

  const scriptCount = [hasTelugu, hasDevanagari, hasLatin].filter(Boolean).length;

  if (scriptCount > 1) return 'mixed';
  if (hasTelugu) return 'telugu';
  if (hasDevanagari) return 'devanagari';
  return 'latin';
}

/**
 * Returns a language label based on script detection.
 * @param {string} text - Text to analyze.
 * @returns {string} Language label.
 */
export function guessLanguageLabel(text) {
  const script = detectScript(text);
  switch (script) {
    case 'telugu': return 'Telugu';
    case 'devanagari': return 'Hindi';
    case 'mixed': return 'Code-Mixed';
    default: return 'English';
  }
}

/**
 * Truncates a string to the specified length and appends an ellipsis.
 * @param {string} str - String to truncate.
 * @param {number} maxLen - Maximum length.
 * @returns {string} Truncated string.
 */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + '…';
}

/**
 * Generates a unique ID string.
 * @returns {string} A unique identifier.
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Returns a confidence level label and color based on a score.
 * @param {number} score - Confidence score between 0 and 1.
 * @returns {{ label: string, color: string }} Confidence metadata.
 */
export function getConfidenceLevel(score) {
  if (score >= 0.9) return { label: 'Very High', color: 'text-emerald-600' };
  if (score >= 0.75) return { label: 'High', color: 'text-green-600' };
  if (score >= 0.6) return { label: 'Moderate', color: 'text-amber-600' };
  if (score >= 0.4) return { label: 'Low', color: 'text-orange-600' };
  return { label: 'Very Low', color: 'text-red-600' };
}

/**
 * Formats a number with comma separators.
 * @param {number} num - Number to format.
 * @returns {string} Formatted number string.
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Formats a percentage value.
 * @param {number} value - Value to format.
 * @param {number} decimals - Number of decimal places.
 * @returns {string} Formatted percentage string.
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - Input string.
 * @returns {string} Capitalized string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a snake_case string to Title Case.
 * @param {string} str - Snake case string.
 * @returns {string} Title case string.
 */
export function snakeToTitle(str) {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Returns an entity type color from the ENTITY_TYPES constant.
 * @param {string} type - Entity type ID.
 * @returns {{ color: string, bgColor: string }} Color values.
 */
export function getEntityColor(type) {
  const colorMap = {
    SYMPTOM: { color: '#ef4444', bgColor: '#fef2f2' },
    DISEASE: { color: '#f59e0b', bgColor: '#fffbeb' },
    MEDICATION: { color: '#6366F1', bgColor: '#eef2ff' },
    BODY_PART: { color: '#14B8A6', bgColor: '#f0fdfa' },
    DOSAGE: { color: '#8b5cf6', bgColor: '#f5f3ff' },
    DURATION: { color: '#0EA5E9', bgColor: '#f0f9ff' },
    TEST: { color: '#ec4899', bgColor: '#fdf2f8' },
  };
  return colorMap[type] || { color: '#64748b', bgColor: '#f8fafc' };
}

/**
 * Delays execution for a given number of milliseconds.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
