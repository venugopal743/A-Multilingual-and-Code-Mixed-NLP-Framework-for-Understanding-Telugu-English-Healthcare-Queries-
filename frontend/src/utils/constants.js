/**
 * @file constants.js
 * @description Application-wide constants, sample data, language codes,
 *              intent categories, and mock data for UI testing.
 */

/** Supported languages with metadata */
export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'auto', label: 'Auto-detect', nativeLabel: 'Auto', flag: '🌐' },
];

/** Intent categories recognized by the NLP engine */
export const INTENT_CATEGORIES = [
  { id: 'symptom_description', label: 'Symptom Description', color: '#0EA5E9' },
  { id: 'diagnosis_inquiry', label: 'Diagnosis Inquiry', color: '#14B8A6' },
  { id: 'medication_query', label: 'Medication Query', color: '#6366F1' },
  { id: 'appointment_booking', label: 'Appointment Booking', color: '#f59e0b' },
  { id: 'emergency_report', label: 'Emergency Report', color: '#ef4444' },
  { id: 'preventive_care', label: 'Preventive Care', color: '#22c55e' },
  { id: 'lab_results', label: 'Lab Results Inquiry', color: '#8b5cf6' },
  { id: 'general_health', label: 'General Health Info', color: '#64748b' },
];

/** Medical entity types for NER */
export const ENTITY_TYPES = [
  { id: 'SYMPTOM', label: 'Symptom', color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'DISEASE', label: 'Disease', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'MEDICATION', label: 'Medication', color: '#6366F1', bgColor: '#eef2ff' },
  { id: 'BODY_PART', label: 'Body Part', color: '#14B8A6', bgColor: '#f0fdfa' },
  { id: 'DOSAGE', label: 'Dosage', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'DURATION', label: 'Duration', color: '#0EA5E9', bgColor: '#f0f9ff' },
  { id: 'TEST', label: 'Medical Test', color: '#ec4899', bgColor: '#fdf2f8' },
];

/** Dashboard stat values */
export const STATS = [
  { label: 'Medical Records Processed', value: 6500, suffix: '+', icon: 'records' },
  { label: 'Languages Supported', value: 3, suffix: '', icon: 'languages' },
  { label: 'Intent Categories', value: 8, suffix: '', icon: 'intents' },
  { label: 'Entity Types', value: 7, suffix: '', icon: 'entities' },
];

/** Feature cards for homepage */
export const FEATURES = [
  {
    id: 'multilingual',
    title: 'Multilingual Support',
    description: 'Process healthcare queries in Telugu, Hindi, English, and code-mixed text seamlessly with advanced language detection.',
    icon: 'FaLanguage',
    color: 'primary',
  },
  {
    id: 'ner',
    title: 'Medical NER',
    description: 'Extract medical entities — symptoms, diseases, medications, body parts, dosages — with fine-tuned transformer models.',
    icon: 'FaStethoscope',
    color: 'teal',
  },
  {
    id: 'symptom',
    title: 'Symptom Extraction',
    description: 'Identify and normalize symptoms from conversational text, including colloquial and code-mixed expressions.',
    icon: 'FaHeartbeat',
    color: 'accent',
  },
  {
    id: 'intent',
    title: 'Intent Classification',
    description: 'Classify patient queries into 8 healthcare intent categories with high accuracy using BERT-based classifiers.',
    icon: 'FaBrain',
    color: 'primary',
  },
  {
    id: 'rag',
    title: 'RAG Knowledge Base',
    description: 'Retrieval-Augmented Generation powered by a curated medical knowledge base for accurate, contextual responses.',
    icon: 'FaDatabase',
    color: 'teal',
  },
  {
    id: 'voice',
    title: 'Voice I/O',
    description: 'Speak your symptoms in any supported language. Voice input via Whisper, text-to-speech output for accessibility.',
    icon: 'FaMicrophone',
    color: 'accent',
  },
];

