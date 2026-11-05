const axios = require('axios');
const logger = require('../utils/logger');
const { API_ENDPOINTS } = require('../config/constants');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function getNlpClient() {
  const baseURL = process.env.NLP_ENGINE_URL || 'http://localhost:8000';
  const timeout = parseInt(process.env.NLP_ENGINE_TIMEOUT, 10) || 30000;

  return axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function callWithRetry(requestFn, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await requestFn();
      return response.data;
    } catch (err) {
      const isLast = attempt === retries;
      const isRetryable =
        !err.response || (err.response && err.response.status >= 500);

      if (isLast || !isRetryable) {
        logger.error('NLP service call failed after retries', {
          attempt,
          error: err.message,
          status: err.response ? err.response.status : null,
        });
        throw err;
      }

      logger.warn(`NLP service call attempt ${attempt} failed, retrying...`, {
        error: err.message,
      });
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}

/**
 * Detect the language of a given text.
 */
async function detectLanguage(text) {
  const client = getNlpClient();
  try {
    const data = await callWithRetry(() =>
      client.post(API_ENDPOINTS.NLP.DETECT_LANGUAGE, { text })
    );
    return data;
  } catch (err) {
    logger.error('detectLanguage failed', { error: err.message });
    return {
      language: 'en',
      confidence: 0,
      isCodeMixed: false,
    };
  }
}

/**
 * Extract healthcare entities from text.
 */
async function extractEntities(text, language) {
  const client = getNlpClient();
  try {
    const data = await callWithRetry(() =>
      client.post(API_ENDPOINTS.NLP.EXTRACT_ENTITIES, { text, language })
    );
    return data;
  } catch (err) {
    logger.error('extractEntities failed', { error: err.message });
    return {
      symptoms: [],
      diseases: [],
      medicines: [],
      doctors: [],
      hospitals: [],
      bodyParts: [],
      durations: [],
    };
  }
}

/**
 * Classify the intent of a healthcare query.
 */
async function classifyIntent(text, language) {
  const client = getNlpClient();
  try {
    const data = await callWithRetry(() =>
      client.post(API_ENDPOINTS.NLP.CLASSIFY_INTENT, { text, language })
    );
    return data;
  } catch (err) {
    logger.error('classifyIntent failed', { error: err.message });
    return {
      intent: 'unknown',
      confidence: 0,
    };
  }
}

/**
 * Generate a response to the healthcare query using the NLP engine.
 */
async function generateResponse(text, language, entities, intent, conversationHistory) {
  const client = getNlpClient();
  try {
    const data = await callWithRetry(() =>
      client.post(API_ENDPOINTS.NLP.GENERATE_RESPONSE, {
        text,
        language,
        entities,
        intent,
        conversationHistory,
      })
    );
    return data;
  } catch (err) {
    logger.error('generateResponse failed', { error: err.message });
    return {
      response: 'I apologize, but I am unable to process your query at the moment. Please try again later.',
      responseLanguage: language || 'en',
      ragSources: [],
    };
  }
}

/**
 * Process a voice input and return text + analysis.
 */
async function processVoice(audioBuffer, mimeType) {
  const client = getNlpClient();
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('audio', audioBuffer, {
      filename: 'audio.wav',
      contentType: mimeType || 'audio/wav',
    });

    const data = await callWithRetry(() =>
      client.post(API_ENDPOINTS.NLP.PROCESS_VOICE, form, {
        headers: form.getHeaders(),
        timeout: 60000,
      })
    );
    return data;
  } catch (err) {
    logger.error('processVoice failed', { error: err.message });
    return {
      text: '',
      language: 'en',
      error: 'Voice processing failed',
    };
  }
}

/**
 * Full pipeline: detect language → extract entities → classify intent → generate response.
 */
async function processQuery(text, preferredLanguage, conversationHistory) {
  const startTime = Date.now();

  // Step 1: Detect language
  const langResult = await detectLanguage(text);
  const detectedLanguage = langResult.language || preferredLanguage || 'en';
  const isCodeMixed = langResult.isCodeMixed || false;

  // Step 2 & 3: Extract entities and classify intent in parallel
  const [entitiesResult, intentResult] = await Promise.all([
    extractEntities(text, detectedLanguage),
    classifyIntent(text, detectedLanguage),
  ]);

  // Step 4: Generate response
  const responseResult = await generateResponse(
    text,
    detectedLanguage,
    entitiesResult,
    intentResult.intent,
    conversationHistory
  );

  const processingTime = Date.now() - startTime;

  return {
    detectedLanguage,
    isCodeMixed,
    extractedEntities: {
      symptoms: entitiesResult.symptoms || [],
      diseases: entitiesResult.diseases || [],
      medicines: entitiesResult.medicines || [],
      doctors: entitiesResult.doctors || [],
      hospitals: entitiesResult.hospitals || [],
      bodyParts: entitiesResult.bodyParts || [],
      durations: entitiesResult.durations || [],
    },
    classifiedIntent: intentResult.intent || 'unknown',
    intentConfidence: intentResult.confidence || 0,
    aiResponse: responseResult.response || '',
    responseLanguage: responseResult.responseLanguage || detectedLanguage,
    ragSources: responseResult.ragSources || [],
    processingTime,
  };
}

module.exports = {
  detectLanguage,
  extractEntities,
  classifyIntent,
  generateResponse,
  processVoice,
  processQuery,
};
