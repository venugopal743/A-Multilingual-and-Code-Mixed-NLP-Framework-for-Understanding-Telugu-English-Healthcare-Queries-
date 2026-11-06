import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeartbeat,
  FaProjectDiagram,
  FaTable,
  FaDatabase,
  FaShieldAlt,
  FaCheckCircle,
  FaBrain,
  FaMicrophone,
  FaLanguage,
  FaStethoscope,
  FaPills,
  FaSearch,
  FaRobot,
  FaVolumeUp,
  FaArrowDown,
  FaInfoCircle
} from 'react-icons/fa';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' or 'table'
  const [selectedNode, setSelectedNode] = useState(null);

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
      inputData: 'Raw Audio (.wav/.webm) or Typed Text',
      outputData: 'Standardized String Query + Audio Buffer',
      latency: '~120ms (Whisper)'
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
      inputData: 'Raw Query String',
      outputData: 'Language ID, is_code_mixed flag, token script distribution',
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
      inputData: 'Tokenized multi-script query',
      outputData: 'Clean Normalized Indic & Romanized tokens',
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
      description: 'Pre-trained on 17 Indian languages and English to produce rich cross-lingual semantic embeddings that bridge native scripts and code-mixed phonetics.',
      inputData: 'Normalized Indian & English tokens',
      outputData: '768-dimensional contextual hidden states',
      latency: '18ms'
    },
    {
      id: 'extraction_layer',
      title: '5. Dual Extraction: Medical NER & Intent',
      model: 'XLM-RoBERTa + Fine-Tuned MuRIL',
      category: 'Cognitive Extraction Layer',
      color: 'border-rose-500 bg-rose-50/70 text-rose-900',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: FaStethoscope,
      description: 'Simultaneously extracts 7 clinical entity classes (symptoms, diseases, medicines, body parts, durations) and classifies 8 healthcare intent classes.',
      inputData: 'Contextual representation vectors',
      outputData: 'Entity Spans with confidence + Intent probability vector',
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
      inputData: 'Dense query embedding from multilingual-e5-base',
      outputData: 'Top-3 relevant medical records with cosine relevance scores',
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
      description: 'Generates explainable answers in the user’s preferred language (Telugu/Hindi/English) grounded strictly on retrieved medical guidelines with safety disclaimers.',
      inputData: 'Entities + Intent + Retrieved Knowledge Snippets',
      outputData: 'Multilingual Clinical Text + Explainability Breakdown',
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
      description: 'Converts generated Telugu, Hindi, or English medical responses into natural spoken voice for enhanced patient accessibility.',
      inputData: 'Response text string in Telugu/Hindi/English',
      outputData: 'Natural Indian-language synthesized audio stream',
      latency: '90ms'
    }
  ];

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-4">
          <FaHeartbeat className="text-teal-600" />
          <span>Research & Engineering Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          A Multilingual and Code-Mixed NLP Framework for Healthcare Queries
        </h1>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
          Bridging the communication gap between patients and digital healthcare systems across India
          by addressing linguistic diversity, script mixing, and medical terminology extraction.
        </p>

        {/* View Switcher Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl mt-8 border border-slate-200">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'diagram'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaProjectDiagram />
            <span>Interactive Architecture Flowchart</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaTable />
            <span>Model Registry Matrix</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Architecture Diagram Flowchart */}
      {activeTab === 'diagram' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaProjectDiagram className="text-teal-600" />
                <span>End-to-End Neural Architecture Flowchart</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click any pipeline stage below to inspect its mathematical inputs, underlying transformer, and outputs.
              </p>
            </div>
            <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 font-bold self-start sm:self-auto">
              8 Pipeline Stages • Verified
            </span>
          </div>

          {/* Visual Architecture Flowchart Blocks */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {architectureNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const IconComponent = node.icon;

              return (
                <div key={node.id} className="relative">
                  {/* Connecting Arrow between cards */}
                  {index > 0 && (
                    <div className="flex justify-center -my-1 py-1">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-teal-300" />
                        <FaArrowDown className="text-teal-500 text-xs -mt-1" />
                      </div>
                    </div>
                  )}

                  {/* Stage Card */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all shadow-sm ${
                      isSelected
                        ? 'ring-4 ring-teal-500/20 border-teal-600 shadow-md bg-white'
                        : `${node.color} hover:shadow-md`
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-slate-700">
                          <IconComponent className="text-xl text-teal-600" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {node.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {node.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${node.badgeColor}`}>
                          {node.model}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                          {node.latency}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {node.description}
                    </p>

                    {/* Detailed Inspector Drawer on Selection */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-200/80 grid sm:grid-cols-2 gap-3 text-xs"
                        >
                          <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                            <span className="font-semibold text-slate-500 block mb-1">Incoming Inputs:</span>
                            <span className="font-mono text-slate-800 text-[11px]">{node.inputData}</span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                            <span className="font-semibold text-slate-500 block mb-1">Generated Output:</span>
                            <span className="font-mono text-teal-700 font-semibold text-[11px]">{node.outputData}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Quick Tip on Flow */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
            <FaInfoCircle className="text-teal-600 text-lg flex-shrink-0" />
            <span>
              <strong>Cross-Lingual Execution:</strong> If the patient speaks in Romanized Telugu (e.g. <em>"Naaku 2 days nunchi fever undi"</em>), FastText tags the script, MuRIL produces code-mixed phonetic embeddings, XLM-RoBERTa extracts the symptoms, FAISS pulls clinical guidelines, and the response is synthesized in Telugu.
            </span>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Classic Model Registry Table */}
      {activeTab === 'table' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FaProjectDiagram className="text-teal-600" />
              <span>Target Architecture & Model Allocation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Exact machine learning specifications designed for cross-lingual accuracy and low latency.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/70 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">NLP Module</th>
                  <th className="py-3 px-6">Model</th>
                  <th className="py-3 px-6">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {models.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{row.module}</td>
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
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
    </div>
  );
}