/** Code-mixed example queries for showcasing the feature */
export const CODE_MIXED_EXAMPLES = [
  {
    text: 'Naku morning nunchi headache ga undi, and slight fever kuda undi',
    language: 'Telugu-English Code-Mixed',
    translation: 'I have had a headache since morning, and I also have a slight fever',
  },
  {
    text: 'Mujhe kal se throat pain ho raha hai and breathing mein difficulty hai',
    language: 'Hindi-English Code-Mixed',
    translation: 'I have had throat pain since yesterday and difficulty in breathing',
  },
  {
    text: 'Doctor garu, naa sugar levels chala high vachaayi last test lo',
    language: 'Telugu-English Code-Mixed',
    translation: 'Doctor, my sugar levels came very high in the last test',
  },
];

/** Pipeline steps for "How It Works" section */
export const PIPELINE_STEPS = [
  { step: 1, title: 'Patient Query', description: 'User submits a healthcare query via text or voice in any language', icon: 'FaUser' },
  { step: 2, title: 'Language Detection', description: 'Automatic detection of language and code-mixing patterns', icon: 'FaGlobe' },
  { step: 3, title: 'NLP Processing', description: 'Tokenization, normalization, and preprocessing of the query', icon: 'FaCogs' },
  { step: 4, title: 'Named Entity Recognition', description: 'Extract medical entities: symptoms, diseases, medications', icon: 'FaSearch' },
  { step: 5, title: 'Intent Classification', description: 'Classify the query into one of 8 healthcare intent categories', icon: 'FaBrain' },
  { step: 6, title: 'RAG Retrieval', description: 'Retrieve relevant medical information from the knowledge base', icon: 'FaDatabase' },
  { step: 7, title: 'Response Generation', description: 'Generate an accurate, empathetic response in the user\'s language', icon: 'FaCommentMedical' },
];

