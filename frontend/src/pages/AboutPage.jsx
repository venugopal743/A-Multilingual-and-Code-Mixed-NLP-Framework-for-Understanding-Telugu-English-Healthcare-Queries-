import React from 'react';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaProjectDiagram,
  FaCode,
  FaDatabase,
  FaShieldAlt,
  FaCheckCircle,
  FaBrain
} from 'react-icons/fa';

export default function AboutPage() {
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
      </div>

      {/* Model & Architecture Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
      </div>

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
