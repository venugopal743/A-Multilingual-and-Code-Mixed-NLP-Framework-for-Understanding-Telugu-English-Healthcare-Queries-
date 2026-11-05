const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'hi-en', name: 'Hindi-English (Code-Mixed)' },
  { code: 'ta-en', name: 'Tamil-English (Code-Mixed)' },
  { code: 'te-en', name: 'Telugu-English (Code-Mixed)' },
  { code: 'bn-en', name: 'Bengali-English (Code-Mixed)' },
];

const INTENT_CATEGORIES = [
  'symptom_inquiry',
  'disease_information',
  'medicine_inquiry',
  'doctor_search',
  'hospital_search',
  'appointment_booking',
  'emergency',
  'diet_nutrition',
  'mental_health',
  'insurance_query',
  'lab_test_inquiry',
  'general_health',
  'side_effects',
  'dosage_inquiry',
  'prevention',
  'first_aid',
  'unknown',
];

const ENTITY_TYPES = [
  'symptom',
  'disease',
  'medicine',
  'doctor',
  'hospital',
  'body_part',
  'duration',
  'dosage',
  'lab_test',
  'procedure',
  'specialty',
];

const API_ENDPOINTS = {
  NLP: {
    DETECT_LANGUAGE: '/api/v1/detect-language',
    EXTRACT_ENTITIES: '/api/v1/extract-entities',
    CLASSIFY_INTENT: '/api/v1/classify-intent',
    GENERATE_RESPONSE: '/api/v1/generate-response',
    PROCESS_VOICE: '/api/v1/process-voice',
    HEALTH: '/health',
  },
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const BCRYPT_SALT_ROUNDS = 12;

module.exports = {
  SUPPORTED_LANGUAGES,
  INTENT_CATEGORIES,
  ENTITY_TYPES,
  API_ENDPOINTS,
  PAGINATION,
  BCRYPT_SALT_ROUNDS,
};