/** Sample chat conversations for UI testing */
export const SAMPLE_QUERIES = [
  {
    id: 'q1',
    query: 'I have been experiencing severe headaches and dizziness for the past 3 days',
    language: 'en',
    response: 'I understand you\'re experiencing severe headaches and dizziness for the past 3 days. These symptoms could be related to several conditions including tension headaches, migraines, dehydration, or blood pressure changes.\n\n**Recommended Actions:**\n1. Monitor your blood pressure if possible\n2. Stay well hydrated — aim for 8 glasses of water daily\n3. Rest in a quiet, dark room when headaches are severe\n4. Avoid screen time for extended periods\n\n**When to seek immediate care:**\n- If headache is sudden and extremely severe ("thunderclap")\n- If accompanied by vision changes, numbness, or difficulty speaking\n- If fever above 102°F accompanies the headache\n\nWould you like me to help you find a nearby healthcare provider?',
    analysis: {
      detectedLanguage: { code: 'en', confidence: 0.99, label: 'English' },
      intent: { category: 'symptom_description', confidence: 0.94 },
      entities: [
        { text: 'severe headaches', type: 'SYMPTOM', start: 27, end: 43 },
        { text: 'dizziness', type: 'SYMPTOM', start: 48, end: 57 },
        { text: '3 days', type: 'DURATION', start: 71, end: 77 },
      ],
      symptoms: ['severe headaches', 'dizziness'],
    },
  },
  {
    id: 'q2',
    query: 'Naku rendu rojulga jalubu mariyu daggulu vasthunnayi, tablet emanna suggest cheyandi',
    language: 'te',
    response: 'మీకు జలుబు మరియు దగ్గు రెండు రోజులుగా ఉన్నాయని అర్థమైంది. ఈ లక్షణాలు సాధారణ శీతజలుబు (common cold) వల్ల కావచ్చు.\n\n**సూచనలు:**\n1. వేడి నీళ్ళు మరియు వేడి ద్రావకాలు తాగండి\n2. ఆవిరి పట్టండి (steam inhalation)\n3. విశ్రాంతి తీసుకోండి\n4. తేనె మరియు అల్లం రసం తీసుకోవచ్చు\n\n**⚠️ గమనిక:** నేను మందులు prescribe చేయలేను. దయచేసి సమీపంలోని వైద్యుడిని సంప్రదించండి.\n\nలక్షణాలు 5 రోజులకు మించి ఉంటే లేదా జ్వరం ఎక్కువగా ఉంటే వెంటనే డాక్టర్ ని సందర్శించండి.',
    analysis: {
      detectedLanguage: { code: 'te', confidence: 0.92, label: 'Telugu' },
      intent: { category: 'medication_query', confidence: 0.88 },
      entities: [
        { text: 'jalubu', type: 'SYMPTOM', start: 22, end: 28 },
        { text: 'daggulu', type: 'SYMPTOM', start: 37, end: 44 },
        { text: 'rendu rojulu', type: 'DURATION', start: 5, end: 17 },
      ],
      symptoms: ['cold/jalubu', 'cough/daggulu'],
    },
  },
  {
    id: 'q3',
    query: 'Mujhe kal se throat pain ho raha hai and breathing mein difficulty hai',
    language: 'hi-en',
    response: 'मैं समझ रहा हूँ कि आपको कल से गले में दर्द है और साँस लेने में कठिनाई हो रही है। ये लक्षण गंभीर हो सकते हैं।\n\n**⚠️ Important:** Breathing difficulty के साथ throat pain होना — यह तुरंत medical attention की ज़रूरत हो सकती है।\n\n**तुरंत ध्यान दें अगर:**\n- साँस लेने में बहुत ज़्यादा तकलीफ़ हो\n- बुखार 101°F से ऊपर हो\n- निगलने में बहुत कठिनाई हो\n- होंठ या नाखून नीले पड़ रहे हों\n\n**घरेलू उपचार:**\n1. गर्म पानी में नमक डालकर गरारे करें\n2. भाप लें (steam inhalation)\n3. गर्म तरल पदार्थ पीते रहें\n\nकृपया जल्द से जल्द डॉक्टर से मिलें, खासकर breathing difficulty के कारण।',
    analysis: {
      detectedLanguage: { code: 'hi-en', confidence: 0.87, label: 'Hindi-English Code-Mixed' },
      intent: { category: 'symptom_description', confidence: 0.91 },
      entities: [
        { text: 'throat pain', type: 'SYMPTOM', start: 18, end: 29 },
        { text: 'breathing mein difficulty', type: 'SYMPTOM', start: 45, end: 69 },
        { text: 'kal se', type: 'DURATION', start: 7, end: 13 },
        { text: 'throat', type: 'BODY_PART', start: 18, end: 24 },
      ],
      symptoms: ['throat pain', 'breathing difficulty'],
    },
  },
  {
    id: 'q4',
    query: 'What are the normal blood sugar levels? How often should I check?',
    language: 'en',
    response: 'Great question! Here are the standard blood sugar (glucose) level guidelines:\n\n**Fasting Blood Sugar:**\n- Normal: 70–99 mg/dL\n- Pre-diabetes: 100–125 mg/dL\n- Diabetes: 126 mg/dL or higher\n\n**Post-meal (2 hours after eating):**\n- Normal: Less than 140 mg/dL\n- Pre-diabetes: 140–199 mg/dL\n- Diabetes: 200 mg/dL or higher\n\n**HbA1c (3-month average):**\n- Normal: Below 5.7%\n- Pre-diabetes: 5.7%–6.4%\n- Diabetes: 6.5% or higher\n\n**Testing Frequency:**\n- If diabetic on insulin: 4-10 times per day\n- If diabetic on oral medication: 1-2 times per day\n- Pre-diabetic: Every 3-6 months (fasting + HbA1c)\n- Healthy adults: Annual checkup\n\nWould you like more information about managing blood sugar levels?',
    analysis: {
      detectedLanguage: { code: 'en', confidence: 0.98, label: 'English' },
      intent: { category: 'general_health', confidence: 0.93 },
      entities: [
        { text: 'blood sugar levels', type: 'TEST', start: 20, end: 38 },
      ],
      symptoms: [],
    },
  },
  {
    id: 'q5',
    query: 'Naku morning nunchi headache ga undi, and slight fever kuda undi',
    language: 'te-en',
    response: 'మీకు ఉదయం నుండి headache (తలనొప్పి) మరియు slight fever (తేలికపాటి జ్వరం) ఉన్నాయని అర్థమైంది.\n\n**సాధ్యమైన కారణాలు:**\n- Viral infection (వైరల్ ఇన్ఫెక్షన్)\n- Sinusitis\n- Dehydration\n- Stress or tension headache\n\n**తీసుకోవలసిన జాగ్రత్తలు:**\n1. Body temperature check చేయండి\n2. విశ్రాంతి తీసుకోండి\n3. Plenty of fluids — ఎక్కువగా నీళ్ళు తాగండి\n4. Light food తినండి\n\n**Doctor ని సంప్రదించాల్సిన సమయం:**\n- Fever 102°F కంటే ఎక్కువ ఉంటే\n- Headache చాలా severe గా ఉంటే\n- Neck stiffness ఉంటే\n- 2 రోజులకు మించి symptoms ఉంటే\n\nమీరు OTC paracetamol తీసుకోవచ్చు, కానీ doctor consultation recommend చేస్తాను.',
    analysis: {
      detectedLanguage: { code: 'te-en', confidence: 0.89, label: 'Telugu-English Code-Mixed' },
      intent: { category: 'symptom_description', confidence: 0.92 },
      entities: [
        { text: 'headache', type: 'SYMPTOM', start: 24, end: 32 },
        { text: 'slight fever', type: 'SYMPTOM', start: 44, end: 56 },
        { text: 'morning nunchi', type: 'DURATION', start: 5, end: 19 },
      ],
      symptoms: ['headache/తలనొప్పి', 'fever/జ్వరం'],
    },
  },
];

