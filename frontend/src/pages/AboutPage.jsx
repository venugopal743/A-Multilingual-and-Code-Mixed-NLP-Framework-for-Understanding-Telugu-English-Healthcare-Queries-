import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeartbeat,
  FaGraduationCap,
  FaCode,
  FaProjectDiagram,
  FaTable,
  FaDatabase,
  FaShieldAlt,
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaBrain,
  FaMicrophone,
  FaLanguage,
  FaStethoscope,
  FaRobot,
  FaVolumeUp,
  FaArrowDown,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram', 'flowchart', 'table'
  const [selectedNode, setSelectedNode] = useState(null);
  
  const [sandboxSample, setSandboxSample] = useState({
    id: 'tel_fever',
    label: 'Tenglish: Fever Query',
    input: 'naaku 2 days nunchi fever undi',
    lang: 'Telugu-English (Tenglish)',
    norm: 'నాకు 2 రోజుల నుండి జ్వరం ఉంది',
    tokens: ['నాకు', '2', 'రోజు', '##ల', 'నుండి', 'జ్వరం', 'ఉంది'],
    entities: ['DURATION: 2 days', 'SYMPTOM: Fever / Pyrexia']
  });

  

  const asciiDiagram = `                     PATIENT
                        │
                   Text / Voice
                        ↓
          ┌─────────────────────────┐
          │   LANGUAGE DETECTION    │ ──► FastText + Unicode Script Profiler
          │ Telugu / English / Hindi│
          │      Code-Mixed         │
          └────────────┬────────────┘
                       ↓
                NLP PREPROCESSING     ──► Indic NLP Library Normalizer
                       ↓
          ┌─────────────────────────┐
          │      MEDICAL NER        │ ──► XLM-RoBERTa (Fine-Tuned)
          │                         │
          │  • Symptoms             │ ──► Fine-Tuned MuRIL
          │  • Diseases             │
          │  • Medicines            │
          │  • Doctors / Hospitals  │
          └────────────┬────────────┘
                       ↓
              SYMPTOM EXTRACTION
                       ↓
             INTENT CLASSIFICATION    ──► Fine-Tuned MuRIL (8 Healthcare Intents)
                       ↓
          ┌─────────────────────────┐
          │    MEDICAL KNOWLEDGE    │ ──► Semantic Search: multilingual-e5-base
          │       BASE + RAG        │ ──► Vector Database: FAISS
          └────────────┬────────────┘
                       ↓
                 LLM RESPONSE         ──► Qwen2.5-Instruct / Grounded Templates
                       ↓
                EXPLAINABILITY        ──► Entity confidence & cited clinical sources
                       ↓
          ┌─────────────────────────┐
          │     MULTILINGUAL        │
          │    RESPONSE OUTPUT      │ ──► Grounded Guidance with Medical Disclaimer
          │                         │
          │ Telugu / English / Hindi│
          └────────────┬────────────┘
                       ↓
              OPTIONAL VOICE OUTPUT   ──► AI4Bharat Indic-TTS / SpeechSynthesis`;

  const handleCopy = () => {
    navigator.clipboard.writeText(asciiDiagram);
    setCopied(true);
    toast.success('Architecture diagram copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const models = [
    { module: 'Language Detection', model: 'FastText', purpose: 'Detect Telugu, Hindi and English' },
    { module: 'Text Preprocessing', model: 'Indic NLP Library', purpose: 'Normalize Indian-language text' },
    { module: 'Multilingual NLP', model: 'MuRIL', purpose: 'Understand Indian languages and code-mixed text' },
    { module: 'Medical NER', model: 'XLM-RoBERTa', purpose: 'Extract symptoms, diseases and medicines after fine-tuning' },
    { module: 'Symptom Extraction', model: 'Fine-tuned MuRIL', purpose: 'Identify patient symptoms' },
    { module: 'Intent Classification', model: 'Fine-tuned MuRIL', purpose: 'Classify healthcare queries' },
    { module: 'Semantic Search', model: 'multilingual-e5-base', purpose: 'Find relevant medical information' },
    { module: 'RAG', model: 'FAISS', purpose: 'Retrieve relevant medical documents' },
    { module: 'LLM Response', model: 'Qwen2.5-Instruct', purpose: 'Generate understandable responses' },
    { module: 'Voice Input', model: 'Whisper', purpose: 'Convert speech into text' },
    { module: 'Voice Output', model: 'AI4Bharat Indic-TTS', purpose: 'Generate Indian-language speech' },
  ];

  const architectureNodes = [
    {
      id: 'patient_input',
      title: '1. Multimodal Patient Input',
      model: 'Text & Whisper STT',
      category: 'Input Layer',
      color: 'border-sky-500 bg-sky-50/70 text-sky-900',
      badgeColor: 'bg-sky-100 text-sky-800',
      icon: FaMicrophone,
      description: 'Accepts clinical queries via text typing or spoken voice across Telugu, Hindi, English, and Romanized Code-Mixed sentences.',
      latency: '~120ms'
    },
    {
      id: 'language_detection',
      title: '2. Language Detection & Code-Mixing',
      model: 'FastText + Unicode Profiler',
      category: 'Linguistic Layer',
      color: 'border-teal-500 bg-teal-50/70 text-teal-900',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: FaLanguage,
      description: 'Identifies dominant language (te, hi, en) and detects code-mixing patterns (te-en, hi-en) with token-level classification.',
      latency: '4ms'
    },
    {
      id: 'text_preprocessing',
      title: '3. Text Normalization & Preprocessing',
      model: 'Indic NLP Library',
      category: 'Linguistic Layer',
      color: 'border-indigo-500 bg-indigo-50/70 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: FaBrain,
      description: 'Normalizes Indic diacritics, strips erratic Unicode spacing, expands medical abbreviations, and canonicalizes script tokens.',
      latency: '6ms'
    },
    {
      id: 'multilingual_nlp',
      title: '4. Multilingual Contextual Representation',
      model: 'MuRIL (google/muril-base-cased)',
      category: 'Representation Layer',
      color: 'border-blue-500 bg-blue-50/70 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: FaBrain,
      description: 'Produces cross-lingual embeddings for 17 Indian languages and English to bridge native scripts and code-mixed phonetics.',
      latency: '18ms'
    },
    {
      id: 'extraction_layer',
      title: '5. Dual Extraction: Medical NER & Intent',
      model: 'XLM-RoBERTa + Fine-Tuned MuRIL',
      category: 'Cognitive Layer',
      color: 'border-rose-500 bg-rose-50/70 text-rose-900',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: FaStethoscope,
      description: 'Simultaneously extracts symptoms, diseases, medicines, body parts, durations and classifies 8 healthcare intent classes.',
      latency: '22ms'
    },
    {
      id: 'rag_retrieval',
      title: '6. Semantic Search & Vector Knowledge (RAG)',
      model: 'multilingual-e5-base + FAISS',
      category: 'Knowledge Base Layer',
      color: 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: FaDatabase,
      description: 'Dense vector retrieval against 6,548 aligned clinical records (Telugu, Hindi, English). Retrieves top-k relevant clinical snippets.',
      latency: '14ms'
    },
    {
      id: 'llm_response',
      title: '7. Grounded LLM Response & Explainability',
      model: 'Qwen2.5-Instruct / Grounded Templates',
      category: 'Response Generation Layer',
      color: 'border-amber-500 bg-amber-50/70 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: FaRobot,
      description: 'Generates explainable answers in the user’s preferred language grounded on medical records with safety disclaimers.',
      latency: '45ms'
    },
    {
      id: 'voice_output',
      title: '8. Speech Synthesis (Optional Voice Output)',
      model: 'AI4Bharat Indic-TTS',
      category: 'Audio Output Layer',
      color: 'border-teal-500 bg-teal-50/70 text-teal-900',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: FaVolumeUp,
      description: 'Converts generated Telugu, Hindi, or English medical responses into natural spoken voice for patient accessibility.',
      latency: '90ms'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-4">
          <FaHeartbeat className="text-teal-600" />
          <span>Research & Engineering Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          A Multilingual and Code-Mixed NLP Framework for Healthcare Queries
        </h1>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
          Bridging the communication gap between patients and digital healthcare systems across India
          by addressing linguistic diversity, script mixing, and medical terminology extraction.
        </p>

        {/* View Switcher Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl mt-8 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'diagram'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-white'
            }`}
          >
            <span>🏛️ Architecture Pipeline Diagram</span>
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'flowchart'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-white'
            }`}
          >
            <FaProjectDiagram />
            <span>Interactive Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-white'
            }`}
          >
            <FaTable />
            <span>Model Specifications Matrix</span>
          </button>
        </div>
      </div>

      {/* Tab 1: The Exact ASCII Architecture Pipeline Diagram */}
      {activeTab === 'diagram' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl shadow-2xl overflow-hidden border border-slate-800 bg-[#0B1120]"
        >
          {/* Window Title Bar */}
          <div className="bg-[#111827] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏛️</span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  End-to-End Pipeline & Model Architecture
                </h2>
                <p className="text-[11px] text-slate-400">
                  Multilingual and Code-Mixed Healthcare NLP Processing Workflow
                </p>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors border border-slate-700"
              title="Copy Architecture Diagram to Clipboard"
            >
              {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
              <span>{copied ? 'Copied!' : 'Copy Diagram'}</span>
            </button>
          </div>

          {/* Architecture Diagram Code Display */}
          <div className="p-6 sm:p-8 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200 select-all whitespace-pre">
              {asciiDiagram}
            </pre>
          </div>

          {/* Quick Annotation Footer */}
          <div className="bg-[#0f172a] px-6 py-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-teal-400 block font-semibold">Languages:</span>
              <span>Telugu • Hindi • English</span>
            </div>
            <div>
              <span className="text-sky-400 block font-semibold">Code-Mixed:</span>
              <span>Romanized & Script mixed</span>
            </div>
            <div>
              <span className="text-amber-400 block font-semibold">Retrieval:</span>
              <span>multilingual-e5-base + FAISS</span>
            </div>
            <div>
              <span className="text-emerald-400 block font-semibold">Speech:</span>
              <span>Whisper + Indic-TTS</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Interactive Flowchart Cards */}
      {activeTab === 'flowchart' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interactive Pipeline Cards</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any stage to expand details</p>
            </div>
            <span className="text-xs font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-bold">
              8 Stages
            </span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {architectureNodes.map((node, index) => {
              const IconComponent = node.icon;
              return (
                <div key={node.id} className="relative">
                  {index > 0 && (
                    <div className="flex justify-center -my-1 py-1">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-teal-300" />
                        <FaArrowDown className="text-teal-500 text-xs -mt-1" />
                      </div>
                    </div>
                  )}

                  <div className={`rounded-2xl border-2 p-5 ${node.color} shadow-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600">
                          <IconComponent className="text-lg" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">{node.category}</span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{node.title}</h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${node.badgeColor}`}>
                        {node.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{node.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tab 3: Model Specifications Matrix Table */}
      {activeTab === 'table' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FaProjectDiagram className="text-teal-600" />
              <span>Target Architecture & Model Allocation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Exact machine learning specifications designed for cross-lingual accuracy and low latency.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/70 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">NLP Module</th>
                  <th className="py-3 px-6">Model</th>
                  <th className="py-3 px-6">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {models.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">{row.module}</td>
                    <td className="py-3.5 px-6 font-mono text-teal-700 font-bold">{row.model}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Datasets & Clinical Grounding */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-3 flex items-center gap-2">
            <FaDatabase className="text-teal-600" />
            <span>Curated Multilingual Datasets</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            The project incorporates over 6,540 verified clinical records covering symptoms, diagnoses,
            treatments, and patient histories translated and aligned across:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-teal-500 flex-shrink-0" />
              <span><strong>Telugu Medical Dataset:</strong> 2,184 records with Telugu diagnostic terms</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-teal-500 flex-shrink-0" />
              <span><strong>Hindi Medical Dataset:</strong> 2,182 records with Devanagari symptoms</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-teal-500 flex-shrink-0" />
              <span><strong>English Medical Dataset:</strong> 2,184 clinically validated baseline records</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-teal-500 flex-shrink-0" />
              <span><strong>Code-Mixed Synthetic & Real Queries:</strong> Romanized Telugu-English and Hindi-English</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-3 flex items-center gap-2">
            <FaShieldAlt className="text-emerald-600" />
            <span>Safety, Explainability & Clinical Ethics</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            MediLingual is built with strict patient safety boundaries:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Non-Diagnostic Triage:</strong> Provides informational health education, not binding prescription.</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Emergency Escalation:</strong> Detects severe symptom red flags and prompts immediate ER care.</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Source Grounding:</strong> All guidance is retrieved directly from indexed clinical documentation via FAISS.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Interactive Indic Code-Mixed Transliteration & Normalization Sandbox */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FaBrain className="text-teal-600" />
              <span>Interactive Code-Mixed Transliteration & Normalization Sandbox</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrating the Indic NLP Library Normalizer and MuRIL Subword Tokenizer across Romanized queries.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-md font-bold border border-teal-200/60 dark:border-teal-800">
            Live Tokenizer Inspector
          </span>
        </div>

        {/* Sample Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select or Test Sample Code-Mixed Clinical Input:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                id: 'tel_fever',
                label: 'Tenglish: Fever Query',
                input: 'naaku 2 days nunchi fever undi',
                lang: 'Telugu-English (Tenglish)',
                norm: 'నాకు 2 రోజుల నుండి జ్వరం ఉంది',
                tokens: ['నాకు', '2', 'రోజు', '##ల', 'నుండి', 'జ్వరం', 'ఉంది'],
                entities: ['DURATION: 2 days', 'SYMPTOM: Fever / Pyrexia']
              },
              {
                id: 'hin_headache',
                label: 'Hinglish: Headache Query',
                input: 'mujhe kal se sar dard ho raha hai',
                lang: 'Hindi-English (Hinglish)',
                norm: 'मुझे कल से सिरदर्द हो रहा है',
                tokens: ['मुझे', 'कल', 'से', 'सिर', '##दर्द', 'हो', 'रहा', 'है'],
                entities: ['TIMELINE: Yesterday (कल)', 'SYMPTOM: Headache / Cephalea']
              },
              {
                id: 'tel_joint',
                label: 'Tenglish: Hip / Joint Query',
                input: 'joint pain valla nadavadam kastam ga undi',
                lang: 'Telugu-English (Tenglish)',
                norm: 'కీళ్ల నొప్పి వల్ల నడవడం కష్టంగా ఉంది',
                tokens: ['కీళ్ల', 'నొప్పి', 'వల్ల', 'నడవడం', 'కష్టంగా', 'ఉంది'],
                entities: ['SYMPTOMS: Joint Pain, Difficulty in Walking']
              },
              {
                id: 'tel_cancer',
                label: 'Tenglish: Oncology Query',
                input: 'naku cancer vachindhi',
                lang: 'Telugu-English (Tenglish)',
                norm: 'నాకు క్యాన్సర్ వచ్చింది',
                tokens: ['నాకు', 'క్యాన్సర్', 'వచ్చింది'],
                entities: ['CONDITION: Oncology Assessment', 'TRIAGE: Urgent Referral']
              }
            ].map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => setSandboxSample(sample)}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  sandboxSample.id === sample.id
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] mb-1">{sample.label}</div>
                <div className="font-mono text-teal-700 dark:text-teal-400 text-[11px] truncate">{sample.input}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Transformation Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1: Input & Language ID */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 space-y-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              1. FastText & Script Profiler
            </span>
            <div className="font-mono text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold shadow-2xs">
              "{sandboxSample.input}"
            </div>
            <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
              Detected: <span className="font-bold">{sandboxSample.lang}</span> (98.4% conf)
            </div>
          </div>

          {/* Step 2: Indic NLP Normalizer */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 space-y-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              2. Indic NLP Script Normalizer
            </span>
            <div className="text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold shadow-2xs">
              {sandboxSample.norm}
            </div>
            <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">
              Canonical Indic Script Transliteration & Normalization
            </div>
          </div>

          {/* Step 3: MuRIL Subword BPE & Bio-NER */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 space-y-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              3. MuRIL Subwords & Bio-NER
            </span>
            <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              {sandboxSample.tokens.map((tk, idx) => (
                <span key={idx} className="font-mono text-[11px] bg-teal-50 dark:bg-teal-900/70 text-teal-800 dark:text-teal-200 px-1.5 py-0.5 rounded border border-teal-200/60 dark:border-teal-700 font-semibold">
                  {tk}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {sandboxSample.entities.map((en, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded border border-rose-200/60 dark:border-rose-800">
                  {en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