/** Dashboard mock statistics */
export const DASHBOARD_STATS = {
  totalQueries: 12847,
  avgResponseTime: 1.2,
  accuracyRate: 94.7,
  activeUsers: 342,
  languageDistribution: [
    { language: 'English', count: 5200, percentage: 40.5 },
    { language: 'Hindi', count: 4100, percentage: 31.9 },
    { language: 'Telugu', count: 2300, percentage: 17.9 },
    { language: 'Code-Mixed', count: 1247, percentage: 9.7 },
  ],
  intentDistribution: [
    { intent: 'Symptom Description', count: 4200 },
    { intent: 'Medication Query', count: 2800 },
    { intent: 'General Health', count: 2100 },
    { intent: 'Diagnosis Inquiry', count: 1500 },
    { intent: 'Preventive Care', count: 1000 },
    { intent: 'Appointment Booking', count: 600 },
    { intent: 'Lab Results', count: 400 },
    { intent: 'Emergency Report', count: 247 },
  ],
  recentActivity: [
    { time: '2 min ago', query: 'headache and fever symptoms', lang: 'English', intent: 'Symptom Description' },
    { time: '5 min ago', query: 'sugar level check kab karein', lang: 'Hindi-English', intent: 'Lab Results' },
    { time: '8 min ago', query: 'naku chest pain vasthondi', lang: 'Telugu-English', intent: 'Emergency Report' },
    { time: '12 min ago', query: 'What is the dosage for metformin?', lang: 'English', intent: 'Medication Query' },
    { time: '15 min ago', query: 'BP ki normal range kya hoti hai', lang: 'Hindi-English', intent: 'General Health' },
  ],
};

/** Team members info */
export const TEAM_MEMBERS = [
  { name: 'Research Team', role: 'NLP & Machine Learning', avatar: '🧑‍🔬' },
  { name: 'Engineering Team', role: 'Full-Stack Development', avatar: '👨‍💻' },
  { name: 'Medical Advisors', role: 'Clinical Validation', avatar: '👨‍⚕️' },
  { name: 'Linguistics Team', role: 'Multilingual Data Curation', avatar: '📚' },
];

/** Technology stack */
export const TECH_STACK = [
  { category: 'Frontend', items: ['React.js', 'Tailwind CSS', 'Framer Motion', 'Vite'] },
  { category: 'Backend', items: ['Flask', 'FastAPI', 'Python', 'REST APIs'] },
  { category: 'NLP Engine', items: ['Hugging Face Transformers', 'spaCy', 'BERT', 'XLM-RoBERTa'] },
  { category: 'Data & Storage', items: ['MongoDB', 'FAISS', 'ChromaDB', 'Redis'] },
  { category: 'AI/ML', items: ['PyTorch', 'Scikit-learn', 'LangChain', 'RAG Pipeline'] },
  { category: 'Voice', items: ['OpenAI Whisper', 'Web Speech API', 'gTTS', 'pyttsx3'] },
];

/** Navigation links */
export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/chat', label: 'AI Assistant' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/about', label: 'About' },
];
